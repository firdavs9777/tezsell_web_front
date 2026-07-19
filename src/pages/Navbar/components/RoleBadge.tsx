import { Clock, Settings, ShieldCheck, User, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@components/ui";

type Role =
  | "super_admin"
  | "staff"
  | "verified_agent"
  | "pending_agent"
  | "regular_user";

const ROLE_CONFIG: Record<
  Role,
  { labelKey: string; icon: typeof User; variant: "primary" | "warning" }
> = {
  super_admin: { labelKey: "super_admin", icon: ShieldCheck, variant: "primary" },
  staff: { labelKey: "staff", icon: Settings, variant: "primary" },
  verified_agent: {
    labelKey: "verified_agent",
    icon: UserCheck,
    variant: "primary",
  },
  pending_agent: { labelKey: "pending_agent", icon: Clock, variant: "warning" },
  regular_user: { labelKey: "regular_user", icon: User, variant: "primary" },
};

export interface RoleBadgeProps {
  userRole?: string;
  lastUpdated?: string;
}

export default function RoleBadge({ userRole, lastUpdated }: RoleBadgeProps) {
  const { t } = useTranslation();
  const config = ROLE_CONFIG[userRole as Role] || ROLE_CONFIG.regular_user;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="whitespace-nowrap">
      <Icon className="h-3 w-3 flex-shrink-0" />
      {t(config.labelKey)}
      {lastUpdated && (
        <span
          className="ml-1 h-2 w-2 rounded-full bg-success"
          title={`${t("last_updated")} ${new Date(lastUpdated).toLocaleTimeString()}`}
        />
      )}
    </Badge>
  );
}
