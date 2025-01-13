import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navigation.module.css";
import api from "../api"; // Custom API instance

function Navigation() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // State for login status
  const [isAdmin, setIsAdmin] = useState(false); // State for admin status
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch FlatMate data
    api
      .get("/api/flatmate-data/")
      .then((response) => {
        const flatmateData = response.data;
        console.log("FlatMate data:", flatmateData);

        // Check if the user is an admin
        if (flatmateData.isadmin) {
          setIsAdmin(true);
        }

        // Redirect logic if flat is not assigned
        if (flatmateData.flat === null) {
          navigate("/flathome");
        }
      })
      .catch((error) => {
        console.error("Error fetching FlatMate data:", error);
        alert("Failed to fetch your FlatMate data.");
      });
  }, [navigate]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleLoginLogout = () => {
    setIsLoggedIn(!isLoggedIn); // Toggle login status
  };

  return (
    <>
      <header className={styles.header}>
        <button className={styles.toggleButton} onClick={toggleVisibility}>
          {isVisible ? "Hide Menu" : "Show Menu"}
        </button>
        <div className={styles.loginLogout}>
          {isLoggedIn ? (
            <Link
              to="/"
              className={styles.toggleButton}
              onClick={handleLoginLogout}
            >
              Logout
            </Link>
          ) : (
            <Link to="/login" className={styles.navItem}>
              Login
            </Link>
          )}
        </div>
      </header>

      <div className={`${styles.sidebar} ${isVisible ? styles.show : ""}`}>

          
        <Link to="/userdashboard" className={styles.navItem}>
          User Dashboard
        </Link>
          
        <Link to="/flatdashboard" className={styles.navItem}>
          Flat Dashboard
        </Link>
        <Link to="/addsharedexpense" className={styles.navItem}>
          Add Shared Expense
        </Link>
        <Link to="/viewsharedexpense" className={styles.navItem}>
          View Shared Expense
        </Link>
        {isAdmin && (
          <Link to="/editsharedexpense" className={styles.navItem}>
            Edit Shared Expense
          </Link>
        )}
        <Link to="/partyfund" className={styles.navItem}>
          Generate Party Fund
        </Link>
        <Link to="/viewpartyfund" className={styles.navItem}>
          View Party Funds
        </Link>
        <Link to="/game" className={styles.navItem}>
         Play Game
        </Link>
        <Link to="/chat-anonymously" className={styles.navItem}>
          Chat Anonymously
        </Link>
         
        <Link to="/loan" className={styles.navItem}>
         Apply Loan
        </Link>
        <Link to="/viewloan" className={styles.navItem}>
          View Loans
        </Link>
        <Link to="/loan-history" className={styles.navItem}>
          Loan History
        </Link>
        {isAdmin && (
          <Link to="/addtask" className={styles.navItem}>
            Add Tasks
          </Link>
        )}
           <Link to="/viewtasks" className={styles.navItem}>
          View Tasks
        </Link>

        <Link to="/leaderboard" className={styles.navItem}>
          Flat Leaderboard
        </Link>
        <Link to="/notifications" className={styles.navItem}>
          Notifications
        </Link>
        <Link to="/transaction-history" className={styles.navItem}>
          Transaction History
        </Link>
        <Link to="/aboutus" className={styles.navItem}>
          About Us
        </Link>
      </div>
    </>
  );
}

export default Navigation;
