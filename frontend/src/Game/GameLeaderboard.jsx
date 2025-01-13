import React, { useState, useEffect } from "react";
import api from "../api"; // Your custom API instance
import styles from './GameLeaderboard.module.css'; // Import the CSS module

const GameLeaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Fetch leaderboard data when component mounts
    api
      .get("/api/game-leaderboard/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`, // Token from localStorage
        },
      })
      .then((response) => {
        console.log(response.data);
        setPlayers(response.data); // Set the leaderboard data to the state
      })
      .catch((error) => {
        console.error("Error fetching leaderboard data:", error);
        alert("Failed to fetch leaderboard data.");
      });
  }, []); // Empty dependency array ensures this only runs once when the component mounts

  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>FlatEZ Game Leaderboard</h1>
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
                <td>{player.username}</td> {/* Displaying user (username) from the response */}
                <td>{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameLeaderboard;
