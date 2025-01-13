import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import styles from './LoginCard.module.css'; // Importing CSS Module

function LoginCard() {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    api.post('/api/token/', loginData) 
      .then((response) => {
        alert('Login successful!');
        console.log('Response:', response.data);

        localStorage.setItem(ACCESS_TOKEN, response.data.access); 
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh); 

        api.get('/api/flatmate-data/', {
          headers: {
            'Authorization': `Bearer ${response.data.access}`, 
          },
        })
          .then((flatmateResponse) => {
            console.log('FlatMate data:', flatmateResponse.data);

            if (flatmateResponse.data.flat === null) {
              navigate('/flathome');
            } else {
              navigate('/userdashboard');
            }
          })
          .catch((error) => {
            console.error('Error fetching FlatMate data:', error);
            alert('Failed to fetch your FlatMate data.');
          });

      })
      .catch((error) => {
        console.error('Error during login:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Login failed. Please try again.');
      });
  }

  return (
    <div className={styles.loginCard}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={loginData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className={styles.loginButton}>
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginCard;
