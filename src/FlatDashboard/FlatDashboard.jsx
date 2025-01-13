import React, { useEffect, useState } from 'react';
import styles from './FlatDashboard.module.css';
import api from '../api'; // Ensure you have axios set up for API calls
import { ACCESS_TOKEN } from '../constants';

const FlatDashboard = () => {
  const [flat, setFlat] = useState({
    flatID: '',
    address: '',
    numberOfFlatmates: 0,
    flatmates: [], // Array to hold flatmate names
  });

  useEffect(() => {
    // Fetch flat details and flatmates
    api.get('/api/flat-details/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
      },
    })
      .then((response) => {
        const { flatID, address, numOfFlatmates, flatmates } = response.data;
        setFlat({
          flatID,
          address,
          numberOfFlatmates: numOfFlatmates,
          flatmates,
        });
      })
      .catch((error) => {
        console.error('Error fetching flat details:', error.response?.data || error.message);
        alert('Failed to fetch flat details. Please try again.');
      });
  }, []);

  return (
    <div className={styles.flatDashboard}>
      <h1 className={styles.flatDashboardTitle}>Flat Dashboard</h1>
      <div className={styles.flatDetails}>
        <p><strong>Flat ID:</strong> {flat.flatID}</p>
        <p><strong>Address:</strong> {flat.address}</p>
        <p><strong>Number of Flatmates:</strong> {flat.numberOfFlatmates}</p>
        <p><strong>Flatmates:</strong></p>
        <ol>
          {flat.flatmates.length > 0 ? (
            flat.flatmates.map((flatmate, index) => (
              <li key={index} className={styles.flatmateItem}>{flatmate}</li>
            ))
          ) : (
            <li className={styles.flatmateItem}>No flatmates found</li>
          )}
        </ol>
      </div>
      <button className={styles.editButton} onClick={() => alert('Edit functionality coming soon!')}>
        Edit Details
      </button>
    </div>
  );
};

export default FlatDashboard;
