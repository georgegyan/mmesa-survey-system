import React, { useState } from 'react';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple admin authentication (you can make this more secure later)
    if (credentials.username === 'admin' && credentials.password === 'mmesa2025') {
      localStorage.setItem('adminAuthenticated', 'true');
      window.location.href = '/admin';
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <h2>MMESA Admin Portal</h2>
          <p>Access the survey responses dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="form-input"
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="form-input"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login to Admin Dashboard
          </button>
        </form>

        <div className="login-info">
          <p><strong>Default Credentials:</strong></p>
          <p>Username: <code>admin</code></p>
          <p>Password: <code>mmesa2025</code></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;