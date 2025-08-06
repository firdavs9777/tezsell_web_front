import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAutoLogout } from "../hooks/useAutoLogout";

const ProtectedRoute = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const { resetTimer } = useAutoLogout();

  // Reset activity timer when accessing protected routes
  useEffect(() => {
    if (userInfo?.token) {
      resetTimer();
    }
  }, [userInfo?.token, location.pathname, resetTimer]);

  // If not authenticated, redirect to login with the current location
  if (!userInfo?.token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
