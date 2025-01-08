import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import './Navbar.css';
import { useSelector } from 'react-redux';
import { FaGlobe, FaInfoCircle, FaServicestack, FaRegHandshake, FaSignInAlt, FaSignOutAlt, FaPowerOff } from 'react-icons/fa';
import { useLogoutUserMutation } from "../../store/slices/users";
import { logout } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { FaUserPlus } from "react-icons/fa6";
import { RootState } from "../../store/index";
import { BASE_URL } from "../../store/constants";
// import { useLogoutUserMutation } from '../../store/slices/authSlice';
const Navbar = () => {
  const [activeLink, setActiveLink] = useState('/');
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);
  const [logoutApiCall] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  // Function to change the language
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsDropdownOpen(false); // Close the dropdown after selecting a language
  };
  const logoutHandler = async () => {
    try {
      logoutApiCall(userInfo.token).unwrap();
      dispatch(logout(userInfo)); // Corrected dispatch call without passing userInfo
      navigate('/login');
    }
    catch (error: any) {
      alert(error.message);
    }
  };
  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo" onClick={() => {
        setActiveLink('/')
      }}>TezSell</Link>
      <button
        className="navbar-toggle"
        aria-label="Toggle menu"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}
      >
        ☰
      </button>
      <nav>
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/service" className={`navbar-link ${activeLink === '/service' ? 'active' : ''}`} onClick={() => setActiveLink('/service')}><FaServicestack style={{ marginRight: '4px' }} /> {t('service')}</Link></li>
          <li><Link to="/about" className={`navbar-link ${activeLink === '/about' ? 'active' : ''}`}
            onClick={() => setActiveLink('/about')}><FaInfoCircle style={{ marginRight: '4px' }} /> {t('about')}</Link></li>
          <li>
            <a href="https://t.me/tezsell_menejer" className="navbar-link" target="_blank" rel="noopener noreferrer">
              <FaRegHandshake style={{ marginRight: '4px' }} /> {t('support')}
            </a>
          </li>

          {userInfo ? (
            <>
              <li onClick={() => {
                setIsDropdownOpen(false)
                setIsProfileDropDownOpen(!isProfileDropDownOpen)
              }} className={`navbar-lang-dropdown ${isProfileDropDownOpen ? 'active' : ''}`}>
                <button className="navbar-profile-btn">
                  {userInfo.user_info.user_image ? (
                    <img
                      src={`${BASE_URL}${userInfo.user_info.user_image}`}
                      alt="User profile"
                      className="navbar-profile-image"
                    />
                  ) : (
                    <FaUserPlus size={20} style={{ marginRight: '1px' }} className={`navbar-link ${activeLink === '/myprofile' ? 'active' : ''}`} />
                  )}
                  {userInfo.user_info.username}
                </button>
                <ul className="dropdown-menu">
                  <li><Link to="/myprofile" className={`navbar-link ${activeLink === '/myprofile' ? 'active' : ''}`} onClick={() => setActiveLink('/myprofile')}>My Profile</Link></li>
                  <li onClick={logoutHandler}><Link to="/" onClick={() => setActiveLink('/')} className={`navbar-link-login ${activeLink === '/' ? 'active' : ''}`} >


                    <FaPowerOff style={{ marginRight: '1px' }} /> {t('logout')}
                  </Link>
                  </li>
                </ul>
              </li>
            </>
          ) : (
            <li><Link to="/login" onClick={() => setActiveLink('/login')} className={`navbar-link-login ${activeLink === '/login' ? 'active' : ''}`}><FaUserPlus style={{ marginRight: '4px' }} /> {t('login')}</Link></li>
          )}
          <li
            className={`navbar-lang-dropdown ${isDropdownOpen ? 'active' : ''}`}
            onClick={() => {
              setIsProfileDropDownOpen(false)
              setIsDropdownOpen(!isDropdownOpen)
            }}
          >
            <button className="navbar-lang-btn">
              <FaGlobe size={20} style={{ marginRight: '4px' }} /> {t('language')}
            </button>
            <ul className="dropdown-menu">
              <li><button onClick={() => changeLanguage('uz')} className={i18n.language === 'uz' ? 'active-lang' : ''}>{t('language-uz')}</button></li>
              <li><button onClick={() => changeLanguage('ru')} className={i18n.language === 'ru' ? 'active-lang' : ''}>{t('language-ru')}</button></li>
              <li><button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'active-lang' : ''}>{t('language-en')}</button></li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
