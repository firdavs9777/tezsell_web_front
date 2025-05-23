import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home/Home";
import About from "../pages/About/About";
import Service from "../pages/Service/Service";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import ProductDetail from "../pages/Product/ProductDetail";
import NewProduct from "../pages/Product/NewProduct";
import ServiceDetail from "../pages/Service/ServiceDetail";
import NewService from "../pages/Service/NewService";
import MainProfile from "../pages/Service/MainProfile";
import MyProducts from "../pages/Product/MyProducts";
import MyServices from "../pages/Service/MyServices";
import MainChat from "../pages/Messages/MainChat";
import ProductScreen from "@pages/Product/Products";
import ProtectedRoute from "./ProtectRoute";

const Router = () => {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductScreen />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/service" element={<Service />} />
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/new-product" element={<NewProduct />} />
        <Route path="/new-service" element={<NewService />} />
        <Route path="/myprofile" element={<MainProfile />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/my-services" element={<MyServices />} />
        <Route path="/my-services" element={<MyServices />} />
        <Route path="/chat" element={<MainChat />} />
        <Route path="/chat/:chatId" element={<MainChat />} />
      </Route>
    </Routes>
  );
};

export default Router;
