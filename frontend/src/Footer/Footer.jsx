import React from 'react';
import styles from './Footer.module.css'; // Import the CSS module

const Footer = () => {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          {/* About Section */}
          <div className={styles.footerSection}>
            <h5>About Company</h5>
            <p>
              FlatEz is your trusted partner in managing shared living spaces. 
              Our mission is to simplify task delegation, foster cooperation, and create 
              a seamless living experience for all residents.
            </p>
          </div>

          {/* Contact Section */}
          <div className={styles.footerSection}>
            <h5>Contact</h5>
            <p>Email: Saqibghouri001@gmail.com</p>
            <p>Phone: +92 303967474</p>
            <div className={styles.footerSocials}>
              <a href="#!"><i className="fab fa-facebook-f"></i></a>
              <a href="#!"><i className="fab fa-twitter"></i></a>
              <a href="#!"><i className="fab fa-dribbble"></i></a>
            </div>
          </div>

          {/* Hours Section */}
          <div className={styles.footerSection}>
            <h5>Opening Hours</h5>
            <p>Mon - Thu: 8am - 9pm</p>
            <p>Fri - Sat: 8am - 1am</p>
            <p>Sunday: 9am - 10pm</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 Copyright: FlatEz.com</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
