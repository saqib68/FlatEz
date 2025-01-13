import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API module
import styles from "./ViewTasks.module.css"; // Updated module CSS import

const ViewTasks = () => {
  // State for holding tasks
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(null); // State to handle errors

  // Function to fetch tasks from the backend API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/api/viewtask/"); // Fetch tasks from backend
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch tasks.");
        setLoading(false);
      }
    };

    fetchTasks();
  }, []); // Run once on component mount

  // Function to mark a task as done
  const markAsDone = async (task) => {
    try {
      // Send POST request to mark task as done
      const response = await api.post(`/api/marktaskasdone/`, task);
      // Update tasks locally to reflect the change
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, done: true } : t
        )
      );
    } catch (err) {
      setError("Failed to mark task as done.");
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Pending Tasks</h1>
      </header>
      <main className={styles.main}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Doer</th>
              <th>Due Date</th>
              <th>Due Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className={task.done ? styles.done : ""}>
                <td>{task.id}</td>
                <td>{task.task}</td>
                <td>{task.doer.username}</td>
                <td>{task.due_date}</td>
                <td>{task.due_time}</td>
                <td>
                  {task.done ? (
                    <span className={styles.doneText}>Done</span>
                  ) : (
                    <span className={styles.pendingText}>Pending</span>
                  )}
                </td>
                <td>
                  {!task.done && (
                    <button
                      className={styles.doneButton}
                      onClick={() => markAsDone(task)} // Passing the entire task
                    >
                      Mark as Done
                    </button>
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

export default ViewTasks;
