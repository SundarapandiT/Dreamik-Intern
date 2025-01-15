import React, { useState, useEffect } from 'react';
import '../ResellerLogin.css';

function ResellerLogin({ onClose }) {
  const [resellers, setResellers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state for login status

  // Fetch reseller data from the JSON file
  useEffect(() => {
    fetch('/reseller/reseller.json')
      .then((response) => response.json())
      .then((data) => setResellers(data))
      .catch((error) => console.error('Error fetching reseller data:', error));
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Find the matching reseller
    const reseller = resellers.find(
      (res) => res.name === username && res.password === password
    );

    if (reseller) {
      setMessage(`Welcome, ${reseller.name}!`);
      setIsLoggedIn(true); // Set login status to true
    } else {
      setMessage('Invalid Username or Password!');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-window">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 id="heading">RESELLER LOGIN</h2>
        <h2 id="message">{message}</h2>

        {!isLoggedIn ? ( // Show the form only if the user is not logged in
          <form onSubmit={handleSubmit} id="loginform">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="resellername"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="resellerpassword"
            />
            <button type="submit" id="submit">SUBMIT</button>
          </form>
        ) : (
          <div className="welcome-message">
            <h3>You are now logged in!</h3>
          </div>
        )}

        {!isLoggedIn && (
          <div id="forgot">
            <a href="#">Forgot password?</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResellerLogin;
