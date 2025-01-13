import React, { useState } from 'react';
import styles from './Create.module.css'; // Import the CSS module
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN } from '../constants';

const Create = ({ closeCreate }) => {
  const [flatName, setFlatName] = useState('');
  const [address, setAddress] = useState('');
  const [sharedCost, setSharedCost] = useState('');
  const navigate = useNavigate();

  const handleChangeFlatName = (event) => {
    setFlatName(event.target.value);
  };

  const handleChangeAddress = (event) => {
    setAddress(event.target.value);
  };

  const handleChangeSharedCost = (event) => {
    setSharedCost(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = {
      name: flatName,
      address: address,
      shared_cost: parseFloat(sharedCost), // Convert shared cost to a number
    };

    api
      .post('api/create-flat/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        },
      })
      .then((response) => {
        alert('Flat created successfully!');
        console.log('Response:', response.data);
        navigate('/game');
      })
      .catch((error) => {
        console.error('Error creating flat:', error.response?.data || error.message);
        alert(error.response?.data?.message || 'Failed to create flat. Please try again.');
      });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeButton} onClick={closeCreate}>&times;</button>
        <h2>Create Flat</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="flatName">Flat Name:</label>
            <input
              type="text"
              id="flatName"
              value={flatName}
              onChange={handleChangeFlatName}
              placeholder="Enter flat name"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address">Address:</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={handleChangeAddress}
              placeholder="Enter flat address"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="sharedCost">Shared Cost:</label>
            <input
              type="number"
              id="sharedCost"
              value={sharedCost}
              onChange={handleChangeSharedCost}
              placeholder="Enter shared cost"
              required
              className={styles.input}
              step="0.01"
              min="0"
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Flat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Create;
