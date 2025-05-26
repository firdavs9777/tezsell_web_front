import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { userInfo } = useSelector((state: any) => state.auth);
  return userInfo?.token ? <Outlet /> : <Navigate to="/login" replace />;
};
export default ProtectedRoute;
