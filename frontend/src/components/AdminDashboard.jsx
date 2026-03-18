import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingSessions, updateSessionStatus } from "./api";
import "./HomePage.css"; // Reuse styling where appropriate, or inline for dashboard

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    if (!currentUser || currentUser.type !== 'admin') {
      navigate('/admin-login');
      return;
    }
    loadPendingSessions();
  }, [currentUser, navigate]);

  const loadPendingSessions = async () => {
    setLoading(true);
    try {
      const data = await getPendingSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error("Failed to load sessions", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, status) => {
    try {
      await updateSessionStatus(sessionId, status);
      // Remove from pending list
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    } catch (e) {
      alert(`Failed to ${status} session.`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/admin-login');
  };

  return (
    <div className="homepage-container">
      <nav className="navbar" style={{backgroundColor: '#1E293B'}}>
        <div className="nav-left"></div>
        <div className="nav-center">
          <h1 className="nav-title" style={{color: 'white'}}>Admin Dashboard</h1>
        </div>
        <div className="nav-right">
          <button className="icon-btn" onClick={handleLogout} title="Logout" style={{color: 'white', backgroundColor: 'transparent', border:'none', fontSize: '1rem'}}>
            Log Out
          </button>
        </div>
      </nav>

      <main className="feed-container">
        <h2>Incoming Session Requests</h2>
        {loading ? (
          <p>Loading requests...</p>
        ) : sessions.length === 0 ? (
          <p>No pending session requests at the moment.</p>
        ) : (
          sessions.map(session => (
            <div key={session.session_id} className="post-card" style={{borderLeft: '5px solid #F59E0B'}}>
              <div className="post-header">
                <div>
                  <h3 style={{margin: '0 0 4px 0', fontSize: '1.1rem'}}>{session.title}</h3>
                  <p className="post-meta" style={{margin: 0}}>Requested by: <strong>{session.requester_name}</strong> ({session.requester_type})</p>
                </div>
              </div>
              <p className="post-content" style={{marginTop: '12px'}}>{session.description}</p>
              
              <div style={{marginTop: '12px', fontSize: '0.9rem', color: '#64748B'}}>
                <strong>Proposed Time: </strong> 
                {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'TBD'}
              </div>

              <div className="post-actions" style={{marginTop: '16px', gap: '8px'}}>
                <button 
                  className="btn-primary" 
                  style={{padding: '6px 16px', backgroundColor: '#10B981', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}} 
                  onClick={() => handleStatusUpdate(session.session_id, 'approved')}
                >
                  Accept & Publish
                </button>
                <button 
                  className="btn-secondary" 
                  style={{padding: '6px 16px', backgroundColor: '#EF4444', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer'}} 
                  onClick={() => handleStatusUpdate(session.session_id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
