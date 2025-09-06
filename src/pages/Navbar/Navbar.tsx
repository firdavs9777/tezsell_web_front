import { useAutoLogout } from "@hooks/useAutoLogout";
import { BASE_URL } from "@store/constants";
import {
  logout,
  selectAgentInfo,
  selectCanAccessAdmin,
  selectCanCreateProperties,
  selectIsAgent,
  selectIsAuthenticated,
  selectIsSuperAdmin,
  selectIsVerifiedAgent,
  selectRawUserInfo,
  selectToken,
  selectUser,
  selectUserRole,
  selectPermissions,
  syncWithStorage,
} from "@store/slices/authSlice";
import {
  useGetLoggedinUserInfoQuery,
  useLogoutUserMutation,
  useGetUserPermissionsQuery,
} from "@store/slices/users";
import { UserInfo } from "@store/type";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaUserShield,
  FaBoxOpen,
  FaBuilding,
  FaChartBar,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaCog,
  FaEnvelope,
  FaEnvelopeOpen,
  FaFileAlt,
  FaGlobe,
  FaHeart,
  FaHome,
  FaInfoCircle,
  FaMap,
  FaPlus,
  FaPowerOff,
  FaProductHunt,
  FaRegHandshake,
  FaServicestack,
  FaShieldAlt,
  FaTachometerAlt,
  FaThList,
  FaUser,
  FaUserCheck,
  FaUserPlus as FaUserPlusIcon,
  FaUserTie,
  FaUsers,
  FaBell,
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
interface PermissionsData {
  is_agent: boolean;
  is_verified_agent: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  can_create_properties: boolean;
  can_manage_inquiries: boolean;
  can_access_admin: boolean;
  can_verify_agents: boolean;
  can_manage_users: boolean;
  user_role:
    | "super_admin"
    | "staff"
    | "verified_agent"
    | "pending_agent"
    | "regular_user";
  last_updated: string; // ISO 8601 datetime string
}
const Navbar: React.FC<NavbarProps> = ({ chats = [], liveUnreadCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);
  const [isRealEstateDropdownOpen, setIsRealEstateDropdownOpen] =
    useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  const userInfo = useSelector(selectRawUserInfo);
  const user = useSelector(selectUser);
  const agentInfo = useSelector(selectAgentInfo);
  const permissions = useSelector(selectPermissions);

  const userRole = useSelector(selectUserRole);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const canAccessAdmin = useSelector(selectCanAccessAdmin);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const isVerifiedAgent = useSelector(selectIsVerifiedAgent);
  const isAgent = useSelector(selectIsAgent);
  const canCreateProperties = useSelector(selectCanCreateProperties);
  const { data: permissionsData, error: permissionError } =
    useGetUserPermissionsQuery(
      { token: token || "" },
      {
        skip: !token || !isAuthenticated,
        pollingInterval: 5 * 60 * 1000,
        refetchOnMountOrArgChange: true,
      }
    ) as {
      data: PermissionsData | undefined;
      error: any;
      isLoading: boolean;
      isError: boolean;
    };
  const [logoutApiCall] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { clearAllStorage } = useAutoLogout();

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
    isError: userInfoError,
  } = useGetLoggedinUserInfoQuery(
    { token: token || "" },
    {
      skip: !token,
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (userInfoError && token) {
      console.log("User info fetch failed, possibly expired token");
    }
  }, [userInfoError, token, dispatch, navigate]);

  useEffect(() => {
    if (token) {
      refresh();
    }
  }, [token, refresh]);

  useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
      setIsRealEstateDropdownOpen(false);
      setIsAdminDropdownOpen(false);
      setIsAgentDropdownOpen(false);
    };

    if (
      isMenuOpen ||
      isRealEstateDropdownOpen ||
      isAdminDropdownOpen ||
      isAgentDropdownOpen
    ) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [
    isMenuOpen,
    isRealEstateDropdownOpen,
    isAdminDropdownOpen,
    isAgentDropdownOpen,
  ]);

  const profileInfo: UserInfo | undefined = loggedUserInfo as UserInfo;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const logoutHandler = async () => {
    try {
      if (token) {
        await logoutApiCall(token).unwrap();
      }
      dispatch(logout(undefined));
      clearAllStorage();
      navigate("/login");
      toast.success("Logged out successfully", { autoClose: 2000 });
    } catch (error) {
      console.error("Logout error:", error);
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

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
    setIsRealEstateDropdownOpen(false);
    setIsAdminDropdownOpen(false);
    setIsAgentDropdownOpen(false);
  };

  const handleDropdownToggle = (dropdown: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    setIsProfileDropDownOpen(false);

    switch (dropdown) {
      case "realEstate":
        setIsRealEstateDropdownOpen(!isRealEstateDropdownOpen);
        setIsAdminDropdownOpen(false);
        setIsAgentDropdownOpen(false);
        break;
      case "admin":
        setIsAdminDropdownOpen(!isAdminDropdownOpen);
        setIsRealEstateDropdownOpen(false);
        setIsAgentDropdownOpen(false);
        break;
      case "agent":
        setIsAgentDropdownOpen(!isAgentDropdownOpen);
        setIsRealEstateDropdownOpen(false);
        setIsAdminDropdownOpen(false);
        break;
    }
  };

  const isRealEstateActive =
    location.pathname === "/properties" ||
    location.pathname.startsWith("/properties/") ||
    location.pathname === "/agents" ||
    location.pathname === "/become-agent" ||
    location.pathname === "/agent/status";

  const isAdminActive =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");

  const isAgentActive =
    location.pathname.startsWith("/agent/dashboard") ||
    location.pathname.startsWith("/agent/properties") ||
    location.pathname.startsWith("/agent/inquiries") ||
    location.pathname === "/agent/create-property";

  const isPendingAgent = userRole === "pending_agent";
  const hasProfile = !!profileInfo?.data;
  const showUserMenu = isAuthenticated && hasProfile;
  const showLogin = !isAuthenticated;

  function getRoleBadge() {
    const badges = {
      super_admin: {
        label: "Super Admin",
        color: "bg-red-100 text-red-800",
        icon: FaShieldAlt,
      },
      staff: {
        label: "Staff",
        color: "bg-orange-100 text-orange-800",
        icon: FaCog,
      },
      verified_agent: {
        label: "Verified Agent",
        color: "bg-green-100 text-green-800",
        icon: FaUserCheck,
      },
      pending_agent: {
        label: "Pending Agent",
        color: "bg-yellow-100 text-yellow-800",
        icon: FaClock,
      },
      regular_user: {
        label: "User",
        color: "bg-gray-100 text-gray-800",
        icon: FaUser,
      },
    };

    const badge =
      badges[userRole as keyof typeof badges] || badges.regular_user;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.color} whitespace-nowrap`}
      >
        <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
        {badge.label}
        {permissionsData?.last_updated && (
          <span
            className="ml-1 w-2 h-2 bg-green-400 rounded-full"
            title={`Last updated: ${new Date(
              permissionsData?.last_updated
            ).toLocaleTimeString()}`}
          />
        )}
      </span>
    );
  }

  const PermissionErrorNotification = () => {
    if (!permissionError) return null;
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-2 mx-2 mb-2">
        <div className="flex items-center text-red-700 text-sm">
          <FaBell className="mr-2 flex-shrink-0" size={12} />
          <span>{permissionError}</span>
        </div>
      </div>
    );
  };

  const PermissionStatusIndicator = () => {
    if (!isAuthenticated || !permissionsData) return null;

    const isStale =
      permissionsData?.last_updated &&
      Date.now() - new Date(permissionsData.last_updated).getTime() >
        10 * 60 * 1000;

    return (
      <div
        className={`hidden lg:flex items-center text-xs px-2 py-1 rounded ${
          isStale
            ? "text-yellow-600 bg-yellow-50"
            : "text-green-600 bg-green-50"
        }`}
        title={`Permissions ${
          isStale ? "may be outdated" : "up to date"
        } - Last updated: ${
          permissionsData.last_updated
            ? new Date(permissionsData.last_updated).toLocaleTimeString()
            : "Never"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full mr-1 ${
            isStale ? "bg-yellow-400" : "bg-green-400"
          }`}
        />
        <span>Live</span>
      </div>
    );
  };

  function renderNavItems() {
    return (
      <>
        <li className=" md:w-auto">
          <Link
            to="/products"
            onClick={handleNavLinkClick}
            className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded-full transition-all duration-200 ${
              location.pathname === "/products"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
            }`}
          >
            <FaProductHunt className="flex-shrink-0" size={16} />
            <span>{t("products_title")}</span>
          </Link>
        </li>

        <li className="w-full md:w-auto">
          <Link
            to="/service"
            onClick={handleNavLinkClick}
            className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
              location.pathname === "/service"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
            }`}
          >
            <FaServicestack className="flex-shrink-0" size={16} />
            <span>{t("service")}</span>
          </Link>
        </li>

        <li className="relative w-full md:w-auto">
          <button
            onClick={handleDropdownToggle("realEstate")}
            className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
              isRealEstateActive
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
            }`}
          >
            <FaHome className="flex-shrink-0" size={16} />
            <span className="flex-1 text-left md:flex-initial">
              {t("real_estate")}
            </span>
            <FaChevronDown
              className={`transition-transform duration-200 flex-shrink-0 ${
                isRealEstateDropdownOpen ? "rotate-180" : ""
              }`}
              size={12}
            />
          </button>

          {isRealEstateDropdownOpen && (
            <ul
              className={`mt-1 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 ${
                isMenuOpen
                  ? "w-full ml-4 mr-2"
                  : "absolute left-0 top-full w-56 min-w-max"
              }`}
            >
              <li>
                <Link
                  to="/properties"
                  onClick={handleNavLinkClick}
                  className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                    location.pathname === "/properties" ||
                    location.pathname.startsWith("/properties/")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  <FaBuilding className="mr-3 flex-shrink-0" size={14} />
                  <span>{t("properties_main")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/properties-map-view"
                  onClick={handleNavLinkClick}
                  className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                    location.pathname === "/properties-map-view" ||
                    location.pathname.startsWith("/properties-map-view/")
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  <FaMap className="mr-3 flex-shrink-0" size={14} />
                  <span>{t("map_main")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/agents"
                  onClick={handleNavLinkClick}
                  className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                    location.pathname === "/agents"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  <FaUserTie className="mr-3 flex-shrink-0" size={14} />
                  <span>{t("agents")}</span>
                </Link>
              </li>

              {isAuthenticated && (
                <>
                  {!isAgent && (
                    <li>
                      <Link
                        to="/become-agent"
                        onClick={handleNavLinkClick}
                        className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                          location.pathname === "/become-agent"
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        <FaUserPlusIcon
                          className="mr-3 flex-shrink-0"
                          size={14}
                        />
                        <span>{t("become_agent")}</span>
                      </Link>
                    </li>
                  )}

                  {(isAgent || isPendingAgent) && (
                    <li>
                      <Link
                        to="/agent/status"
                        onClick={handleNavLinkClick}
                        className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                          location.pathname === "/agent/status"
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        {isPendingAgent ? (
                          <FaClock className="mr-3 flex-shrink-0" size={14} />
                        ) : (
                          <FaCheckCircle
                            className="mr-3 flex-shrink-0"
                            size={14}
                          />
                        )}
                        <span>{t("agent_status")}</span>
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      to="/saved-properties"
                      onClick={handleNavLinkClick}
                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        location.pathname === "/saved-properties"
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <FaHeart className="mr-3 flex-shrink-0" size={14} />
                      <span>Saved Properties</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </li>

        {canAccessAdmin && (
          <li className="relative w-full md:w-auto">
            <button
              onClick={handleDropdownToggle("admin")}
              className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
                isAdminActive
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              {isSuperAdmin ? (
                <FaShieldAlt className="flex-shrink-0" size={16} />
              ) : (
                <FaCog className="flex-shrink-0" size={16} />
              )}
              <span className="flex-1 text-left md:flex-initial">
                {isSuperAdmin ? "Admin" : "Staff"}
              </span>
              <FaChevronDown
                className={`transition-transform duration-200 flex-shrink-0 ${
                  isAdminDropdownOpen ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>

            {isAdminDropdownOpen && (
              <ul
                className={`mt-1 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 ${
                  isMenuOpen
                    ? "w-full ml-4 mr-2"
                    : "absolute left-0 top-full w-56 min-w-max"
                }`}
              >
                <li>
                  <Link
                    to={isSuperAdmin ? "/admin/dashboard" : "/staff/dashboard"}
                    onClick={handleNavLinkClick}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname.includes("/dashboard")
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaTachometerAlt className="mr-3 flex-shrink-0" size={14} />
                    <span>Dashboard</span>
                  </Link>
                </li>

                {permissions?.can_manage_users && (
                  <li>
                    <Link
                      to="/admin/users"
                      onClick={handleNavLinkClick}
                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        location.pathname === "/admin/users"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                      }`}
                    >
                      <FaUsers className="mr-3 flex-shrink-0" size={14} />
                      <span>Manage Users</span>
                    </Link>
                  </li>
                )}

                {permissions?.can_verify_agents && (
                  <>
                    <li>
                      <Link
                        to="/admin/pending-agents"
                        onClick={handleNavLinkClick}
                        className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                          location.pathname === "/admin/agents"
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        <FaUserCheck className="mr-3 flex-shrink-0" size={14} />
                        <span>Pending Agents</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/verified-agents"
                        onClick={handleNavLinkClick}
                        className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                          location.pathname === "/admin/verified-agents"
                            ? "text-indigo-600 bg-indigo-50"
                            : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                        }`}
                      >
                        <FaUserShield
                          className="mr-3 flex-shrink-0"
                          size={14}
                        />
                        <span>Verified Agents</span>
                      </Link>
                    </li>
                  </>
                )}

                <li>
                  <Link
                    to={isSuperAdmin ? "/admin/analytics" : "/staff/analytics"}
                    onClick={handleNavLinkClick}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname.includes("/analytics")
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaChartBar className="mr-3 flex-shrink-0" size={14} />
                    <span>Analytics</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}

        {isVerifiedAgent && (
          <li className="relative w-full md:w-auto">
            <button
              onClick={handleDropdownToggle("agent")}
              className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
                isAgentActive
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              <FaTachometerAlt className="flex-shrink-0" size={16} />
              <span className="flex-1 text-left md:flex-initial">
                Agent Panel
              </span>
              <FaChevronDown
                className={`transition-transform duration-200 flex-shrink-0 ${
                  isAgentDropdownOpen ? "rotate-180" : ""
                }`}
                size={12}
              />
            </button>

            {isAgentDropdownOpen && (
              <ul
                className={`mt-1 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 ${
                  isMenuOpen
                    ? "w-full ml-4 mr-2"
                    : "absolute left-0 top-full w-56 min-w-max"
                }`}
              >
                <li>
                  <Link
                    to="/agent/dashboard"
                    onClick={handleNavLinkClick}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/agent/dashboard"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaTachometerAlt className="mr-3 flex-shrink-0" size={14} />
                    <span>Dashboard</span>
                  </Link>
                </li>

                {canCreateProperties && (
                  <li>
                    <Link
                      to="/agent/create-property"
                      onClick={handleNavLinkClick}
                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        location.pathname === "/agent/create-property"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                      }`}
                    >
                      <FaPlus className="mr-3 flex-shrink-0" size={14} />
                      <span>Create Property</span>
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    to="/agent/properties"
                    onClick={handleNavLinkClick}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/agent/properties"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaBuilding className="mr-3 flex-shrink-0" size={14} />
                    <span>My Properties</span>
                  </Link>
                </li>

                {permissions?.can_manage_inquiries && (
                  <li>
                    <Link
                      to="/agent/inquiries"
                      onClick={handleNavLinkClick}
                      className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                        location.pathname === "/agent/inquiries"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                      }`}
                    >
                      <FaEnvelopeOpen
                        className="mr-3 flex-shrink-0"
                        size={14}
                      />
                      <span>Inquiries</span>
                    </Link>
                  </li>
                )}

                <li>
                  <Link
                    to="/agent/profile"
                    onClick={handleNavLinkClick}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/agent/profile"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaFileAlt className="mr-3 flex-shrink-0" size={14} />
                    <span>Agent Profile</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
        )}

        <li className="w-full md:w-auto">
          <Link
            to="/about"
            onClick={handleNavLinkClick}
            className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
              location.pathname === "/about"
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
            }`}
          >
            <FaInfoCircle className="flex-shrink-0" size={16} />
            <span>{t("about")}</span>
          </Link>
        </li>

        {isAuthenticated && (
          <li className="w-full md:w-auto">
            <Link
              to="/chat"
              onClick={handleNavLinkClick}
              className={`flex items-center gap-2 font-medium text-sm px-3 py-2 rounded transition-colors w-full ${
                location.pathname === "/chat"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <FaEnvelope size={16} />
                {hasUnread && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center leading-none">
                    {formattedCount}
                  </span>
                )}
              </div>
              <span>{t("chat")}</span>
            </Link>
          </li>
        )}

        <li className="w-full md:w-auto">
          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-800 hover:text-blue-600 hover:bg-white/50 md:hover:bg-white/30 font-medium text-sm px-3 py-2 rounded transition-colors w-full"
            onClick={() => setIsMenuOpen(false)}
          >
            <FaRegHandshake className="flex-shrink-0" size={16} />
            <span>{t("support")}</span>
          </a>
        </li>

        {showUserMenu ? (
          <li className="relative w-full md:w-auto">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-white/50 md:hover:bg-white/30 transition-colors w-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(false);
                setIsRealEstateDropdownOpen(false);
                setIsAdminDropdownOpen(false);
                setIsAgentDropdownOpen(false);
                setIsProfileDropDownOpen(!isProfileDropDownOpen);
              }}
            >
              {(user as any)?.profile_image?.url ||
              (user as any)?.user_image ||
              profileInfo?.data.profile_image?.image ? (
                <img
                  src={
                    (user as any)?.profile_image?.url ||
                    (user as any)?.user_image ||
                    `${BASE_URL}${profileInfo?.data.profile_image?.image}`
                  }
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget
                      .nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{
                  display:
                    (user as any)?.profile_image?.url ||
                    (user as any)?.user_image ||
                    profileInfo?.data.profile_image?.image
                      ? "none"
                      : "flex",
                }}
              >
                {(user as any)?.username?.charAt(0).toUpperCase() ||
                  profileInfo?.data.username?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
              <span className="text-gray-800 font-medium text-sm flex-1 text-left md:flex-initial truncate">
                {(user as any)?.username ||
                  profileInfo?.data.username ||
                  "User"}
              </span>
            </button>

            {isProfileDropDownOpen && (
              <ul
                className={`mt-1 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 ${
                  isMenuOpen
                    ? "w-full ml-4 mr-2"
                    : "absolute right-0 top-full w-48 min-w-max"
                }`}
              >
                <li>
                  <Link
                    to="/myprofile"
                    onClick={() => {
                      handleNavLinkClick();
                      setIsProfileDropDownOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/myprofile"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaUser className="mr-3 flex-shrink-0" size={14} />
                    <span>{t("my_profile")}</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/my-services"
                    onClick={() => {
                      handleNavLinkClick();
                      setIsProfileDropDownOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/my-services"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaThList className="mr-3 flex-shrink-0" size={14} />
                    <span>{t("my_services_title")}</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/my-products"
                    onClick={() => {
                      handleNavLinkClick();
                      setIsProfileDropDownOpen(false);
                    }}
                    className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 ${
                      location.pathname === "/my-products"
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    <FaBoxOpen className="mr-3 flex-shrink-0" size={14} />
                    <span>{t("my_products_title")}</span>
                  </Link>
                </li>

                <li>
                  <hr className="my-2 border-gray-200" />
                  <button
                    onClick={() => {
                      logoutHandler();
                      setIsProfileDropDownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <FaPowerOff className="mr-3 flex-shrink-0" size={14} />
                    <span>{t("logout")}</span>
                  </button>
                </li>
              </ul>
            )}
          </li>
        ) : showLogin ? (
          <li className="w-full md:w-auto">
            <Link
              to="/login"
              onClick={handleNavLinkClick}
              className={`flex items-center justify-center gap-2 font-medium text-sm px-4 py-2 rounded-lg transition-colors w-full md:w-auto ${
                location.pathname === "/login"
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
              }`}
            >
              <FaUserPlus className="flex-shrink-0" size={16} />
              <span>{t("login")}</span>
            </Link>
          </li>
        ) : (
          <li className="w-full md:w-auto">
            <div className="flex items-center gap-2 text-gray-500 px-3 py-2">
              <FaUser className="flex-shrink-0" size={16} />
              <span className="text-sm">Loading...</span>
            </div>
          </li>
        )}

        <li className="relative w-full md:w-auto">
          <button
            className="flex items-center gap-2 text-cyan-600 hover:text-blue-600 hover:bg-white/50 md:hover:bg-white/30 font-medium text-sm px-3 py-2 rounded transition-colors w-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsProfileDropDownOpen(false);
              setIsRealEstateDropdownOpen(false);
              setIsAdminDropdownOpen(false);
              setIsAgentDropdownOpen(false);
              setIsDropdownOpen(!isDropdownOpen);
            }}
          >
            <FaGlobe className="flex-shrink-0" size={16} />
            <span className="flex-1 text-left md:flex-initial">
              {t("language")}
            </span>
            <FaChevronDown
              className={`transition-transform duration-200 flex-shrink-0 md:hidden ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              size={12}
            />
          </button>

          {isDropdownOpen && (
            <ul
              className={`mt-1 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 ${
                isMenuOpen
                  ? "w-full ml-4 mr-2"
                  : "absolute right-0 top-full w-36 min-w-max"
              }`}
            >
              <li>
                <button
                  onClick={() => changeLanguage("uz")}
                  className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                    i18n.language === "uz"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  {t("language-uz")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("ru")}
                  className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                    i18n.language === "ru"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  {t("language-ru")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`block w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                    i18n.language === "en"
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-700 hover:text-indigo-500 hover:bg-indigo-50"
                  }`}
                >
                  {t("language-en")}
                </button>
              </li>
            </ul>
          )}
        </li>

        {isMenuOpen && isAuthenticated && userRole && (
          <li className="md:hidden mt-4 pt-4 border-t border-yellow-300/50">
            <div className="flex justify-center">{getRoleBadge()}</div>
          </li>
        )}

        {isMenuOpen && isVerifiedAgent && agentInfo && (
          <li className="md:hidden mt-3">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-sm text-green-800 font-medium truncate">
                {agentInfo.agency_name}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Rating: {agentInfo.rating}/5.0 • {agentInfo.total_sales} sales
              </div>
            </div>
          </li>
        )}

        {isMenuOpen && isPendingAgent && (
          <li className="md:hidden mt-3">
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center text-sm text-yellow-800">
                <FaClock className="mr-2 flex-shrink-0" size={12} />
                <span>Application under review</span>
              </div>
              <Link
                to="/agent/status"
                onClick={handleNavLinkClick}
                className="text-xs text-yellow-600 hover:underline mt-1 block font-medium"
              >
                Check status →
              </Link>
            </div>
          </li>
        )}
      </>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-yellow-300/90 backdrop-blur-md shadow-md">
      <PermissionErrorNotification />

      <div className="h-16 px-2 sm:px-4 flex justify-between items-center max-w-7xl mx-auto">
        <Link
          to="/"
          onClick={handleNavLinkClick}
          className="text-xl sm:text-2xl font-bold text-blue-900 flex-shrink-0"
        >
          TezSell
        </Link>

        <div className="hidden xl:flex items-center gap-2 mx-2">
          {isAuthenticated && userRole && getRoleBadge()}
          <PermissionStatusIndicator />
        </div>

        <button
          className="text-blue-900 text-2xl md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded"
          onClick={handleMenuToggle}
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <nav className="hidden md:block">
          <ul className="flex flex-row gap-1 lg:gap-2 xl:gap-3 items-center">
            {renderNavItems()}
          </ul>
        </nav>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-yellow-400/50 bg-yellow-200/95 backdrop-blur-sm">
          <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            <ul className="flex flex-col gap-1 p-3">{renderNavItems()}</ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
