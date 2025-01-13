import React from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>About Us</h1>
      <p className={styles.paragraph}>
        <strong>FlatEZ</strong> is a dynamic web app tailored for people sharing a flat, making communal living simpler and more enjoyable. 
        It offers an easy way to track shared expenses, offer loans to flatmates, and make seamless payments directly through the app. 
        With built-in games to unwind and reminders for important tasks, FlatEZ brings fun and organization into the everyday life of flatmates.
      </p>

      <h2 className={styles.subHeading}>Scope</h2>
      <p className={styles.paragraph}>
        FlatEZ enhances the living and sharing experience of flatmates immensely. 
        FlatEZ fills this gap by offering features like loans between flatmates, in-app payments, games for leisure, and task reminders—all in one place.
      </p>

      <h2 className={styles.subHeading}>Objective</h2>
      <p className={styles.paragraph}>
        Our goal is to revolutionize communal living by offering a streamlined platform that simplifies everyday tasks for flatmates. 
        From expense tracking and in-app payments to loan management and task reminders, FlatEZ ensures smooth communication 
        and efficient management of daily living, promoting a secure and fun environment for all.
      </p>

      <h2 className={styles.subHeading}>Problem Statement</h2>
      <p className={styles.paragraph}>
        The main reason for creating FlatEZ is to tackle common issues faced by flatmates. By automating expense tracking and enabling in-app payments, 
        FlatEZ reduces conflicts and makes living together more organized and enjoyable.
      </p>

      <h2 className={styles.subHeading}>Languages & Tools</h2>
      <ul className={styles.list}>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
        <li>React JS</li>
        <li>Python</li>
        <li>Django</li>
        <li>SQLite</li>
      </ul>

      
    </div>
  );
};

export default AboutUs;

