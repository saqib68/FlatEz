import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from "./ViewPartyFund.module.css"; // Import CSS module

const ViewPartyFund = () => {
  const [funds, setFunds] = useState([]); // Store fetched party fund data
  const [error, setError] = useState(null); // Store error message
  const [loading, setLoading] = useState(false); // Loading state for async operations

  useEffect(() => {
    // Fetch party funds when the component mounts
    setLoading(true); // Start loading
    api
      .get("/api/viewpartyfunds/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Assuming token is stored in localStorage
        },
      })
      .then((response) => {
        setFunds(response.data.party_funds); // Set the party fund data from API
        setLoading(false); // End loading
      })
      .catch((error) => {
        setError("Failed to load party funds"); // Handle error
        setLoading(false); // End loading
        console.error("Error fetching party funds:", error);
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Function to mark a fund as paid
  const markAsPaid = async (fundId) => {
    setLoading(true); // Start loading
    try {
      // Send the action to the backend to mark the fund as paid
      await api.post(
        "/api/paypartyfund/", // API endpoint for marking a fund as paid
        { fund_id: fundId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`, // Token for authorization
          },
        }
      );

      // Update the fund in the state to reflect the paid status
      setFunds((prevFunds) =>
        prevFunds.map((fund) =>
          fund.id === fundId ? { ...fund, is_paid: true } : fund
        )
      );
    } catch (error) {
      setError("Failed to mark the fund as paid"); // Handle error
      console.error("Error marking fund as paid:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Party Funds</h1>
      </header>
      <main className={styles.main}>
        {loading && <p className={styles.loading}>Processing...</p>}{" "}
        {/* Loading indicator */}
        {error && <p className={styles.error}>{error}</p>}{" "}
        {/* Display error if any */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Purpose</th>
              <th>Amount</th>
              <th>Per Person Cost</th> {/* Updated header */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((fund) => (
              <tr key={fund.id} className={fund.is_paid ? styles.done : ""}>
                <td>{fund.id}</td>
                <td>{fund.purpose}</td>
                <td>${Number(fund.amount).toFixed(2)}</td>{" "}
                {/* Ensure amount is a number */}
                <td>${Number(fund.per_person_cost).toFixed(2)}</td>{" "}
                {/* Display per person cost */}
                <td>
                  {!fund.is_paid && (
                    <button
                      className={styles.payButton}
                      onClick={() => markAsPaid(fund.id)}
                      disabled={loading}
                    >
                      Pay
                    </button>
                  )}
                  {fund.is_paid && (
                    <span className={styles.paidText}>Paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ViewPartyFund;
