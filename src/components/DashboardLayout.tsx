import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // A simple way to get the title based on the route
  const getPageTitle = () => {
    if (location.pathname.includes('my-issues')) return 'Le Mie Issue';
    if (location.pathname.includes('all-issues')) return 'Tutte le Issue';
    if (location.pathname.includes('users')) return 'Gestione Utenti';
    return 'Dashboard';
  };

  // TO DO: Replace with actual authentication context logic
  const isAdmin = true; // Hardcoded to true so you can see the button

  const handleReportBug = () => {
    navigate('/dashboard/create-issue');
  };

  return (
    <div className="dashboard-root">
      {/* Sidebar Navigation */}
      <nav className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-avatar">B</div>
          <div className="logo-text">
            <h1>BugBoard26</h1>
            <p>Issue Management</p>
          </div>
        </div>

        <button className="btn-report-bug" onClick={handleReportBug}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 0' }}>add</span>
          Report Bug
        </button>

        <ul className="sidebar-nav-list">
          <li>
            <NavLink to="/dashboard/my-issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="material-symbols-outlined">dashboard</span>
              <span>My issue</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/all-issues" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="material-symbols-outlined">list_alt</span>
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
              <span className="material-symbols-outlined">help</span>
              <span>Help</span>
            </a>
          </li>
          <li>
            <a className="nav-link" href="#">
              <span className="material-symbols-outlined">logout</span>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Main Content Canvas */}
      <main className="dashboard-main">
        {/* Top App Bar */}
        <header className="dashboard-topbar">
          <h2 className="topbar-title">{getPageTitle()}</h2>
          <div className="topbar-actions">
            <button className="btn-icon">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="profile-avatar">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBis87CkE9qyDcWc8fR6Z8G3Ule7pXCxqtaUjoyjd2qEGCCzWouDyIn9uLtytL_dvigICoAXMAcnApUl9xNvJv9TAlkar-iPlEf3uXHMjjnc8g4NPR1TDF1ZWaxXhS22v-dQjigLhbSH-k6wAK9apl2dpu8bB9ojpvhYjEcQ_qM_dYX7B__zLoT-_L-bb-lSxiw4EB9bR2gvZ029EB5Sj2OtiQ1tNu2EDWIPZ4nGSv45QG1MKmOTDzDNF9mth94mt6TJ1jMFYqg5gw" 
                alt="User Profile" 
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
