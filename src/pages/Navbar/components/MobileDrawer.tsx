import {
  Box,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  Heart,
  Info,
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  MailOpen,
  Map,
  MessageCircle,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  User as UserIcon,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cn } from "@utils/cn";
import { Badge } from "@components/ui";
import {
  logout,
  selectAgentInfo,
  selectCanAccessAdmin,
  selectCanCreateProperties,
  selectIsAgent,
  selectIsAuthenticated,
  selectIsSuperAdmin,
  selectIsVerifiedAgent,
  selectPermissions,
  selectToken,
  selectUserRole,
} from "@store/slices/authSlice";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserPermissionsQuery,
  useLogoutUserMutation,
} from "@store/slices/users";
import { UserInfo } from "@store/type";
import LanguageSwitcher from "./LanguageSwitcher";
import RoleBadge from "./RoleBadge";
import ThemeToggle from "./ThemeToggle";

export interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  hasUnread: boolean;
  formattedCount: string;
  clearAllStorage: () => void;
}

function linkClasses(active: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-foreground/5"
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </div>
  );
}

export default function MobileDrawer({
  open,
  onClose,
  hasUnread,
  formattedCount,
  clearAllStorage,
}: MobileDrawerProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAgent = useSelector(selectIsAgent);
  const userRole = useSelector(selectUserRole);
  const isPendingAgent = userRole === "pending_agent";
  const canAccessAdmin = useSelector(selectCanAccessAdmin);
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const isVerifiedAgent = useSelector(selectIsVerifiedAgent);
  const canCreateProperties = useSelector(selectCanCreateProperties);
  const permissions = useSelector(selectPermissions);
  const agentInfo = useSelector(selectAgentInfo);
  const token = useSelector(selectToken);

  const [logoutApiCall] = useLogoutUserMutation();

  const { data: permissionsData } = useGetUserPermissionsQuery(
    { token: token || "" },
    {
      skip: !token || !isAuthenticated,
      pollingInterval: 5 * 60 * 1000,
      refetchOnMountOrArgChange: true,
    }
  ) as { data: { last_updated?: string } | undefined };

  const { data: loggedUserInfo } = useGetLoggedinUserInfoQuery(
    { token: token || "" },
    { skip: !token, refetchOnMountOrArgChange: true }
  );
  const profileInfo: UserInfo | undefined = loggedUserInfo as UserInfo;
  const hasProfile = !!profileInfo?.data;
  const showUserMenu = isAuthenticated && hasProfile;
  const showLogin = !isAuthenticated;
  const lastUpdated = permissionsData?.last_updated;

  const logoutHandler = async () => {
    try {
      if (token) {
        await logoutApiCall(token).unwrap();
      }
      dispatch(logout(undefined));
      clearAllStorage();
      navigate("/login");
      toast.success(t("logged_out_successfully"), { autoClose: 2000 });
    } catch (error: any) {
      console.error(error);
      dispatch(logout(undefined));
      clearAllStorage();
      navigate("/login");
      toast.error(t("logout_completed_with_errors"), { autoClose: 2000 });
    }
  };

  const path = location.pathname;

  if (!open) return null;

  return (
    <div className="md:hidden">
      <div
        className="fixed inset-0 z-30 bg-foreground/20"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-surface shadow-lg">
        <nav className="flex flex-col gap-1 p-3">
          <Link to="/products" onClick={onClose} className={linkClasses(path === "/products")}>
            <Package className="h-4 w-4 flex-shrink-0" />
            {t("products_title")}
          </Link>
          <Link to="/service" onClick={onClose} className={linkClasses(path === "/service")}>
            <Wrench className="h-4 w-4 flex-shrink-0" />
            {t("service")}
          </Link>

          <SectionHeading>{t("real_estate")}</SectionHeading>
          <Link
            to="/properties"
            onClick={onClose}
            className={linkClasses(path === "/properties" || path.startsWith("/properties/"))}
          >
            <Building2 className="h-4 w-4 flex-shrink-0" />
            {t("properties_main")}
          </Link>
          <Link
            to="/properties-map-view"
            onClick={onClose}
            className={linkClasses(path === "/properties-map-view")}
          >
            <Map className="h-4 w-4 flex-shrink-0" />
            {t("map_main")}
          </Link>
          <Link to="/agents" onClick={onClose} className={linkClasses(path === "/agents")}>
            <Users className="h-4 w-4 flex-shrink-0" />
            {t("agents")}
          </Link>
          {isAuthenticated && !isAgent && (
            <Link
              to="/become-agent"
              onClick={onClose}
              className={linkClasses(path === "/become-agent")}
            >
              <UserPlus className="h-4 w-4 flex-shrink-0" />
              {t("become_agent")}
            </Link>
          )}
          {isAuthenticated && (isAgent || isPendingAgent) && (
            <Link
              to="/agent/status"
              onClick={onClose}
              className={linkClasses(path === "/agent/status")}
            >
              {isPendingAgent ? (
                <Clock className="h-4 w-4 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              )}
              {t("agent_status")}
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/saved-properties"
              onClick={onClose}
              className={linkClasses(path === "/saved-properties")}
            >
              <Heart className="h-4 w-4 flex-shrink-0" />
              {t("saved_properties")}
            </Link>
          )}

          {canAccessAdmin && (
            <>
              <SectionHeading>{isSuperAdmin ? t("admin") : t("staff")}</SectionHeading>
              <Link
                to={isSuperAdmin ? "/admin/dashboard" : "/staff/dashboard"}
                onClick={onClose}
                className={linkClasses(path.includes("/dashboard"))}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Settings className="h-4 w-4 flex-shrink-0" />
                )}
                {t("dashboard")}
              </Link>
              {permissions?.can_manage_users && (
                <Link
                  to="/admin/users"
                  onClick={onClose}
                  className={linkClasses(path === "/admin/users")}
                >
                  <Users className="h-4 w-4 flex-shrink-0" />
                  {t("manage_users")}
                </Link>
              )}
              {permissions?.can_verify_agents && (
                <>
                  <Link
                    to="/admin/pending-agents"
                    onClick={onClose}
                    className={linkClasses(path === "/admin/pending-agents")}
                  >
                    <UserCheck className="h-4 w-4 flex-shrink-0" />
                    {t("pending_agents")}
                  </Link>
                  <Link
                    to="/admin/verified-agents"
                    onClick={onClose}
                    className={linkClasses(path === "/admin/verified-agents")}
                  >
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    {t("verified_agents")}
                  </Link>
                </>
              )}
            </>
          )}

          {isVerifiedAgent && (
            <>
              <SectionHeading>{t("agent_panel")}</SectionHeading>
              <Link
                to="/agent/dashboard"
                onClick={onClose}
                className={linkClasses(path === "/agent/dashboard")}
              >
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                {t("dashboard")}
              </Link>
              {canCreateProperties && (
                <Link
                  to="/agent/create-property"
                  onClick={onClose}
                  className={linkClasses(path === "/agent/create-property")}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  {t("create_property")}
                </Link>
              )}
              <Link
                to="/agent/properties"
                onClick={onClose}
                className={linkClasses(path === "/agent/properties")}
              >
                <Building2 className="h-4 w-4 flex-shrink-0" />
                {t("my_properties")}
              </Link>
              {permissions?.can_manage_inquiries && (
                <Link
                  to="/agent/inquiries"
                  onClick={onClose}
                  className={linkClasses(path === "/agent/inquiries")}
                >
                  <MailOpen className="h-4 w-4 flex-shrink-0" />
                  {t("inquiries")}
                </Link>
              )}
              <Link
                to="/agent/profile"
                onClick={onClose}
                className={linkClasses(path === "/agent/profile")}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                {t("agent_profile")}
              </Link>
            </>
          )}

          <div className="my-1 border-t border-border" />

          <Link to="/about" onClick={onClose} className={linkClasses(path === "/about")}>
            <Info className="h-4 w-4 flex-shrink-0" />
            {t("about")}
          </Link>

          {isAuthenticated && (
            <Link to="/chat" onClick={onClose} className={linkClasses(path === "/chat")}>
              <span className="relative flex-shrink-0">
                <MessageCircle className="h-4 w-4" />
                {hasUnread && (
                  <Badge
                    variant="danger"
                    className="absolute -right-2 -top-2 h-4 min-w-[1rem] justify-center px-1 py-0 leading-none"
                  >
                    {formattedCount}
                  </Badge>
                )}
              </span>
              {t("chat")}
            </Link>
          )}

          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={linkClasses(false)}
          >
            <Handshake className="h-4 w-4 flex-shrink-0" />
            {t("support")}
          </a>

          <div className="my-1 border-t border-border" />

          {showUserMenu ? (
            <>
              <Link
                to="/myprofile"
                onClick={onClose}
                className={linkClasses(path === "/myprofile")}
              >
                <UserIcon className="h-4 w-4 flex-shrink-0" />
                {t("my_profile")}
              </Link>
              <Link
                to="/my-services"
                onClick={onClose}
                className={linkClasses(path === "/my-services")}
              >
                <ListChecks className="h-4 w-4 flex-shrink-0" />
                {t("my_services_title")}
              </Link>
              <Link
                to="/my-products"
                onClick={onClose}
                className={linkClasses(path === "/my-products")}
              >
                <Box className="h-4 w-4 flex-shrink-0" />
                {t("my_products_title")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutHandler();
                  onClose();
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                {t("logout")}
              </button>
            </>
          ) : showLogin ? (
            <Link
              to="/login"
              onClick={onClose}
              className={linkClasses(path === "/login")}
            >
              <LogIn className="h-4 w-4 flex-shrink-0" />
              {t("login")}
            </Link>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted">
              <UserIcon className="h-4 w-4 flex-shrink-0" />
              {t("loading")}
            </div>
          )}

          {isAuthenticated && userRole && (
            <div className="mt-3 flex justify-center border-t border-border pt-3">
              <RoleBadge userRole={userRole} lastUpdated={lastUpdated} />
            </div>
          )}

          {isVerifiedAgent && agentInfo && (
            <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3">
              <div className="truncate text-sm font-medium text-success">
                {agentInfo.agency_name}
              </div>
              <div className="mt-1 text-xs text-success">
                Rating: {agentInfo.rating}/5.0 &bull; {agentInfo.total_sales} sales
              </div>
            </div>
          )}

          {isPendingAgent && (
            <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
              <div className="flex items-center text-sm text-warning">
                <Clock className="mr-2 h-3 w-3 flex-shrink-0" />
                {t("application_under_review")}
              </div>
              <Link
                to="/agent/status"
                onClick={onClose}
                className="mt-1 block text-xs font-medium text-warning hover:underline"
              >
                {t("check_status")}
              </Link>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
}
