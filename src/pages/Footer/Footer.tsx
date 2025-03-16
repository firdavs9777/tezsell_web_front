import React from 'react';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaApple, FaGooglePlay } from 'react-icons/fa'; // Import App Store and Google Play icons
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
const Footer: React.FC = () => {
  const qrCodeValue = "https://www.tezsell.com";
    const { t, i18n } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-menu">
            <ul>
              <li> <Link to="/">  { t("products_title")}</Link> </li>
              <li> <Link to="/service" >{ t("services_title")}</Link></li>
              <li> <Link to="/about"> { t("about")}</Link></li>
              <li>
                <a href="https://t.me/tezsell_menejer" className="navbar-link" target="_blank" rel="noopener noreferrer">
                  { t("support")}
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
          </div>
          <p className='copyright'>©2025 TEZSELL. All Rights Reserved.</p>

        </div>
        <div className="footer-right">
          <QRCode value={qrCodeValue} size={128} />
          <h1>{t('download_mobile_app')}</h1>
          <div className="app-store-icons">
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
              <FaApple size={40} />
            </a>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
              <FaGooglePlay size={40} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
