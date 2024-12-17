import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import './Navbar.css';

import { FaGlobe, FaInfoCircle, FaServicestack, FaRegHandshake, FaSignInAlt } from 'react-icons/fa';

const Navbar = () => {
    const [activeLink, setActiveLink] = useState('/');
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Function to change the language
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsDropdownOpen(false); // Close the dropdown after selecting a language
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">TezSell</Link>
      <button
        className="navbar-toggle"
        aria-label="Toggle menu"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        ☰
      </button>
      <nav>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>

          <li><Link to="/service" className="navbar-link"><FaServicestack style={{ marginRight: '4px' }} /> {t('service')}</Link></li>
          <li><Link to="/about" className="navbar-link"><FaInfoCircle style={{ marginRight: '4px' }} /> {t('about')}</Link></li>
          <li>
            <a href="https://t.me/tezsell_menejer" className="navbar-link" target="_blank" rel="noopener noreferrer">
              <FaRegHandshake style={{ marginRight: '4px' }} /> {t('support')}
            </a>
          </li>
          <li><Link to="/login" className={`navbar-link-register ${activeLink === '/login' ? 'active' : ''}`}><FaSignInAlt style={{ marginRight: '4px' }} /> {t('login')}</Link></li>

          <li
            className={`navbar-lang-dropdown ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <button className="navbar-lang-btn">
              <FaGlobe size={20} style={{ marginRight: '4px' }} /> {t('language')}
            </button>
            <ul className="dropdown-menu">
              <li><button onClick={() => changeLanguage('uz')}>{t('language-uz')}</button></li>
              <li><button onClick={() => changeLanguage('ru')}>{t('language-ru')}</button></li>
              <li><button onClick={() => changeLanguage('en')}>{t('language-en')}</button></li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
