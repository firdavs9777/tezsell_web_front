import Login from "@authentication/Login/Login";
import Register from "@authentication/Register/Register";
import MainChat from "@chats/MainChat";
import About from "@pages/About/About";
import Home from "@pages/Home/Home";
import ProductScreen from "@pages/Product/Products";
import AgentsList from "@pages/RealEstate/agents/AgentsList";
import MainRealEstate from "@pages/RealEstate/MainRealEstate";
import RealEstateDetail from "@pages/RealEstate/properties/PropertyDetail";
import Service from "@pages/Service/Service";
import MyProducts from "@products/MyProducts";
import NewProduct from "@products/NewProduct";
import ProductDetail from "@products/ProductDetail";
import ProtectedRoute from "@routes/ProtectRoute";
import MainProfile from "@services/MainProfile";
import MyServices from "@services/MyServices";
import NewService from "@services/NewService";
import ServiceDetail from "@services/ServiceDetail";
import { RootState } from "@store/index";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes, useLocation } from "react-router-dom";
import { useAutoLogout } from "../hooks/useAutoLogout";

// Component to handle auto-logout for authenticated routes
const AutoLogoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const { resetTimer } = useAutoLogout();

  // Reset timer on route changes for authenticated users
  useEffect(() => {
    if (userInfo?.token) {
      resetTimer();
    }
  }, [location.pathname, userInfo?.token, resetTimer]);

  return <>{children}</>;
};

const Router = () => {
  return (
    <AutoLogoutWrapper>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductScreen />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/service" element={<Service />} />
        <Route path="/agents" element={<AgentsList />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path="/properties" element={<MainRealEstate />} />
                <Route path="/properties/:id" element={<RealEstateDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/new-product" element={<NewProduct />} />
          <Route path="/new-service" element={<NewService />} />
          <Route path="/myprofile" element={<MainProfile />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/my-services" element={<MyServices />} />
          <Route path="/chat" element={<MainChat />} />
          <Route path="/chat/:chatId" element={<MainChat />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </AutoLogoutWrapper>
  );
};

export default Router;
