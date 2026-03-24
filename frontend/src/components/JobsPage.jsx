import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getActiveJobs, applyForJob, createJob } from './api';
import './JobsPage.css';

function CreateJobModal({ currentUser, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '', description: '', required_skills: '', 
    stipend_salary: '', expectations: '', qualification: '', application_deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.application_deadline) {
      setError('Title, Description, and Deadline are required.');
      return;
    }
    setLoading(true);
    try {
      await createJob({
        alumni_id: currentUser.id,
        ...formData
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jobs-modal-overlay" onClick={onClose}>
      <div className="jobs-modal-box" onClick={e => e.stopPropagation()}>
        <div className="jobs-modal-header">
          <h2>Post a Job</h2>
          <button className="jobs-modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="jobs-form">
          <input required placeholder="Job Title" className="jobs-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <textarea required placeholder="Job Description" className="jobs-textarea" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <input placeholder="Required Skills (e.g. React, Node)" className="jobs-input" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
          <input placeholder="Stipend / Salary" className="jobs-input" value={formData.stipend_salary} onChange={e => setFormData({...formData, stipend_salary: e.target.value})} />
          <textarea placeholder="Expectations (Roles & Responsibilities)" className="jobs-textarea" rows={3} value={formData.expectations} onChange={e => setFormData({...formData, expectations: e.target.value})} />
          <input placeholder="Qualification" className="jobs-input" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
          
          <label className="jobs-label">Application Deadline *</label>
          <input required type="datetime-local" className="jobs-input" value={formData.application_deadline} onChange={e => setFormData({...formData, application_deadline: e.target.value})} />
          
          {error && <p className="jobs-error">{error}</p>}
          <div className="jobs-modal-footer">
            <button type="submit" className="jobs-btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const currentUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('currentUser') || 'null'); } catch { return null; }
  })();

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await getActiveJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApply = async (jobId) => {
    if (!currentUser) return;
    setApplyingJobId(jobId);
    try {
      await applyForJob(jobId, { applicant_type: currentUser.type, applicant_id: currentUser.id });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting application');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="jobs-page">
      <div className="jobs-header-actions">
        <h1>Recent Opportunities</h1>
        {currentUser?.type === 'alumni' && (
          <div className="alumni-actions">
            <button className="jobs-btn-secondary" onClick={() => navigate(`/${username}/alumni-jobs`)}>
              My Dashboard
            </button>
            <button className="jobs-btn-primary" onClick={() => setShowPostModal(true)}>
              ➕ Post Job
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="jobs-loading">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="jobs-empty">No active job listings found.</p>
      ) : (
        <div className="jobs-list">
          {jobs.map(job => (
            <div key={job.job_id} className="job-card">
              <div className="job-card-header">
                {job.poster_avatar ? (
                  <img src={job.poster_avatar} alt="poster" className="job-avatar" />
                ) : (
                  <div className="job-avatar-placeholder">{job.poster_name?.[0]?.toUpperCase()}</div>
                )}
                <div>
                  <h3 className="job-title">{job.title}</h3>
                  <p className="job-company">{job.company_name} • Posted by {job.poster_name}</p>
                </div>
              </div>
              <p className="job-desc">{job.description}</p>
              
              <div className="job-badges">
                {job.stipend_salary && <span className="job-badge">💰 {job.stipend_salary}</span>}
                {job.required_skills && <span className="job-badge">🛠️ {job.required_skills}</span>}
                <span className="job-badge deadline">⏰ Deadline: {new Date(job.application_deadline).toLocaleString()}</span>
              </div>

              <div className="job-actions">
                <button 
                  className="jobs-btn-primary" 
                  onClick={() => handleApply(job.job_id)}
                  disabled={applyingJobId === job.job_id}
                >
                  {applyingJobId === job.job_id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPostModal && (
        <CreateJobModal 
          currentUser={currentUser} 
          onClose={() => setShowPostModal(false)}
          onCreated={loadJobs}
        />
      )}
    </div>
  );
}
