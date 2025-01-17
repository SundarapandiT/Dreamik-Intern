import React from 'react';
import logo from '../assets/logo.png';
import "../style.css";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcVisa, faCcMastercard, faGooglePay, faFacebook, faTwitter, faInstagram, faYoutube, faGooglePlay } from '@fortawesome/free-brands-svg-icons';

function Footer() {
const navigate=useNavigate();

  return (
    <>
      <footer className="section-p1">
        <div className="col1">
          <a href="#" className="logo-section">
            <img src={logo} alt="logo" className="logo" />
            <h2>DreamikAI</h2>
          </a>

          <div className="contact-info">
            <p><strong>Address:</strong>
             MURVEN Infotech Design Solutions LLP,
             715-A, 7th Floor, Spencer Plaza,
             Suite No.548, Mount Road, Anna Salai,
             Chennai-600 002, Tamil Nadu, India.
            </p>
            <p><strong>General Inquiries:</strong> +91-44-28505188</p>
            <span><strong>Email:</strong>
              <a data-auto-recognition="true" href="mailto:murven.design@gmail.com" className="wixui-rich-text__text">murven.design@gmail.com</a>
            </span>
            <p><strong>GST:</strong> 33ABPFM6846A1Z8</p>
          </div>
        </div>
        <div className="col2">
          <h3>Menu</h3>
          <a href="#">Dreamik AI</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms & Conditions</a>
          <a href="refund.html">Return and Refund</a>
          <a href="#"><i className="fa-solid fa-phone"></i>Contact Us</a>
        </div>
        <div className="col3">
          <h3>My Account</h3>
          <a href="#">Sign In</a>
          <a href="#" onClick={()=>navigate('/Order')}>View Cart</a>
          <a href="#">My Wishlist</a>
          <a href="cart.html">Track My Order</a>
          <a href="Loacation/location.html">Reseller details</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSemg6VNtaJAAbcxAqCs7U8w5pBkv5-QgHSi1SNf-9dC7z_ueA/viewform?vc=0&c=0&w=1&flr=0&usp=mail_form_link">Help</a>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScO4MlvWy3ZuLNy1e_aifz7EP-Lfypva2nc6mgzOTVFLnGHlw/viewform?vc=0&c=0&w=1&flr=0">Feedback</a>
        </div>
        <div className="follow">
          <h3>Follow us</h3>
          <div className="icons">
            <a href="https://www.facebook.com/dreamikai"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="https://twitter.com/dreamikaicomics"><FontAwesomeIcon icon={faTwitter} /></a>
            <a href="https://www.instagram.com/dreamik.ai/"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="https://www.youtube.com/channel/UC4B8UinlrPeW4yY0yPc37Tg"><FontAwesomeIcon icon={faYoutube} /></a>
          </div>
        </div>
        <div className="col-install">
          <h3>Install</h3>
          <div className="icons">
            <a href="https://play.google.com/store/apps/details?id=com.murvenllp.dreamikaicomics"><FontAwesomeIcon icon={faGooglePlay} /></a>
          </div>
        </div>
        <div className="col-payment">
          <h3>Secured Payment Gateways</h3>
          <div className="icons">
            <a href=""><FontAwesomeIcon icon={faCcVisa} /></a>
            <a href=""><FontAwesomeIcon icon={faCcMastercard} /></a>
            <a href="">M</a>
            <a href=""><FontAwesomeIcon icon={faGooglePay} /></a>
          </div>
        </div>
      </footer>
      <footer className="f-2">
        <p>© 2024 by Dreamik AI. Created by Sanads Digital</p>
      </footer>
    </>
  );
}

export default Footer;
