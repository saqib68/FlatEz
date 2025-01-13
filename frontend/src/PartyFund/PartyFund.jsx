import React, { useState, useEffect } from "react";
import styles from "./PartyFund.module.css";
import api from "../api"; // Assuming api is already set up with axios
import { ACCESS_TOKEN } from "../constants"; // Assuming constants are defined in a separate file

const PartyFund = () => {
  const [fundDetails, setFundDetails] = useState({
    amount: "",
    purpose: "",
    members: [],
    memberName: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in (has an access token)
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      setIsLoggedIn(true);
    } else {
      alert("You need to be logged in to create a party fund.");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFundDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const addMember = () => {
    if (
      fundDetails.memberName &&
      !fundDetails.members.includes(fundDetails.memberName)
    ) {
      setFundDetails((prevDetails) => ({
        ...prevDetails,
        members: [...prevDetails.members, fundDetails.memberName],
        memberName: "", // Reset member name after adding
      }));
    }
  };

  const removeMember = (member) => {
    setFundDetails((prevDetails) => ({
      ...prevDetails,
      members: prevDetails.members.filter((m) => m !== member),
    }));
  };

  const generateFund = () => {
    if (!isLoggedIn) {
      alert("You need to be logged in to generate the party fund.");
      return;
    }

    const token = localStorage.getItem(ACCESS_TOKEN);
    const fundData = {
      purpose: fundDetails.purpose,
      amount: fundDetails.amount,
      members: fundDetails.members,
    };

    // Sending POST request to backend with fund details
    api
      .post("/api/addpartyfund/", fundData, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the access token to the request header
        },
      })
      .then((response) => {
        alert("Party fund created successfully!");
        console.log("Party Fund Response:", response.data);
        setFundDetails({
          amount: "",
          purpose: "",
          members: [],
          memberName: "",
        }); // Reset form after success
      })
      .catch((error) => {
        console.error(
          "Error creating party fund:",
          error.response?.data || error.message
        );
        alert(
          error.response?.data?.message ||
            "Failed to create party fund. Please try again."
        );
      });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Create Party Fund</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="purpose">Fund Purpose:</label>
            <input
              type="text"
              id="purpose"
              name="purpose"
              value={fundDetails.purpose}
              onChange={handleInputChange}
              placeholder="Enter purpose"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={fundDetails.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="memberName">Add Member:</label>
            <input
              type="text"
              id="memberName"
              name="memberName"
              value={fundDetails.memberName}
              onChange={handleInputChange}
              placeholder="Enter member name"
            />
            <button
              type="button"
              onClick={addMember}
              className={styles.addButton}
            >
              Add Member
            </button>
          </div>

          <div className={styles.membersList}>
            <h3>Members:</h3>
            <ul>
              {fundDetails.members.map((member, index) => (
                <li key={index} className={styles.memberItem}>
                  {member}
                  <button
                    type="button"
                    onClick={() => removeMember(member)}
                    className={styles.removeButton}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={generateFund} className={styles.generateButton}>
            Generate Party Fund
          </button>
        </div>
      </main>
    </div>
  );
};

export default PartyFund;
