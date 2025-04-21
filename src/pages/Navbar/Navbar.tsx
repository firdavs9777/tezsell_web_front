import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FaGlobe,
  FaInfoCircle,
  FaServicestack,
  FaRegHandshake,
  FaPowerOff,
  FaEnvelope,
  FaUser,
  FaThList,
  FaBoxOpen,
} from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import {
  useGetLoggedinUserInfoQuery,
  useLogoutUserMutation,
} from "@store/slices/users";
import { logout } from "@store/slices/authSlice";
import { RootState } from "@store/index";
import { BASE_URL } from "@store/constants";
import { UserInfo } from "@store/type";
import { toast } from "react-toastify";

const Navbar = () => {
  const [activeLink, setActiveLink] = useState("/");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [logoutApiCall] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: loggedUserInfo, refetch: refresh } =
    useGetLoggedinUserInfoQuery(
      { token: userInfo?.token || "" },
      { skip: !userInfo?.token }
    );

  useEffect(() => {
    if (userInfo?.token) refresh();
  }, [userInfo?.token, refresh]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  const profileInfo: UserInfo | undefined = loggedUserInfo as UserInfo;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall(userInfo?.token).unwrap();
      dispatch(logout(userInfo));
      navigate("/login");
      toast.success("Logged out successfully", { autoClose: 2000 });
    } catch {
      toast.error("Error occurred", { autoClose: 2000 });
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = (path: string) => {
    setActiveLink(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-yellow-300/90 backdrop-blur-md shadow-md px-4 py-2">
      <div className="flex justify-between items-center">
        <Link
          to="/"
          onClick={() => handleNavLinkClick("/")}
          className="text-2xl font-bold text-blue-900"
        >
          TezSell
        </Link>
        <button
          className="text-blue-900 text-2xl md:hidden"
          onClick={handleMenuToggle}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
        <nav className="hidden md:block">
          <ul className="flex flex-row gap-4 items-center">
            {renderNavItems()}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4">
          <ul className="flex flex-col gap-4 bg-yellow-200 rounded-lg p-4">
            {renderNavItems()}
          </ul>
        </nav>
      )}
    </header>
  );

  function renderNavItems() {
    return (
      <>
        <li>
          <Link
            to="/service"
            onClick={() => handleNavLinkClick("/service")}
            className={`flex items-center gap-1 font-medium text-lg ${activeLink === "/service"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaServicestack /> {t("service")}
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            onClick={() => handleNavLinkClick("/about")}
            className={`flex items-center gap-1 font-medium text-lg ${activeLink === "/about"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaInfoCircle /> {t("about")}
          </Link>
        </li>
        {profileInfo && userInfo?.token && (
          <li>
            <Link
              to="/chat"
              onClick={() => handleNavLinkClick("/chat")}
              className={`flex items-center gap-1 font-medium text-lg ${activeLink === "/chat"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
                }`}
            >
              <FaEnvelope /> {t("chat")}
            </Link>
          </li>
        )}
        <li>
          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-800 hover:text-blue-400 font-medium text-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaRegHandshake /> {t("support")}
          </a>
        </li>

        {profileInfo && userInfo?.token ? (
          <li className="relative">
            <button
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsProfileDropDownOpen(!isProfileDropDownOpen);
              }}
            >
              <img
                src={`${BASE_URL}${profileInfo?.data.profile_image?.image}`}
                alt="profile"
                className="w-8 h-8 rounded-full"
              />
         <span className={`text-gray-800 ${
  activeLink === "/myprofile" || activeLink === "/my-services" || activeLink === "/my-products"
    ? "text-[blue] border-b-2 border-blue-600 text-[16px]"
    : "text-gray-700 hover:text-blue-600 "
}`}>
  {profileInfo.data.username}
</span>

            </button>
            {isProfileDropDownOpen && (
              <ul
                className={`mt-2 w-40 bg-yellow-400 rounded-lg shadow-lg py-2 z-50 ${isMenuOpen ? "" : "absolute right-0"
                  }`}
              >
                <li>
                  <Link

                    to="/myprofile"
                    onClick={() => {
                      handleNavLinkClick("/myprofile");
                      setIsProfileDropDownOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200
                      ${activeLink === "/myprofile"
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}

                  >
                    <FaUser className="mr-2" color="#333" />
                    {t("my_profile")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/my-services"
                    onClick={() => {
                      handleNavLinkClick("/my-services");
                      setIsProfileDropDownOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200
                      ${activeLink === "/my-services"
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                  >
                    <FaThList className="mr-1" color="#333" size={18} />
                    {t("my_services_title")}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/my-products"
                    onClick={() => {
                      handleNavLinkClick("/my-products");
                      setIsProfileDropDownOpen(false);
                    }}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200
                      ${activeLink === "/my-products"
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                  
                  >
                    <FaBoxOpen className="mr-1" color="#333" size={18} />

                    {t("my_products_title")}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      logoutHandler();
                      setIsProfileDropDownOpen(false);
                    }}
                    className="flex items-center w-full px-2 py-2 text-[#333] hover:bg-blue-300"
                  >
                    <FaPowerOff className="mr-2" color="#333" size={18} />
                    {t("logout")}
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : (
          <li>
            <Link
              to="/login"
              onClick={() => handleNavLinkClick("/login")}
              className={`flex items-center gap-1 text-lg font-medium ${activeLink === "/login"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
                }`}
            >
              <FaUserPlus /> {t("login")}
            </Link>
          </li>
        )}

        {/* Language Dropdown */}
        <li className="relative">
          <button
            className="flex items-center gap-2 text-cyan-500 hover:text-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileDropDownOpen(false);
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <FaGlobe /> {t("language")}
          </button>
          {isDropdownOpen && (
            <ul
              className={`mt-2 w-40 bg-yellow-400 rounded-lg shadow-lg py-2 z-50 ${isMenuOpen ? "" : "absolute right-0"
                }`}
            >
              <li>
                <button
                  onClick={() => changeLanguage("uz")}
                  className={`block w-full text-left px-4 py-2 hover:bg-blue-300 ${i18n.language === "uz"
                    ? "text-blue-700 font-bold"
                    : "text-white"
                    }`}
                >
                  {t("language-uz")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("ru")}
                  className={`block w-full text-left px-4 py-2 hover:bg-blue-300 ${i18n.language === "ru"
                    ? "text-blue-700 font-bold"
                    : "text-white"
                    }`}
                >
                  {t("language-ru")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`block w-full text-left px-4 py-2 hover:bg-blue-300 ${i18n.language === "en"
                    ? "text-blue-700 font-bold"
                    : "text-white"
                    }`}
                >
                  {t("language-en")}
                </button>
              </li>
            </ul>
          )}
        </li>
      </>
    );
  }
};

export default Navbar;
