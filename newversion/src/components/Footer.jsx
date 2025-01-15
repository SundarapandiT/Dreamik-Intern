// Footer.js
import React from 'react';
import logo from '../assets/logo.png';
import "../style.css";

function Footer() {
  return (
    <>
      <footer className="section-p1">
        <div className="col1">
          <a href="#" className="logo-section">
            <img src={logo} alt="logo" className="logo" />
            <h2>DreamikAI</h2>
          </a>
          <p><strong>Address:</strong> MURVEN Infotech Design Solutions LLP<br />
            715-A, 7th Floor, Spencer Plaza,<br />
            Suite No.548, Mount Road, Anna Salai,<br />
            Chennai - 600 002, Tamil Nadu, India</p>
          <p><strong>General Inquiries:</strong> +91-44-28505188</p>
          <p><strong>Email:</strong> murven.design@gmail.com</p>
          <p><strong>GST:</strong> 33ABPFM6846A1Z8</p>
          <div className="follow">
            <h4>Follow us</h4>
            <div className="icons">
              <i className="fab fa-facebook-f"></i>
              <i className="fab fa-twitter"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-pinterest-p"></i>
              <i className="fab fa-youtube"></i>
            </div>
          </div>
        </div>
        <div className="col2">
          <h3>Menu</h3>
          <a href="#">Dreamik AI</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms & Conditions</a>
          <a href="refund.html">Return and Refund</a>
          <a href="#">Contact Us</a>
        </div>
        <div className="col3">
          <h3>My Account</h3>
          <a href="#">Sign In</a>
          <a href="cart.html">View Cart</a>
          <a href="#">My Wishlist</a>
          <a href="cart.html">Track My Order</a>
          <a href="Loacation/location.html">Reseller details</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSemg6VNtaJAAbcxAqCs7U8w5pBkv5-QgHSi1SNf-9dC7z_ueA/viewform?vc=0&c=0&w=1&flr=0&usp=mail_form_link">Help</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScO4MlvWy3ZuLNy1e_aifz7EP-Lfypva2nc6mgzOTVFLnGHlw/viewform?vc=0&c=0&w=1&flr=0">Feedback</a>
        </div>
        <div className="col install">
          <h3>Install</h3>
          <p>From Google Play</p>
          <button>
            Get it on<br />
            <i className="fa-brands fa-google-play" style={{ color: 'red' }}></i>Google Play
          </button>
          <p>Secured Payment Gateways</p>
          <ul>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>Maestro</li>
            <li>Gpay</li>
          </ul>
        </div>
      </footer>
      <footer className="f-2">
        <p>© 2024 by Dreamik AI. Created by Sanads Digital</p>
      </footer>
    </>
  );
}

export default Footer;