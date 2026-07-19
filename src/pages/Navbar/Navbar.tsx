import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Handshake,
  Info,
  Menu,
  MessageCircle,
  Package,
  Wrench,
  X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@utils/cn";
import { Badge, Button } from "@components/ui";
import Logo from "@components/Logo/Logo";
import { useAutoLogout } from "@hooks/useAutoLogout";

import {
  selectCanAccessAdmin,
  selectIsAuthenticated,
  selectIsVerifiedAgent,
  selectRawUserInfo,
  selectToken,
  selectUser,
  selectUserRole,
  syncWithStorage,
} from "@store/slices/authSlice";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserPermissionsQuery,
} from "@store/slices/users";
import { UserInfo } from "@store/type";

import AdminMenu from "./components/AdminMenu";
import AgentMenu from "./components/AgentMenu";
import LanguageSwitcher from "./components/LanguageSwitcher";
import MobileDrawer from "./components/MobileDrawer";
import RealEstateMenu from "./components/RealEstateMenu";
import ThemeToggle from "./components/ThemeToggle";
import UserMenu from "./components/UserMenu";

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
  last_updated: string;
}

function navLinkClasses(active: boolean) {
  return cn(
    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    active ? "text-primary" : "text-muted hover:text-foreground"
  );
}

const Navbar: React.FC<NavbarProps> = ({ chats = [], liveUnreadCount }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { clearAllStorage } = useAutoLogout();

  const userInfo = useSelector(selectRawUserInfo);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const canAccessAdmin = useSelector(selectCanAccessAdmin);
  const isVerifiedAgent = useSelector(selectIsVerifiedAgent);

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
      ("User info fetch failed, possibly expired token");
    }
  }, [userInfoError, token, dispatch, navigate]);

  useEffect(() => {
    if (token) {
      refresh();
    }
  }, [token, refresh]);

  const profileInfo: UserInfo | undefined = loggedUserInfo as UserInfo;
  const hasProfile = !!profileInfo?.data;
  const showUserMenu = isAuthenticated && hasProfile;
  const showLogin = !isAuthenticated;

  const displayName =
    (user as any)?.username || profileInfo?.data?.username || "User";
  const avatarSrc =
    (user as any)?.profile_image?.url ||
    (user as any)?.user_image ||
    profileInfo?.data?.profile_image?.image ||
    null;

  const isProductsActive = location.pathname === "/products";
  const isServiceActive = location.pathname === "/service";
  const isAboutActive = location.pathname === "/about";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      {permissionError && (
        <div className="mx-2 mb-2 mt-2 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          <Bell className="h-3 w-3 flex-shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      <nav className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-foreground/5 md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex h-10 flex-shrink-0 items-center sm:h-12"
          >
            <Logo width="auto" height="100%" className="max-h-full w-auto" />
          </Link>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Link to="/products" className={navLinkClasses(isProductsActive)}>
            <Package className="h-4 w-4" />
            {t("products_title")}
          </Link>
          <Link to="/service" className={navLinkClasses(isServiceActive)}>
            <Wrench className="h-4 w-4" />
            {t("service")}
          </Link>
          <RealEstateMenu />
          {canAccessAdmin && <AdminMenu />}
          {isVerifiedAgent && <AgentMenu />}
          <Link to="/about" className={navLinkClasses(isAboutActive)}>
            <Info className="h-4 w-4" />
            {t("about")}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            title={t("support")}
            className="hidden rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground sm:flex"
          >
            <Handshake className="h-5 w-5" />
          </a>

          {isAuthenticated && (
            <Link
              to="/chat"
              className={cn(
                "relative rounded-lg p-2 transition-colors hover:bg-foreground/5 hover:text-foreground",
                location.pathname === "/chat" ? "text-primary" : "text-muted"
              )}
            >
              <MessageCircle className="h-5 w-5" />
              {hasUnread && (
                <Badge
                  variant="danger"
                  className="absolute -right-1 -top-1 h-4 min-w-[1rem] justify-center px-1 py-0 leading-none"
                >
                  {formattedCount}
                </Badge>
              )}
            </Link>
          )}

          <LanguageSwitcher />
          <ThemeToggle />

          {showUserMenu ? (
            <UserMenu
              displayName={displayName}
              avatarSrc={avatarSrc}
              userRole={userRole}
              lastUpdated={permissionsData?.last_updated}
              clearAllStorage={clearAllStorage}
            />
          ) : showLogin ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/login")}
            >
              {t("login")}
            </Button>
          ) : (
            <span className="px-2 text-sm text-muted">{t("loading")}</span>
          )}
        </div>
      </nav>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        hasUnread={hasUnread}
        formattedCount={formattedCount}
        clearAllStorage={clearAllStorage}
      />
    </header>
  );
};

export default Navbar;
