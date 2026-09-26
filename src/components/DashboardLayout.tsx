import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import logoImg from '../assets/logobb26.png';
import titleImg from '../assets/title BugBoard26.png';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = authService.getUser();
  const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'User';

  const getSubtitle = () => {
    if (location.pathname.includes('all-issues')) return 'Overview of all team issues.';
    if (location.pathname.includes('users')) return 'System user management and configuration.';
    return 'Overview of your open issues.';
  };

  const isAdmin = user ? user.role === 'ADMIN' : true;

  const handleReportBug = () => {
    navigate('/dashboard/create-issue');
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.clearSession();
    navigate('/login');
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <nav className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logoImg} alt="BugBoard26 Logo" className="sidebar-logo-img" />
          <img src={titleImg} alt="BugBoard26" className="sidebar-title-img" />
        </div>

        <button className="btn-report-bug" onClick={handleReportBug}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>add</span>
          Report Bug
        </button>

        <ul className="sidebar-nav-list">
          <li>
            <NavLink to="/dashboard/my-issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="material-symbols-outlined">grid_view</span>
              <span>My issue</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/all-issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="material-symbols-outlined">view_list</span>
              <span>All issues</span>
            </NavLink>
          </li>

          {/* Admin Only Link */}
          {isAdmin && (
            <li>
              <NavLink to="/dashboard/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>person_add</span>
                <span>Create new user</span>
              </NavLink>
            </li>
          )}
        </ul>

        <ul className="sidebar-footer-list">
          <li>
            <a className="nav-link" href="#">
              <span className="material-symbols-outlined">help_outline</span>
              <span>Help</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              className="nav-link nav-logout-btn"
              onClick={handleLogout}
            >
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content Canvas */}
      <main className="dashboard-main">
        {/* Top App Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-welcome">
            <h2 className="topbar-title">Welcome back, {userName}!</h2>
            <p className="topbar-subtitle">{getSubtitle()}</p>
          </div>
          <div className="topbar-actions">
            <button className="btn-icon" title="Notifiche">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="profile-avatar">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBis87CkE9qyDcWc8fR6Z8G3Ule7pXCxqtaUjoyjd2qEGCCzWouDyIn9uLtytL_dvigICoAXMAcnApUl9xNvJv9TAlkar-iPlEf3uXHMjjnc8g4NPR1TDF1ZWaxXhS22v-dQjigLhbSH-k6wAK9apl2dpu8bB9ojpvhYjEcQ_qM_dYX7B__zLoT-_L-bb-lSxiw4EB9bR2gvZ029EB5Sj2OtiQ1tNu2EDWIPZ4nGSv45QG1MKmOTDzDNF9mth94mt6TJ1jMFYqg5gw"
                alt={userName}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Dynamic Content Area */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
