import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAutoLogout } from "../hooks/useAutoLogout";

const ProtectedRoute = () => {
  const { userInfo, processedUserInfo } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const { resetTimer } = useAutoLogout();

  // Get token (prioritize access_token, fallback to token for backward compatibility)
  const token = processedUserInfo?.access_token || processedUserInfo?.token || userInfo?.access_token || userInfo?.token;

  // Reset activity timer when accessing protected routes
  useEffect(() => {
    if (token) {
      resetTimer();
    }
  }, [token, location.pathname, resetTimer]);

  // If not authenticated, redirect to login with the current location
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
