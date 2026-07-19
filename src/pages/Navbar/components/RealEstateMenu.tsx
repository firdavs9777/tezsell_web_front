import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Home,
  Map,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { cn } from "@utils/cn";
import { Dropdown, DropdownItem } from "@components/ui";
import {
  selectIsAgent,
  selectIsAuthenticated,
  selectUserRole,
} from "@store/slices/authSlice";

export default function RealEstateMenu() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAgent = useSelector(selectIsAgent);
  const userRole = useSelector(selectUserRole);
  const isPendingAgent = userRole === "pending_agent";

  const isActive =
    location.pathname === "/properties" ||
    location.pathname.startsWith("/properties/") ||
    location.pathname === "/agents" ||
    location.pathname === "/become-agent" ||
    location.pathname === "/agent/status";

  return (
    <Dropdown
      trigger={
        <span
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          <Home className="h-4 w-4" />
          {t("real_estate")}
          <ChevronDown className="h-4 w-4" />
        </span>
      }
    >
      <DropdownItem to="/properties">
        <Building2 className="h-4 w-4 flex-shrink-0" />
        {t("properties_main")}
      </DropdownItem>
      <DropdownItem to="/properties-map-view">
        <Map className="h-4 w-4 flex-shrink-0" />
        {t("map_main")}
      </DropdownItem>
      <DropdownItem to="/agents">
        <Users className="h-4 w-4 flex-shrink-0" />
        {t("agents")}
      </DropdownItem>
      {isAuthenticated && !isAgent && (
        <DropdownItem to="/become-agent">
          <UserPlus className="h-4 w-4 flex-shrink-0" />
          {t("become_agent")}
        </DropdownItem>
      )}
      {isAuthenticated && (isAgent || isPendingAgent) && (
        <DropdownItem to="/agent/status">
          {isPendingAgent ? (
            <Clock className="h-4 w-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          )}
          {t("agent_status")}
        </DropdownItem>
      )}
      {isAuthenticated && (
        <DropdownItem to="/saved-properties">
          <Heart className="h-4 w-4 flex-shrink-0" />
          {t("saved_properties")}
        </DropdownItem>
      )}
    </Dropdown>
  );
}
