import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Marketplace from './Marketplace';
import Seller from './Seller';

function App() {
  const token = localStorage.getItem('access_token');
  const isLoggedIn = token !== null;

  const username = localStorage.getItem('username') || 'User';
  const role = localStorage.getItem('role') || '';

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('access_token');   // Remove the access token from local storage
      localStorage.removeItem('refresh_token');  // Remove the refresh token from local storage
      localStorage.removeItem('username');       // Remove the username from local storage
      localStorage.removeItem('role');           // Remove the role from local storage
      alert('Successfully logged out!');
      window.location.href = '/login';           // Navigate back to the login page
    }
  };

  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif', width: '100%', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Header Section */}
        {isLoggedIn && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#343a40', 
            padding: '10px 20px', 
            borderRadius: '6px', 
            marginBottom: '25px',
            color: 'white'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>StoreMesh</span>
            <span style={{ fontSize: '14px', marginRight: '20px', color: '#ffc107', fontWeight: '500' }}>
                 {username} <span style={{ opacity: 0.7 }}>({role})</span>
              </span>
            <button 
              onClick={handleLogout}
              style={{ 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        )}
        
        <Routes>
          {/* Login Path (1) */}
          <Route path="/login" element={<Login />} />
          
          {/* Buyer Path (2) */}
          <Route path="/marketplace" element={<Marketplace />} />
          
          {/* Seller Path (3) */}
          <Route path="/seller" element={<Seller />} />

          {/* Default Path */}
          <Route 
            path="*" 
            element={isLoggedIn ? <Navigate to="/marketplace" /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;