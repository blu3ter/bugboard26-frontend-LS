import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../service/authService';
import titleImg from '../assets/title BugBoard26.png';
import { TutorialOverlay } from './tutorial/TutorialOverlay';
import { adminTutorialSteps, userTutorialSteps } from './tutorial/tutorialSteps';
import './DashboardLayout.css';

const FLOATING_BG_TAGS: Array<{
  label: string;
  style: React.CSSProperties;
}> = [
    { label: '#backend', style: { top: '6%', left: '4%', backgroundColor: 'rgba(37, 66, 160, 0.85)', animationDelay: '0s' } },
    { label: '#dangerous', style: { top: '4%', left: '34%', backgroundColor: 'rgba(204, 26, 40, 0.9)', animationDelay: '-3s' } },
    { label: '#closed', style: { top: '7%', left: '61%', backgroundColor: 'rgba(51, 65, 85, 0.9)', color: '#e2e8f0', animationDelay: '-7s' } },
    { label: '#hotfix', style: { top: '9%', right: '6%', backgroundColor: 'rgba(220, 38, 38, 0.9)', animationDelay: '-2s' } },
    { label: '#open', style: { top: '20%', left: '14%', backgroundColor: 'rgba(234, 88, 12, 0.9)', animationDelay: '-5s' } },
    { label: '#frontend', style: { top: '18%', right: '16%', backgroundColor: 'rgba(2, 132, 199, 0.9)', animationDelay: '-9s' } },
    { label: '#bug', style: { top: '28%', right: '4%', backgroundColor: 'rgba(185, 28, 28, 0.9)', animationDelay: '-4s' } },
    { label: '#urgent', style: { top: '33%', left: '3%', backgroundColor: 'rgba(225, 29, 72, 0.9)', animationDelay: '-11s' } },
    { label: '#meeting', style: { top: '41%', left: '22%', backgroundColor: 'rgba(245, 158, 11, 0.9)', color: '#000', fontWeight: 700, animationDelay: '-6s' } },
    { label: '#question', style: { top: '43%', right: '22%', backgroundColor: 'rgba(124, 58, 237, 0.9)', animationDelay: '-13s' } },
    { label: '#fast', style: { top: '53%', left: '5%', backgroundColor: 'rgba(13, 148, 136, 0.9)', animationDelay: '-8s' } },
    { label: '#feature', style: { top: '52%', right: '6%', backgroundColor: 'rgba(22, 163, 74, 0.9)', animationDelay: '-1s' } },
    { label: '#ui/ux', style: { top: '65%', left: '18%', backgroundColor: 'rgba(219, 39, 119, 0.9)', animationDelay: '-10s' } },
    { label: '#in progress', style: { top: '64%', right: '20%', backgroundColor: 'rgba(14, 165, 233, 0.9)', animationDelay: '-14s' } },
    { label: '#backend', style: { top: '74%', right: '5%', backgroundColor: 'rgba(29, 78, 216, 0.9)', animationDelay: '-4.5s' } },
    { label: '#frontend', style: { bottom: '18%', left: '4%', backgroundColor: 'rgba(2, 132, 199, 0.9)', animationDelay: '-12s' } },
    { label: '#feature', style: { bottom: '13%', left: '28%', backgroundColor: 'rgba(21, 128, 61, 0.9)', animationDelay: '-6.5s' } },
    { label: '#fast', style: { bottom: '12%', right: '26%', backgroundColor: 'rgba(13, 148, 136, 0.9)', animationDelay: '-2.5s' } },
    { label: '#devops', style: { bottom: '5%', left: '8%', backgroundColor: 'rgba(2, 132, 199, 0.9)', animationDelay: '-15s' } },
    { label: '#chill', style: { bottom: '5%', left: '44%', backgroundColor: 'rgba(217, 119, 6, 0.9)', animationDelay: '-8.5s' } },
    { label: '#bug', style: { bottom: '6%', right: '8%', backgroundColor: 'rgba(185, 28, 28, 0.9)', animationDelay: '-5.5s' } },
  ];

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);

  const user = authService.getUser();
  const userName = user?.name?.trim() || user?.email?.split('@')[0] || 'User';

  const getSubtitle = () => {
    if (location.pathname.includes('all-issues')) return 'Overview of all team issues.';
    if (location.pathname.includes('management')) return 'Workflow Review and Team Assignment Control Panel.';
    if (location.pathname.includes('users')) return 'System user management and configuration.';
    return 'Overview of your open issues.';
  };

  const isAdmin = user ? user.role === 'ADMIN' : true;

  const handleReportBug = () => {
    navigate('/dashboard/create-issue');
  };

  const handleHelp = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTutorial(true);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.clearSession();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.trim().substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userName);
  const roleDisplay = user?.role?.toUpperCase() === 'ADMIN' ? 'Admin' : 'User';

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <nav className="dashboard-sidebar">
        <div className="sidebar-header">
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

          {/* Admin Links */}
          {isAdmin && (
            <>
              <li>
                <NavLink to="/dashboard/management" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="material-symbols-outlined">rule</span>
                  <span>Issue Management</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>person_add</span>
                  <span>Create new user</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <ul className="sidebar-footer-list">
          <li>
            <a className="nav-link" href="#" onClick={handleHelp}>
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
        {/* Background Floating Tags Layer */}
        <div className="dashboard-bg-layer" aria-hidden="true">
          {FLOATING_BG_TAGS.map((tag, index) => (
            <div key={`${tag.label}-${index}`} className="dashboard-floating-tag" style={tag.style}>
              {tag.label}
            </div>
          ))}
        </div>

        {/* Top App Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-welcome">
            <h2 className="topbar-title">Welcome back, {userName}!</h2>
            <p className="topbar-subtitle">{getSubtitle()}</p>
          </div>
          <div className="topbar-actions">
            <div className="user-profile-container" title={`${userName} (${roleDisplay})`}>
              <div className="user-avatar-initials">
                {initials}
              </div>
              <span className={`user-role-badge ${roleDisplay === 'Admin' ? 'badge-admin' : 'badge-user'}`}>
                {roleDisplay}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Dynamic Content Area */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>

      {showTutorial && (
        <TutorialOverlay
          steps={user?.role === 'ADMIN' ? adminTutorialSteps : userTutorialSteps}
          onClose={() => setShowTutorial(false)}
        />
      )}
    </div>
  );
};
