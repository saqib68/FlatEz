import { useState } from "react";
import api from "../api";
import styles from "./AddTask.module.css"; // Importing CSS module

function AddTask() {
  const [formData, setFormData] = useState({
    doer: "",
    task: "",
    due_date: "",
    due_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    // Post the task data to the backend API
    api
      .post("/api/addtask/", formData)
      .then((response) => {
        alert("Task added successfully!");
        console.log("Response:", response.data);

        // Optionally reset the form
        setFormData({
          doer: "",
          task: "",
          due_date: "",
          due_time: "",
        });
      })
      .catch((error) => {
        console.error("Error adding task:", error.response?.data || error.message);
        setError(error.response?.data?.message || "Failed to add task. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className={styles.signinCard}>
      <h2 className={`${styles.textCenter} ${styles.title}`}>Add Task</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="doer" className={styles.formLabel}>
            Doer Flatmate Username
          </label>
          <input
            type="text"
            id="doer"
            name="doer"
            className={styles.formControl}
            value={formData.doer}
            onChange={handleChange}
            placeholder="Enter Username"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="task" className={styles.formLabel}>
            Description
          </label>
          <input
            type="text"
            id="task"
            name="task"
            className={styles.formControl}
            value={formData.task}
            onChange={handleChange}
            placeholder="Enter Description"
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
          className={styles.btnSuccess}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
        {error && <div className={styles.alert}>{error}</div>}
      </form>
    </div>
  );
}

export default AddTask;
