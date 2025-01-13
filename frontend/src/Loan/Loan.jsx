import React, { useState } from "react";
import api from "../api"; // Assuming api is already set up with axios
import { ACCESS_TOKEN } from "../constants"; // Assuming constants are defined in a separate file
import styles from "./Loan.module.css"; // Importing CSS module

function Loan() {
  const [formData, setFormData] = useState({
    username: "", // Changed flatmateID to username
    amount: "",
    due_date: "", // Changed dueDate to due_date
  });

  // Handle form data updates
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Form Data:", formData);

    // Retrieve the access token from localStorage
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      alert("You need to be logged in to apply for a loan.");
      return;
    }

    // Sending POST request to backend with form data
    api.post("/api/applyloan/", formData, {
      headers: {
        Authorization: `Bearer ${token}`, // Attach the access token to the request header
      },
    })
      .then((response) => {
        alert("Loan applied successfully!");
        console.log("Loan Response:", response.data);
      })
      .catch((error) => {
        console.error("Error applying for loan:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Loan application failed. Please try again.");
      });
  };

  return (
    <div className={styles.signinCard}>
      <h2 className={`${styles.textCenter} ${styles.title}`}>Apply for a Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username" className={styles.formLabel}>
            Flatmate Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className={styles.formControl}
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your Flatmate Username"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.formLabel}>
            Loan Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            className={styles.formControl}
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter the loan amount"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="due_date" className={styles.formLabel}>
            Due Date
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            className={styles.formControl}
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.btnSuccess}>
          Apply for Loan
        </button>
      </form>
    </div>
  );
}

export default Loan;
