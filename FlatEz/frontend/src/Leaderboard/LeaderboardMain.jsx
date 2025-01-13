import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from './Leaderboard.module.css'; // Import the CSS module

const LeaderboardMain = () => {
  const [players, setPlayers] = useState([]);
  const [flatmateOfTheMonth, setFlatmateOfTheMonth] = useState(null);

  useEffect(() => {
    // Fetch leaderboard data when component mounts
    api
      .get("/api/leaderboard/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Assuming token is stored in localStorage
        },
      })
      .then((response) => {
        setPlayers(response.data); // Set the leaderboard data to the state

        // Determine Flatmate of the Month (top scorer)
        if (response.data.length > 0) {
          const topScorer = response.data.reduce((prev, curr) => 
            prev.score > curr.score ? prev : curr
          );
          setFlatmateOfTheMonth(topScorer);
        }
      })
      .catch((error) => {
        console.error("Error fetching leaderboard data:", error);
        alert("Failed to fetch leaderboard data.");
      });
  }, []);

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="container">
      <h1 className="text-center">FlatEZ</h1>
      <div className={styles.leaderboardContainer}>
        <h2>Leaderboard</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.user_username}</td>
                <td>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flatmate of the Month */}
      {flatmateOfTheMonth && (
        <div className={styles.flatmateOfTheMonth}>
          <h2>Flatmate of the Month</h2>
          <div className={styles.flatmateCard}>
            <p><strong>Name:</strong> {flatmateOfTheMonth.user_username}</p>
            <p><strong>Score:</strong> {flatmateOfTheMonth.score}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardMain;
