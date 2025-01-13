import React, { useState, useEffect } from "react";
import api from "../api";
import styles from "./ViewSharedExpense.module.css";

const ViewSharedExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // New state for admin status

  useEffect(() => {
    // Fetch the flatmate's admin status
    api
      .get("/api/flatmate-data/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((response) => {
        if (response.data.isadmin) {
          setIsAdmin(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching flatmate data:", error);
      });

    // Fetch expenses
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
        console.error("Error fetching shared expenses:", error);
      });
  }, []);

  const markAsPaid = async (expenseId) => {
    setLoading(true);
    try {
      await api.post(
        "/api/markexpensepaid/",
        { expense_id: expenseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === expenseId ? { ...expense, is_paid: true } : expense
        )
      );
    } catch (error) {
      setError("Failed to mark the expense as paid");
      console.error("Error marking expense as paid:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("expense_id", expenseId);

      await api.post("/api/deleteexpense/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense.id !== expenseId)
      );
    } catch (error) {
      setError("Failed to delete the expense");
      console.error("Error deleting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Shared Expenses</h1>
      </header>
      <main className={styles.main}>
        {loading && <p className={styles.loading}>Processing...</p>}
        {error && <p className={styles.error}>{error}</p>}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Due Time</th>
              <th>Action</th>
              { isAdmin && (
              <th>Delete</th> )}
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className={expense.is_paid ? styles.done : ""}
              >
                <td>{expense.id}</td>
                <td>{expense.description}</td>
                <td>${Number(expense.amount).toFixed(2)}</td>
                <td>{expense.due_date}</td>
                <td>{expense.due_time}</td>
                <td>
                  {!expense.is_paid && (
                    <button
                      className={styles.payButton}
                      onClick={() => markAsPaid(expense.id)}
                      disabled={loading}
                    >
                      Pay
                    </button>
                  )}
                  {expense.is_paid && (
                    <span className={styles.paidText}>Paid</span>
                  )}
                </td>
                
                  {!expense.is_paid && isAdmin && (
                    <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteExpense(expense.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                    
                  </td>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ViewSharedExpense;
