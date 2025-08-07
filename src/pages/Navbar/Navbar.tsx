import { useAutoLogout } from "@hooks/useAutoLogout";
import { BASE_URL } from "@store/constants";
import { RootState } from "@store/index";
import { logout, syncWithStorage } from "@store/slices/authSlice";
import {
  useGetLoggedinUserInfoQuery,
  useLogoutUserMutation,
} from "@store/slices/users";
import { UserInfo } from "@store/type";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBoxOpen,
  FaEnvelope,
  FaGlobe,
  FaHome,
  FaInfoCircle,
  FaPowerOff,
  FaProductHunt,
  FaRegHandshake,
  FaServicestack,
  FaThList,
  FaUser,
} from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Chat {
  id: number;
  name: string;
  participants: number[];
  last_message: {
    id: number;
    content: string;
    timestamp: string;
    sender: {
      id: number;
      username: string;
    };
  } | null;
  unread_count: number;
}

interface NavbarProps {
  chats?: Chat[];
  liveUnreadCount?: number;
}

const Navbar: React.FC<NavbarProps> = ({ chats = [], liveUnreadCount }) => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [logoutApiCall] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Initialize auto-logout hook
  const { clearAllStorage } = useAutoLogout();

  // Sync Redux with localStorage on mount
  useEffect(() => {
    if (!userInfo) {
      dispatch(syncWithStorage());
    }
  }, [userInfo, dispatch]);

  const calculatedUnread = chats.reduce(
    (total, chat) => total + chat.unread_count,
    0
  );
  const totalUnread = liveUnreadCount ?? calculatedUnread;
  const hasUnread = totalUnread > 0;
  const formattedCount = totalUnread > 99 ? "99+" : totalUnread.toString();

  const {
    data: loggedUserInfo,
    refetch: refresh,
    isError: userInfoError
  } = useGetLoggedinUserInfoQuery(
    { token: userInfo?.token || "" },
    {
      skip: !userInfo?.token,
      refetchOnMountOrArgChange: true,
    }
  );

  // Handle API errors (e.g., token expired)
  useEffect(() => {
    if (userInfoError && userInfo?.token) {
      console.log("User info fetch failed, possibly expired token");
      // Optionally auto-logout on token expiry
      // dispatch(logout());
      // navigate("/login");
    }
  }, [userInfoError, userInfo, dispatch, navigate]);

  // Refresh user info when token is available
  useEffect(() => {
    const token = userInfo?.token;
    if (token) {
      refresh();
    }
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

  // Improved logout handler
  const logoutHandler = async () => {
    try {
      // Call logout API if token exists
      if (userInfo?.token) {
        await logoutApiCall(userInfo.token).unwrap();
      }

      // Clear Redux state
      dispatch(logout(undefined));

      // Clear all storage
      clearAllStorage();

      // Navigate to login
      navigate("/login");

      toast.success("Logged out successfully", { autoClose: 2000 });
    } catch (error) {
      console.error("Logout error:", error);

      // Even if API call fails, clear local state
      dispatch(logout(undefined));
      clearAllStorage();
      navigate("/login");

      toast.error("Logout completed (with errors)", { autoClose: 2000 });
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavLinkClick = (path: string) => {
    setIsMenuOpen(false);
  };

  // Determine authentication state
  const isAuthenticated = !!(userInfo?.token);
  const hasProfile = !!(profileInfo?.data);
  const showUserMenu = isAuthenticated && hasProfile;
  const showLogin = !isAuthenticated;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth Debug:', {
      userInfo: !!userInfo,
      token: !!userInfo?.token,
      profileInfo: !!profileInfo,
      hasProfile,
      isAuthenticated,
      showUserMenu,
      showLogin
    });
  }

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
            to="/products"
            onClick={() => handleNavLinkClick("/products")}
            className={`flex items-center gap-1 font-medium text-lg ${location.pathname === "/products"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaProductHunt /> {t("products_title")}
          </Link>
        </li>
        <li>
          <Link
            to="/service"
            onClick={() => handleNavLinkClick("/service")}
            className={`flex items-center gap-1 font-medium text-lg ${location.pathname === "/service"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaServicestack /> {t("service")}
          </Link>
        </li>
        <li>
          <Link
            to="/properties"
            onClick={() => handleNavLinkClick("/properties")}
            className={`flex items-center gap-1 font-medium text-lg ${location.pathname === "/properties" || location.pathname.startsWith("/properties/")
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaHome /> {t("real_estate")}
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            onClick={() => handleNavLinkClick("/about")}
            className={`flex items-center gap-1 font-medium text-lg ${location.pathname === "/about"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-800 hover:text-blue-400"
              }`}
          >
            <FaInfoCircle /> {t("about")}
          </Link>
        </li>

        {/* Chat - only show if authenticated */}
        {isAuthenticated && (
          <li className="relative">
            <Link
              to="/chat"
              onClick={() => handleNavLinkClick("/chat")}
              className={`flex items-center gap-1 font-medium text-lg ${location.pathname === "/chat"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-800 hover:text-blue-400"
                }`}
            >
              <div className="relative">
                <FaEnvelope />
                {/* Notification badge */}
                {hasUnread && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center leading-none">
                    {formattedCount}
                  </span>
                )}
              </div>
              {t("chat")}
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

        {/* User Menu or Login */}
        {showUserMenu ? (
          <li className="relative">
            <button
              className="flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsProfileDropDownOpen(!isProfileDropDownOpen);
              }}
            >
              {profileInfo?.data.profile_image?.image ? (
                <img
                  src={`${BASE_URL}${profileInfo.data.profile_image.image}`}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Hide the broken image and show fallback
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold"
                style={{ display: profileInfo?.data.profile_image?.image ? 'none' : 'flex' }}
              >
                {profileInfo?.data.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span
                className={`text-gray-800 ${location.pathname === "/myprofile" ||
                    location.pathname === "/my-services" ||
                    location.pathname === "/my-products"
                    ? "text-[blue] border-b-2 border-blue-600 text-[16px]"
                    : "text-gray-700 hover:text-blue-600 "
                  }`}
              >
                {profileInfo?.data.username || 'User'}
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
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${location.pathname === "/myprofile"
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
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${location.pathname === "/my-services"
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
                    className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${location.pathname === "/my-products"
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
        ) : showLogin ? (
          <li>
            <Link
              to="/login"
              onClick={() => handleNavLinkClick("/login")}
              className={`flex items-center gap-1 text-lg font-medium ${location.pathname === "/login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-800 hover:text-blue-400"
                }`}
            >
              <FaUserPlus /> {t("login")}
            </Link>
          </li>
        ) : (
          <li>
            <div className="flex items-center gap-1 text-gray-500">
              <FaUser />
              Loading...
            </div>
          </li>
        )}


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
