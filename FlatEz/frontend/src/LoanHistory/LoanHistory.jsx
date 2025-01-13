import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from './LoanHistory.module.css';

function LoanHistory(props) {
  const [loans, setLoans] = useState([]); // Store the fetched loan data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch loan history on component mount
  useEffect(() => {
    api
      .get("/api/loan-history/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Assuming token is stored in localStorage
        },
      })
      .then((response) => {
        setLoans(response.data); // Set loan data from API response
        console.log(response.data)
        setLoading(false); // End loading
      })
      .catch((error) => {
        setError("Failed to load loan history"); // Handle error
        setLoading(false); // End loading
        console.error("Error fetching loan history:", error);
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  return (
    <>
      <div className={styles.Title}>Loan History</div>
      <div className={styles.container}>
        <div className={styles.Name}>{props.username}</div>
        {loading && <p className={styles.loading}>Loading loan history...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.HistoryWrapper}>
          {loans.length === 0 && !loading && !error ? (
            <div className={styles.History}>No loan history available.</div>
          ) : (
            loans.slice(0, 9).map((loan, index) => ( // Only show the first 9 loans
              <div className={styles.History} key={index}>
                <div><strong>Loan Amount:</strong> {loan.amount}</div>
                <div><strong>Status:</strong> {loan.status || "Pending"}</div>
                <div><strong>Sender:</strong> {loan.sender_username}</div>
                <div><strong>Recipient:</strong> {loan.recipient_username}</div>
                <div><strong>Date:</strong> {loan.loan_date.substring(0,10)}</div> {/* Assuming 'loan_date' is part of loan data */}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default LoanHistory;
