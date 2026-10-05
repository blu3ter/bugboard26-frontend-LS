import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../service/authService';
import './UsersManagementView.css';

export const UsersManagementView: React.FC = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState('user');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await authService.executeRegisterWorkflow({
        firstName: nome,
        lastName: cognome,
        email,
        password,
        role: profileType,
      });
      setSuccess(true);
      setNome('');
      setCognome('');
      setEmail('');
      setPassword('');
      setProfileType('user');
    } catch (err: any) {
      setError(err.message || 'Error creating user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-users-view">
      <div className="admin-form-container">



        {/* Form Panel */}
        <section className="form-panel">
          <div className="form-header">
            <h1>New Member</h1>
            <p>Set up credentials and assign workspace permissions for the new user.</p>
          </div>

          {error && <div className="error-message" style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          {success && <div className="success-message" style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>User created successfully!</div>}

          <form className="admin-form" onSubmit={handleSubmit}>
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
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
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
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button className="btn-submit" type="submit" disabled={isLoading}>
              <span className="material-symbols-outlined">person_add</span>
              {isLoading ? 'CREATING...' : 'CREATE USER'}
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
