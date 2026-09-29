import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersManagementView.css';

export const UsersManagementView: React.FC = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState('user');

  return (
    <div className="admin-users-view">
      <div className="admin-form-container">



        {/* Form Panel */}
        <section className="form-panel">
          <div className="form-header">
            <h1>New Member</h1>
            <p>Set up credentials and assign workspace permissions for the new user.</p>
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
              <span className="form-label" style={{ marginBottom: '12px' }}>Role</span>
              <div className="role-cards-container">
                <label className="role-card-label">
                  <input
                    name="profile_type"
                    type="radio"
                    value="user"
                    checked={profileType === 'user'}
                    onChange={() => setProfileType('user')}
                    className="role-radio-input"
                  />
                  <div className="role-card">
                    <div className="role-card-icon">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="role-card-content">
                      <span className="role-card-title">Member</span>
                      <span className="role-card-desc">Basic level access. Can view, report and comment issues.</span>
                    </div>
                  </div>
                </label>
                <label className="role-card-label">
                  <input
                    name="profile_type"
                    type="radio"
                    value="admin"
                    checked={profileType === 'admin'}
                    onChange={() => setProfileType('admin')}
                    className="role-radio-input"
                  />
                  <div className="role-card">
                    <div className="role-card-icon">
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                    </div>
                    <div className="role-card-content">
                      <span className="role-card-title">Admin</span>
                      <span className="role-card-desc">Can view, report, comment and assign issues to members. Can create new users</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button className="btn-submit" type="submit">
              <span className="material-symbols-outlined">person_add</span>
              CREATE USER
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
