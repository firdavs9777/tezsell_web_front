import {
  Building2,
  ChevronDown,
  FileText,
  LayoutDashboard,
  MailOpen,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { cn } from "@utils/cn";
import { Dropdown, DropdownItem } from "@components/ui";
import { selectCanCreateProperties, selectPermissions } from "@store/slices/authSlice";

export default function AgentMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const canCreateProperties = useSelector(selectCanCreateProperties);
  const permissions = useSelector(selectPermissions);

  const isActive =
    location.pathname.startsWith("/agent/dashboard") ||
    location.pathname.startsWith("/agent/properties") ||
    location.pathname.startsWith("/agent/inquiries") ||
    location.pathname === "/agent/create-property";

  return (
    <Dropdown
      trigger={
        <span
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          {t("agent_panel")}
          <ChevronDown className="h-4 w-4" />
        </span>
      }
    >
      <DropdownItem to="/agent/dashboard">
        <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
        {t("dashboard")}
      </DropdownItem>
      {canCreateProperties && (
        <DropdownItem to="/agent/create-property">
          <Plus className="h-4 w-4 flex-shrink-0" />
          {t("create_property")}
        </DropdownItem>
      )}
      <DropdownItem to="/agent/properties">
        <Building2 className="h-4 w-4 flex-shrink-0" />
        {t("my_properties")}
      </DropdownItem>
      {permissions?.can_manage_inquiries && (
        <DropdownItem to="/agent/inquiries">
          <MailOpen className="h-4 w-4 flex-shrink-0" />
          {t("inquiries")}
        </DropdownItem>
      )}
      <DropdownItem to="/agent/profile">
        <FileText className="h-4 w-4 flex-shrink-0" />
        {t("agent_profile")}
      </DropdownItem>
    </Dropdown>
  );
}
