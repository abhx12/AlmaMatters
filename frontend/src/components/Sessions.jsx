import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApprovedSessions, requestSession } from "./api";
import "./HomePage.css"; // Reuse styling
import logo from '../assets/almamatterslogowithname.jpeg';

function RequestSessionModal({ currentUser, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) { setError("Title and description are required."); return; }
    if (!scheduledAt) { setError("Proposed date & time is required."); return; }
    
    setLoading(true);
    try {
      await requestSession({
        requester_type: currentUser.type,
        requester_id: currentUser.id,
        title,
        description,
        scheduled_at: scheduledAt
      });
      onCreated();
      onClose();
    } catch (e) {
      setError("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>Request to Organize a Session</h3>
        <input 
          type="text" 
          placeholder="Session Title" 
          className="comment-input" 
          style={{marginBottom: '10px'}}
          value={title} 
          onChange={e => setTitle(e.target.value)} 
        />
        <textarea
          className="post-textarea"
          placeholder="What will the session be about?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />
        <div style={{marginTop: '10px'}}>
           <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', color:'#64748B'}}>Proposed Date & Time</label>
           <input 
             type="datetime-local" 
             className="comment-input" 
             value={scheduledAt} 
             onChange={e => setScheduledAt(e.target.value)} 
           />
        </div>
        
        {error && <p className="error-msg">{error}</p>}
        <div className="modal-actions" style={{marginTop: '15px'}}>
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-post-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadSessions();
  }, [currentUser, navigate]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getApprovedSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => setShowModal(false);
  const handleCreated = () => {
     setSuccessMsg("Session request submitted successfully! Pending admin approval.");
     setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left"></div>
        <div className="nav-center">
          <img src={logo} alt="Logo" className="nav-logo" />
          <h1 className="nav-title">AlmaMatters Sessions</h1>
        </div>
        <div className="nav-right">
           <button className="icon-btn" title="Back to Home" onClick={() => navigate('/home')}>🏠</button>
        </div>
      </nav>

      <main className="feed-container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Upcoming Sessions</h2>
            <button 
               className="btn-primary" 
               style={{padding: '8px 16px', borderRadius: '8px'}}
               onClick={() => setShowModal(true)}
            >
               + Request Session
            </button>
        </div>

        {successMsg && <div className="success-banner" style={{backgroundColor:'#10B981', color:'white', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>{successMsg}</div>}

        {loading ? (
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <div className="feed-empty">
            <p>No upcoming sessions scheduled. Why not request one?</p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.session_id} className="post-card" style={{borderLeft: '5px solid #3B82F6'}}>
              <h3 style={{margin: '0 0 5px 0', fontSize: '1.2rem'}}>{session.title}</h3>
              <p className="post-meta" style={{margin: '0 0 10px 0'}}>
                 Organized by: <strong>{session.requester_name}</strong>
              </p>
              <p className="post-content">{session.description}</p>
              <div style={{marginTop: '15px', color: '#0369A1', fontWeight: 'bold'}}>
                 📅 {new Date(session.scheduled_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="bottom-nav">
        <button className="bottom-nav-item" onClick={() => navigate('/sessions')} style={{color: '#3b82f6'}}>
          <span className="nav-icon">📅</span>
          <span>Sessions</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate('/progress')}>
          <span className="nav-icon">📈</span>
          <span>Progress</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate('/jobs')}>
          <span className="nav-icon">💼</span>
          <span>Jobs</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate('/communities')}>
          <span className="nav-icon">🏘️</span>
          <span>Communities</span>
        </button>
      </footer>

      {showModal && (
        <RequestSessionModal 
           currentUser={currentUser} 
           onClose={handleModalClose} 
           onCreated={handleCreated} 
        />
      )}
    </div>
  );
}
