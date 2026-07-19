import { Box, ListChecks, LogOut, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Avatar, Dropdown, DropdownItem } from "@components/ui";
import { logout, selectToken } from "@store/slices/authSlice";
import { useLogoutUserMutation } from "@store/slices/users";
import RoleBadge from "./RoleBadge";

export interface UserMenuProps {
  displayName: string;
  avatarSrc?: string | null;
  userRole?: string;
  lastUpdated?: string;
  clearAllStorage: () => void;
}

export default function UserMenu({
  displayName,
  avatarSrc,
  userRole,
  lastUpdated,
  clearAllStorage,
}: UserMenuProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectToken);
  const [logoutApiCall] = useLogoutUserMutation();

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

  return (
    <Dropdown
      align="right"
      trigger={
        <span className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5">
          <Avatar src={avatarSrc} name={displayName} size="sm" />
          <span className="max-w-[8rem] truncate">{displayName}</span>
        </span>
      }
    >
      <div className="px-4 py-2">
        <RoleBadge userRole={userRole} lastUpdated={lastUpdated} />
      </div>
      <DropdownItem to="/myprofile">
        <UserIcon className="h-4 w-4 flex-shrink-0" />
        {t("my_profile")}
      </DropdownItem>
      <DropdownItem to="/my-services">
        <ListChecks className="h-4 w-4 flex-shrink-0" />
        {t("my_services_title")}
      </DropdownItem>
      <DropdownItem to="/my-products">
        <Box className="h-4 w-4 flex-shrink-0" />
        {t("my_products_title")}
      </DropdownItem>
      <DropdownItem onClick={logoutHandler} className="text-danger hover:bg-danger/10">
        <LogOut className="h-4 w-4 flex-shrink-0" />
        {t("logout")}
      </DropdownItem>
    </Dropdown>
  );
}
