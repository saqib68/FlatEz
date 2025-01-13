import React, { useState, useEffect } from 'react';
import styles from './ChatAnonymously.module.css';
import api from '../api'; // Assuming the API instance is already set up
import { ACCESS_TOKEN } from '../constants';

function ChatAnonymously(props) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
   const[username,setu]=useState("") // Assuming the username is stored in localStorage

    // Function to handle new message input
    const handleMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    // Function to fetch chat messages from the API
   // Function to fetch chat messages from the API
const fetchMessages = () => {
    api.get('api/get-chat/', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
        }
    })
    .then((response) => {
        // Get the fetched messages from the response
        const fetchedMessages = response.data.messages;
        
        // Reverse the messages array to make the last element first
        const reversedMessages = [...fetchedMessages].reverse();
        
        // Set the reversed messages to state
        setMessages(reversedMessages);

        console.log(response.data.loggedna_in_userme);
        setu(response.data.loggedna_in_userme);
    })
    .catch((error) => {
        console.error('Error fetching messages:', error);
        alert("Failed to fetch messages. Please try again.");
    });
};


    console.log(username)

    // Fetch messages on component mount
    useEffect(() => {
        fetchMessages();
    }, []); // Empty dependency array to fetch messages only once when the component mounts

    // Function to post a message to the API
    const handlePostMessage = (event) => {
        event.preventDefault();

        if (newMessage.trim() === "") return;  // Prevent empty messages

        const messageData = {
            message: newMessage,  // Include message text
            username: username,   // Include logged-in username
        };

        // Post the message to the API
        api.post('api/create-chat/', messageData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
            }
        })
        .then((response) => {
            // After successful post, add the new message to the state
            setMessages((prevMessages) => [
                ...prevMessages,
                { username, message: newMessage }, // Correct message structure
            ]);
            setNewMessage(""); // Clear input field after posting
        })
        .catch((error) => {
            console.error('Error posting message:', error);
            alert("Failed to send message. Please try again.");
        });
    };

    return (
        <div className={styles.outerContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.chatArea}>
                    {messages.map((message, index) => {
                        

                        if(message.username===username)
                        {
                            return <div key={index} className={styles.LoggedInUser}>{message.message}</div>
                        }   
                        else
                        {
                            return <div key={index} className={styles.RemainingUsers} >{message.message}</div>
                        }




                    })}
                </div>




                    




                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Type a message"
                        className={styles.chatInput}
                        value={newMessage}
                        onChange={handleMessageChange}
                    />
                    <button
                        className={styles.sendButton}
                        onClick={handlePostMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatAnonymously;
