import React, { useState, useEffect } from 'react';
import styles from './Square.module.css';
import Square from './Square';
import { Link } from 'react-router-dom';
import api from '../api'; // Import the API helper

function Board(props) {
    const [alpha, setAlpha] = useState(Array(9).fill("-"));
    const [Win, setWin] = useState(false);
    const [winner, setWinner] = useState("-");
    const [userTurn, setUserTurn] = useState(true);
    const [displayTurn, setTurn] = useState("Your Turn");
    const [score, setScore] = useState(0); // Initial score

    function verify(arr, i) {
        return arr[i] === '-';
    }

    function checkForDraw() {
        for (let i = 0; i < 9; i++) {
            if (alpha[i] === '-') return false;
        }
        setWin(true);
        setWinner("Bhai Bhai");  // Changed to "Bhai Bhai" for draw scenario
        return true;
    }

    const handleClick = (i) => {
        if (!checkForDraw()) {
            if (!Win) {
                if (!userTurn) return; // Guard clause to prevent clicking if it's not user's turn

                if (verify(alpha, i)) {
                    setAlpha((arr) => {
                        const newArr = [...arr];
                        newArr[i] = 'X';

                        let idx = win(newArr, "user");
                        return newArr;
                    });

                    setUserTurn(false); // Disable further clicks for the user
                }
            }
        }
    };

    function getRandomInt() {
        return Math.floor(Math.random() * 9); // Generates a random integer from 0 to 8
    }

    useEffect(() => {
        if (!userTurn && !Win) {
            aiTurn();
        }
    }, [userTurn, Win]);

    const aiTurn = () => {
        if (!checkForDraw()) {
            setTurn("AI's Turn");

            setTimeout(() => {
                let idx = win(alpha, "AI");

                if (idx === -1) {
                    idx = getRandomInt();
                    while (!verify(alpha, idx)) {
                        idx = getRandomInt();
                    }
                }

                setAlpha(arr => {
                    const newArr = [...arr];
                    newArr[idx] = 'O';
                    win(newArr, "AI");
                    setUserTurn(true); // Switch back to user's turn
                    setTurn("Your Turn");
                    return newArr;
                });
            }, 500);
        }
    };

    function win(arr, player) {
        let idx = -1;

        const winCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (const combo of winCombinations) {
            const [a, b, c] = combo;
            if (arr[a] !== '-' && arr[a] === arr[b] && arr[b] === arr[c]) {
                setWin(true);
                setWinner(arr[a]); // Set the winner
                updateScore(arr[a]); // Update score and send to backend
                return;
            } else if (arr[a] !== '-' && arr[a] === arr[b] && arr[c] === '-') {
                idx = c;
            } else if (arr[a] !== '-' && arr[a] === arr[c] && arr[b] === '-') {
                idx = b;
            } else if (arr[b] !== '-' && arr[b] === arr[c] && arr[a] === '-') {
                idx = a;
            }
        }

        return idx; // Return the index for AI or user move
    }

    const handleRestart = () => {
        setAlpha(Array(9).fill("-"));
        setUserTurn(true);
        setWin(false);
        setWinner("-");
    }

    const updateScore = (winner) => {
        let newScore = score; // Create a local variable to hold the new score
    
        if (winner === "X") {
            newScore += 10; // User wins, score +10
        } else if (winner === "O") {
            newScore -= 5; // AI wins, score -5
        } else if (winner === "Bhai Bhai") {
            newScore = score; // Draw, score remains the same
        }
    
        setScore(newScore); // Update the state with the new score
    
        // Send the updated score to the backend after it is updated
        api.post('/api/submit-score/', { score: newScore }) // Send the updated score
            .then(response => {
                console.log('Score saved successfully:', response.data);
            })
            .catch(error => {
                console.error('Error saving score:', error.response?.data || error.message);
            });
    };

    return (
        <>
            <div className={styles.Title}> TicTacToe</div>
            <div>
                {Win ? (
                    <h1>{winner === "X" ? "Humanity won" : winner === "O" ? "AI took over" : "Human Ai Bhai Bhai"}</h1>
                ) : (
                    <div>{displayTurn}</div>
                )}
                {Win && <button onClick={handleRestart}>Restart</button>}
                <div className={styles.Board}>
                    {alpha.map((value, index) => (
                        <Square key={index} onClick={() => handleClick(index)} value={value} />
                    ))}
                </div>
            </div>
            <div className={styles.MyScore}> My Current Score : {score}</div>
            <Link to="/gameleaderboard">
                <button >Leaderboard</button>
            </Link>
        </>
    );
}

export default Board;
