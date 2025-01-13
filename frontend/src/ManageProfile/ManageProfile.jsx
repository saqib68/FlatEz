import React, { useState, useEffect } from 'react';
import styles from './ManageProfile.module.css'; // Import the CSS module
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

function ManageProfile() {
  const navigate = useNavigate();

  // Initialize formData with existing user details, which will be fetched on component load
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    password: '',
    newPassword: '',
  });

  useEffect(() => {
    // Fetch user profile data from the API when the component is mounted
    api.get('api/flatmate-data/')
      .then((response) => {
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          contact: response.data.contact,
          password: '',  // We don't fetch the password for security reasons
          newPassword: '',
        });
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error.response?.data || error.message);
        alert('Failed to load profile. Please try again.');
      });
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the specific field in formData
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Send updated formData to the API
    api.put('api/user/update/', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
      },
    })
      .then((response) => {
        alert('Profile updated successfully!');
        console.log('Response:', response.data);

        // Optionally, redirect user after updating the profile
        navigate('/userdashboard');
      })
      .catch((error) => {
        console.error('Error:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Profile update failed. Please try again.');
      });
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h2 className={styles.textCenter}>Manage Profile</h2>
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
    
          <button type="submit" className={styles.btnSuccess}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default ManageProfile;
