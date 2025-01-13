import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router
import styles from './WebHome.module.css'; // Import CSS module

function WebHome() {
  return (
    <div className={styles.webhomeContainer}>
      <div className={styles.card}>
        <h1 className={styles.webhomeHeading}>Welcome to Flatez</h1>
        <div className={styles.webhomeLinks}>
          {/* Use Link components styled as buttons */}
          <Link to="/login" className={styles.button}>
            Login
          </Link>
          <Link to="/signup" className={styles.button}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WebHome;
