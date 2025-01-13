import React, { useState, useEffect } from "react";
import api from "../api";
import styles from "./EditSharedExpense.module.css";

const EditSharedExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/viewexpenses/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((response) => {
        setExpenses(response.data.expenses);
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load shared expenses");
        setLoading(false);
        console.error("Error fetching expenses:", error);
      });
  }, []);

  const handleChange = (e, expenseId) => {
    const { name, value } = e.target;
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense.id === expenseId
          ? { ...expense, [name]: value }
          : expense
      )
    );
  };

  const handleSave = async (expenseId) => {
    const form = document.getElementById(`expense-form-${expenseId}`);
    const formData = new FormData(form);

    setLoading(true);

    try {
      await api.put(
        `/api/editexpense/${expenseId}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false);
      alert("Expense updated successfully!");
    } catch (error) {
      setError("Failed to update the expense");
      console.error("Error updating expense:", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.signinCard}>
      <main className={styles.main}>
        {loading && <p className={styles.loading}>Processing...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <div key={expense.id} className={styles.form}>
              <h2 className={`${styles.textCenter} ${styles.title}`}>
                Edit Expense {expense.id}
              </h2>
              <form id={`expense-form-${expense.id}`} className={styles.expenseForm}>
                <div className={styles.formGroup}>
                  <label htmlFor={`description-${expense.id}`} className={styles.formLabel}>
                    Description
                  </label>
                  <input
                    type="text"
                    id={`description-${expense.id}`}
                    name="description"
                    className={styles.formControl}
                    value={expense.description}
                    onChange={(e) => handleChange(e, expense.id)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor={`amount-${expense.id}`} className={styles.formLabel}>
                    Amount
                  </label>
                  <input
                    type="number"
                    id={`amount-${expense.id}`}
                    name="amount"
                    className={styles.formControl}
                    value={expense.amount}
                    onChange={(e) => handleChange(e, expense.id)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor={`due_date-${expense.id}`} className={styles.formLabel}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    id={`due_date-${expense.id}`}
                    name="due_date"
                    className={styles.formControl}
                    value={expense.due_date}
                    onChange={(e) => handleChange(e, expense.id)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor={`due_time-${expense.id}`} className={styles.formLabel}>
                    Due Time
                  </label>
                  <input
                    type="time"
                    id={`due_time-${expense.id}`}
                    name="due_time"
                    className={styles.formControl}
                    value={expense.due_time}
                    onChange={(e) => handleChange(e, expense.id)}
                  />
                </div>
                <button
                  className={styles.btnSuccess}
                  onClick={() => handleSave(expense.id)}
                  disabled={loading}
                >
                  Save Changes
                </button>
              </form>
            </div>
          ))
        ) : (
          <p>No expenses to edit.</p>
        )}
      </main>
    </div>
  );
};

export default EditSharedExpense;
