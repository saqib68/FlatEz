import styles from './T.module.css';
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

function TransactionHistory(props) {
    // Use state to manage transaction history (messages)
    const [history, setHistory] = useState([]);

    // Fetch transaction history data when the component mounts
    useEffect(() => {
        const fetchTransactionHistory = async () => {
            try {
                const response = await api.get('/api/transactions/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`
                    }
                });

                if (response.data) {
                    setHistory(response.data); // Update state with the fetched history
                    console.log(response.data[0].sender_name) // Log sender name for debugging
                }
            } catch (error) {
                console.error('Error fetching transaction history:', error);
            }
        };

        fetchTransactionHistory();
    }, []);

    return (
        <>
            <div className={styles.Title}>Transaction History</div>
            <div className={styles.container}>
                <div className={styles.Name}>{props.username}</div>
                <div className={styles.HistoryWrapper}>
                    {history.map((transaction, index) => (
                        <div className={styles.History} key={index}>
                            {/* Display sender and receiver names */}
                            <div><strong>Sender:</strong> {transaction.sender_name}</div>
                            <div><strong>Receiver:</strong> {transaction.receiver_display_name}</div>
                            <div><strong>Amount:</strong> {transaction.amount}</div>
                            <div><strong>Transaction Date:</strong> {new Date(transaction.datetime).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default TransactionHistory;
