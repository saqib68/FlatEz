import React, { useState } from 'react';
import styles from './SignUp.module.css'; // Import the CSS module
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

function SignIn() {
  const navigate = useNavigate();

  // Initialize formData with the user object and fields including accnum
  const [formData, setFormData] = useState({
    user: {
      username: '',
      password: '',
    },
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    contact: '',
    username: '',  // Separate username field
    password: '',  // Separate password field
    accnum: '', // Changed to accnum
  });

  function handleChange(event) {
    const { name, value } = event.target;
    // Update formData and sync values of username, password, and accnum between formData and user
    setFormData((prevData) => {
      // Check if the name is username, password, or accnum and update both the user object and the root object
      if (name === 'username' || name === 'password' || name === 'accnum') {
        return {
          ...prevData,
          user: {
            ...prevData.user,
            [name]: value, // Update user object with username, password, or accnum
          },
          [name]: value, // Also update the root object with the same value
        };
      }
      return {
        ...prevData,
        [name]: value, // For other fields, just update the root object
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Send formData directly to the API
    api.post('api/user/register/', formData)
      .then((response) => {
        alert('Sign Up successful!');
        console.log('Response:', response.data);

        // Store tokens in localStorage if returned by the backend
        localStorage.setItem(ACCESS_TOKEN, response.data.access_token);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh_token);

        // Redirect user after successful registration
        navigate('/login');
      })
      .catch((error) => {
        console.error('Error:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Sign Up failed. Please try again.');
      });
  }

  return (
    <div className={styles.signinContainer}>
      <div className={styles.signinCard}>
        <h2 className={styles.textCenter}>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName" className={styles.formLabel}>First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={styles.formControl}
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.formLabel}>Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={styles.formControl}
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={styles.formControl}
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.formControl}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.formControl}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="dob" className={styles.formLabel}>Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              className={styles.formControl}
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="contact" className={styles.formLabel}>Contact</label>
            <input
              type="text"
              id="contact"
              name="contact"
              className={styles.formControl}
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter your contact number"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="accnum" className={styles.formLabel}>Account Number</label>
            <input
              type="text"
              id="accnum"
              name="accnum"
              className={styles.formControl}
              value={formData.accnum}
              onChange={handleChange}
              placeholder="Enter your account number"
              required
            />
          </div>
          <button type="submit" className={styles.btnSuccess}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
