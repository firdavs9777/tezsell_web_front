import {
  ChevronDown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { cn } from "@utils/cn";
import { Dropdown, DropdownItem } from "@components/ui";
import { selectIsSuperAdmin, selectPermissions } from "@store/slices/authSlice";

export default function AdminMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const isSuperAdmin = useSelector(selectIsSuperAdmin);
  const permissions = useSelector(selectPermissions);

  const isActive =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/staff");

  const dashboardPath = isSuperAdmin ? "/admin/dashboard" : "/staff/dashboard";

  return (
    <Dropdown
      trigger={
        <span
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          {isSuperAdmin ? (
            <ShieldCheck className="h-4 w-4" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          {isSuperAdmin ? t("admin") : t("staff")}
          <ChevronDown className="h-4 w-4" />
        </span>
      }
    >
      <DropdownItem to={dashboardPath}>
        <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
        {t("dashboard")}
      </DropdownItem>
      {permissions?.can_manage_users && (
        <DropdownItem to="/admin/users">
          <Users className="h-4 w-4 flex-shrink-0" />
          {t("manage_users")}
        </DropdownItem>
      )}
      {permissions?.can_verify_agents && (
        <>
          <DropdownItem to="/admin/pending-agents">
            <UserCheck className="h-4 w-4 flex-shrink-0" />
            {t("pending_agents")}
          </DropdownItem>
          <DropdownItem to="/admin/verified-agents">
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            {t("verified_agents")}
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
