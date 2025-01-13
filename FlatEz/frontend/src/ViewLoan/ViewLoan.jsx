import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from "./ViewLoan.module.css"; // Import CSS module

function ViewLoan() {
  const [loans, setLoans] = useState([]); // Store fetched loan data
  const [error, setError] = useState(null); // Store error message
  const [loading, setLoading] = useState(false); // Loading state for async operations

  useEffect(() => {
    // Fetch loan data when component mounts
    setLoading(true); // Start loading
    api
      .get("/api/showloans/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Assuming token is stored in localStorage
        },
      })
      .then((response) => {
        setLoans(response.data); // Set the loan data from API
        setLoading(false); // End loading
      })
      .catch((error) => {
        setError("Failed to load loans"); // Handle error
        setLoading(false); // End loading
        console.error("Error fetching loan data:", error);
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Handle loan acceptance or rejection
  const handleLoanAction = async (loanId, action) => {
    setLoading(true); // Start loading
    try {
      // Send the action to the backend
      await api.post(
        "/api/loan-accept/", // API endpoint
        { loan_id: loanId, action }, // Pass loan ID and action ("accept" or "reject")
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      
      // Remove the loan from the state if action is accepted or rejected
      setLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.id !== loanId)
      ); // Remove the loan with the clicked ID
  
    } catch (error) {
      setError(`Failed to ${action} loan`); // Handle error
      console.error(`Error ${action}ing loan:`, error);
    } finally {
      setLoading(false); // End loading
    }
  };
  

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Loan Details</h1>
      </header>
      <main className={styles.main}>
        {loading && <p className={styles.loading}>Processing...</p>} {/* Loading indicator */}
        {error && <p className={styles.error}>{error}</p>} {/* Display error if any */}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Receiver Username</th>
              <th>Loan Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.recipient_username}</td>
                <td>{loan.amount}</td>
                <td>{loan.status || "Pending"}</td>
                <td>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleLoanAction(loan.id, "accept")}
                    disabled={loan.status === "accepted" || loan.status === "rejected" || loading}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleLoanAction(loan.id, "reject")}
                    disabled={loan.status === "accepted" || loan.status === "rejected" || loading}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default ViewLoan;
