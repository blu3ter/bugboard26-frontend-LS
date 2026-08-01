import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersManagementView.css';

export const UsersManagementView: React.FC = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState('user');

  return (
    <div className="admin-users-view">
      <div className="admin-form-container">
        
        {/* Visual Panel */}
        <section className="visual-panel">
          <div className="visual-decoration-top"></div>
          <div className="visual-decoration-bottom"></div>
          
          <div className="visual-content">
            <div className="visual-logo">B</div>
            <h2 className="visual-title">Create a new member to BugBoard26 community.</h2>
            <p className="visual-subtitle">Start managing your software issues with the most efficient Material Design workflow.</p>
          </div>
          
          <div className="visual-footer">
            <p className="visual-footer-text">Everything starts with a report.</p>
          </div>
        </section>

        {/* Form Panel */}
        <section className="form-panel">
          <div className="form-header">
            <h1>bugboard26</h1>
            <p>Create account to new user. Fill all fields to procede.</p>
          </div>

          <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="nome">Name</label>
                <input 
                  className="form-input" 
                  id="nome" 
                  name="nome" 
                  placeholder="John" 
                  required 
                  type="text" 
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cognome">Surname</label>
                <input 
                  className="form-input" 
                  id="cognome" 
                  name="cognome" 
                  placeholder="Doe" 
                  required 
                  type="text" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input 
                className="form-input" 
                id="email" 
                name="email" 
                placeholder="john.doe@example.com" 
                required 
                type="email" 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                className="form-input" 
                id="password" 
                name="password" 
                required 
                type="password" 
              />
            </div>

            <div className="form-group">
              <span className="form-label" style={{ marginBottom: '12px' }}>Select type:</span>
              <div className="profile-selector-container">
                <label className="profile-option">
                  <input 
                    name="profile_type" 
                    type="radio" 
                    value="user" 
                    checked={profileType === 'user'}
                    onChange={() => setProfileType('user')}
                  />
                  <div className="profile-button">User</div>
                </label>
                <label className="profile-option">
                  <input 
                    name="profile_type" 
                    type="radio" 
                    value="admin"
                    checked={profileType === 'admin'}
                    onChange={() => setProfileType('admin')}
                  />
                  <div className="profile-button">Admin</div>
                </label>
              </div>
            </div>

            <button className="btn-submit" type="submit">
              <span className="material-symbols-outlined">person_add</span>
              SIGN UP
            </button>
          </form>

          <div className="return-link-container">
            <button className="return-link" onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">arrow_back</span>
              Return to dashboard
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};
