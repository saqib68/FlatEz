import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import styles from './UserDashboard.module.css';
import api from '../api'; 

const UserDashboard = () => {
  const navigate = useNavigate(); // Initialize the navigation hook
  const [user, setUser] = useState({
    flatmateID: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '********',
    flatID: '',
    dob: '',
    contact: '',
  });

  const [account, setAccount] = useState({
    accnum: '',
    bankname: '',
    username: '',
    balance: '',
  });

  useEffect(() => {
    api
      .get('/api/flatmate-data/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access')}`,
        },
      })
      .then((response) => {
        const flatmateData = response.data;
        setUser({
          flatmateID: flatmateData.user.id,
          firstName: flatmateData.firstName,
          lastName: flatmateData.lastName,
          username: flatmateData.user.username,
          email: flatmateData.email,
          flatID: flatmateData.flat,
          dob: flatmateData.dob,
          contact: flatmateData.contact,
        });

        return api.get('/api/account-data/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
      })
      .then((response) => {
        const accountData = response.data;
        setAccount({
          accnum: accountData.accnum,
          bankname: accountData.bankname,
          username: accountData.username,
          balance: accountData.balance,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
      });
  }, []);

  const handleLeaveFlat = () => {
    if (window.confirm('Are you sure you want to leave this flat?')) {
      const formData = new FormData();
      formData.append('accnum', account.accnum);

      api
        .post('/api/leaveflat/', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(() => {
          alert('You have successfully left the flat.');
          setUser({ ...user, flatID: '' });
          navigate('/'); // Navigate to the homepage or another page
        })
        .catch((error) => {
          console.error('Error leaving flat:', error);
          alert('Failed to leave the flat.');
        });
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.dashboardTitle}>User Dashboard</h1>
      <div className={styles.userDetails}>
        <p><strong>Flatmate ID:</strong> {user.flatmateID}</p>
        <p><strong>First Name:</strong> {user.firstName}</p>
        <p><strong>Last Name:</strong> {user.lastName}</p>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Flat ID:</strong> {user.flatID || 'No flat assigned'}</p>
        <p><strong>Date of Birth:</strong> {user.dob}</p>
        <p><strong>Contact:</strong> {user.contact}</p>
      </div>
      <hr />
      <div className={styles.userDetails}>
        <h2>Account Details</h2>
        <p><strong>Account Number:</strong> {account.accnum}</p>
        <p><strong>Bank Name:</strong> {account.bankname}</p>
        <p><strong>Account Username:</strong> {account.username}</p>
        <p><strong>Balance:</strong> {account.balance}</p>
      </div>
      <button className={styles.editButton} onClick={() => navigate('/manageprofile')}>
        Edit Details
      </button>
      <br />
      {user.flatID && (
        <button className={styles.editButton} onClick={handleLeaveFlat}>
          Leave Flat
        </button>
      )}
    </div>
  );
};

export default UserDashboard;
