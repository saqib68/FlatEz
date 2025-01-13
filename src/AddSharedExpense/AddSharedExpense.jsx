import React, { useState, useEffect } from "react";
import styles from "./AddSharedExpense.module.css";
import api from "../api"; // Assuming api is already set up with axios
import { ACCESS_TOKEN } from "../constants"; // Assuming constants are defined in a separate file

function AddSharedExpense() {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    due_date: "",
    due_time: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [isPaid, setIsPaid] = useState(false); // Track if the user has paid their share

  useEffect(() => {
    // Fetch FlatMate data to check if user is admin and if user has paid
    api
      .get("/api/flatmate-data/")
      .then((response) => {
        const flatmateData = response.data;
        setIsAdmin(flatmateData.isadmin); // Set admin status
        setIsPaid(flatmateData.isPaid); // Set isPaid status
      })
      .catch((error) => {
        console.error("Error fetching FlatMate data:", error);
        alert("Failed to fetch your FlatMate data.");
      });
  }, []);

  // Handle form input changes
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  // Handle form submission for adding shared expense
  function handleSubmit(event) {
    event.preventDefault();

    console.log("Form Data:", formData);

    // Retrieve the access token from localStorage
    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      alert("You need to be logged in to add a shared expense.");
      return;
    }

    // Sending POST request to backend with form data
    api
      .post("/api/addexpense/", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the access token to the request header
        },
      })
      .then((response) => {
        alert("Shared expense added successfully!");
        console.log("Shared Expense Response:", response.data);

        // Reset form after success
        setFormData({
          description: "",
          amount: "",
          due_date: "",
          due_time: "",
        });
      })
      .catch((error) => {
        console.error(
          "Error adding shared expense:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            "Failed to add shared expense. Please try again."
        );
      });
  }

  // Handle form submission for user's share of the expense
  function handleShareSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem(ACCESS_TOKEN);

    if (!token) {
      alert("You need to be logged in to submit your share of the expense.");
      return;
    }

    // Sending POST request to backend to submit the share
    api
      .post(
        "/api/payshare/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        alert("Your share of the expense added successfully!");
        console.log("Share Response:", response.data);
      })
      .catch((error) => {
        console.error(
          "Error adding share of the expense:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            "Failed to submit your share of the expense. Please try again."
        );
      });
  }

  return (
    <div>
      {/* Conditionally render Add Shared Expense form for admins */}
      {isAdmin && (
        <div className={styles.card1}>
          <h2 className={styles.textCenter}>Add Shared Expense</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.formLabel}>
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className={styles.formControl}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="amount" className={styles.formLabel}>
                Amount
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className={styles.formControl}
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
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
            <div className={styles.formGroup}>
              <label htmlFor="due_time" className={styles.formLabel}>
                Due Time
              </label>
              <input
                type="time"
                id="due_time"
                name="due_time"
                className={styles.formControl}
                value={formData.due_time}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className={`${styles.btnSuccess} ${styles.mt4}`}
            >
              Add Shared Expense
            </button>
          </form>
        </div>
      )}

      {/* Conditionally render "Submit Your Share" only if user has not paid */}
      {!isPaid ? (
        <div className={styles.card}>
          <h2 className={styles.textCenter}>Submit Your Share</h2>
          <form onSubmit={handleShareSubmit}>
            <button
              type="submit"
              className={`${styles.btnSuccess} ${styles.mt4}`}
            >
              Submit Your Share
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.card}>
          <h2 className={styles.textCenter}>Your Payment is Completed</h2>
        </div>
      )}
    </div>
  );
}

export default AddSharedExpense;
