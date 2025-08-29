import React from 'react';
import useAuth from '../hooks/useAuth';
// CORRECTED PATHS: Using './' to look inside the current 'pages' directory
import AdminDashboard from '../components/admin/AdminDashboard'; 
import UserDashboard from '../components/user/UserDashboard'; 

const DashboardPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.5rem' }}>Loading Dashboard...</div>;
  }

  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');

  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
};

export default DashboardPage;