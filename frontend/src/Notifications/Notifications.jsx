import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from "./Notifications.module.css";

function Notifications(props) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    // Fetch notifications when the component mounts
    api
      .get("/api/notifications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Corrected string template syntax
        },
      })
      .then((response) => {
        setNotifications(response.data); // Set the fetched notifications to the state
      })
      .catch((error) => {
        console.error("Error fetching notifications data:", error);
        setError("Failed to fetch notifications.");
      })
      .finally(() => {
        setLoading(false); // Stop loading when done
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  if (loading) {
    return <div className={styles.Title}>Loading...</div>; // Display loading message
  }

  if (error) {
    return <div className={styles.Title}>{error}</div>; // Display error message
  }

  return (
    <>
      <div className={styles.Title}>Notifications</div>
      <div className={styles.container}>
        <div className={styles.Name}></div>{" "}
        {/* You can replace with dynamic user name */}
        <div className={styles.NotificationWrapper}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div className={styles.Notification} key={index}>
                {notification.message}{" "}
                {/* Assuming 'message' is the field in the API response */}
              </div>
            ))
          ) : (
            <div className={styles.Notification}>No notifications found</div>
          )}
        </div>
      </div>
    </>
  );
}

export default Notifications;
