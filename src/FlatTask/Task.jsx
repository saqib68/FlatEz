import React, { useState } from "react";
import "./Task.css"; // Import the CSS file

const Task = () => {
  const [tasks, setTasks] = useState([
    { name: "Buy groceries", completed: false },
    { name: "Clean the living room", completed: false },
    { name: "Fix the door", completed: false },
    { name: "Water the plants", completed: false },
    { name: "Pay the electricity bill", completed: false },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, { name: newTask, completed: false }]);
      setNewTask("");
    }
  };

  const handleComplete = (index) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, completed: true } : task
      )
    );
  };

  const handleRemove = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  return (
    <div className="cont">
      <h1 className="mb-4">Flat Task Management</h1>

      {/* Add Task Input */}
      <div className="mb-3 w-100" style={{ maxWidth: "500px" }}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          className="btn btn-primary w-100 mt-2"
          onClick={addTask}
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        <h4 className="task-list-title">Flat Member Tasks</h4>
        {tasks.length === 0 ? (
          <p className="task-list-empty">No tasks available.</p>
        ) : (
          <ul className="task-list-group">
            {tasks.map((task, index) => (
              <li
                key={index}
                className={`task-list-item ${task.completed ? "completed-task" : ""}`}
              >
                <span className="task-name">{task.name}</span>
                <div className="task-buttons">
                  {!task.completed && (
                    <button
                      className="btn btn-success task-button"
                      onClick={() => handleComplete(index)}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn btn-danger task-button"
                    onClick={() => handleRemove(index)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Task;
