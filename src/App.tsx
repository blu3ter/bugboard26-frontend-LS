import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { AllIssuesView } from './pages/AllIssuesView';
import { MyIssuesView } from './pages/MyIssuesView';
import { UsersManagementView } from './pages/UsersManagementView';
import { CreateIssueView } from './pages/CreateIssueView';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Dashboard Layout and nested routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Default dashboard view */}
        <Route index element={<Navigate to="my-issues" replace />} />
        <Route path="my-issues" element={<MyIssuesView />} />
        <Route path="all-issues" element={<AllIssuesView />} />
        <Route path="users" element={<UsersManagementView />} />
        <Route path="create-issue" element={<CreateIssueView />} />
      </Route>
    </Routes>
  );
}

export default App;
