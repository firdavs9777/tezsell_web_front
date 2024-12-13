import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
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
              <li><Link to="/about" className="navbar-link">{t('about')}</Link></li>
          <li><Link to="/support" className="navbar-link">{t('support')}</Link></li>
          <li><Link to="/contact" className="navbar-link">{t('rules')}</Link></li>    
        <li 
            className={`navbar-lang-dropdown ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <button className="navbar-lang-btn">
              {t('language')}
            </button>
            <ul className="dropdown-menu">
       <li><button onClick={() => changeLanguage('en')}>{t('language-en')}</button></li>
              <li><button onClick={() => changeLanguage('ru')}>{t('language-ru')}</button></li>
              <li><button onClick={() => changeLanguage('uz')}>{t('language-uz')}</button></li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
