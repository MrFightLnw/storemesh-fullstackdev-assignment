import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false); // Switch between login and register forms
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('buyer'); // Default role is 'buyer'

  // Handle form submission for both login and registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      try {
        await axios.post('http://127.0.0.1:8000/api/auth/register/', {
          username,
          password,
          email,
          role
        });
        alert('Successfully registered! Please login.');
        setIsRegister(false); // Switch to login form after successful registration
      } catch (error: any) {
        alert('An error occurred while registering : ' + JSON.stringify(error.response?.data));
      }
    } else {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
          username,
          password
        });
       
        const accessToken = response.data.access;
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', username);
        const profileResponse = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userRole = profileResponse.data.role; // Obtain 'buyer' or 'seller' role
        localStorage.setItem('role', profileResponse.data.role);
        alert('Successfully Login!');
        
        if (userRole === 'seller') {
          window.location.href = '/seller'; 
        } else {
          window.location.href = '/marketplace'; 
        }

      } catch (error) {
        alert('Name or Password is incorrect. Please try again.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px'}}>
      <h2>{isRegister ? 'Register Page' : 'Login to StoreMesh'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username</label><br />
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' , boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' , boxSizing: 'border-box' }} />
        </div>

        {isRegister && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Email</label><br />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Role</label><br />
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
          </>
        )}

        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      <button onClick={() => setIsRegister(!isRegister)} style={{ width: '100%', padding: '8px', background: 'none', border: '1px solid #007bff', color: '#007bff', borderRadius: '4px', cursor: 'pointer' }}>
        {isRegister ? 'Have an account? Go to login.' : "Don't have an account? Register here."}
      </button>
    </div>
  );
}