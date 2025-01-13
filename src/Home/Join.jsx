import React, { useState } from 'react';
import styles from './Join.module.css'; // Import the CSS module
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

const Join = ({ closeJoin }) => {
  const [flatName, setFlatName] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (event) => {
    setFlatName(event.target.value);
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = {
      flatName: flatName,
    };

    api
      .post('api/joinflat/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      })
      .then((response) => {
        alert('Successfully joined the flat!');
        console.log('Response:', response.data);
        navigate('/userdashboard');
      })
      .catch((error) => {
        console.error(
          'Error joining flat:',
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            'Failed to join the flat. Please try again.'
        );
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeButton} onClick={closeJoin}>
          &times;
        </button>

        <h2>Join a Flat</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="flatName">Flat Name:</label>
            <input
              type="text"
              id="flatName"
              value={flatName}
              onChange={handleChange}
              placeholder="Enter flat name to join"
              required
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Join Flat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Join;
