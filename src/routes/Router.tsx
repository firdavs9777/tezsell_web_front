import Login from "@authentication/Login/Login";
import Register from "@authentication/Register/Register";
import MainChat from "@chats/MainChat";
import About from "@pages/About/About";
import Home from "@pages/Home/Home";
import ProductScreen from "@pages/Product/Products";
import MainRealEstate from "@pages/RealEstate/MainRealEstate";
import Service from "@pages/Service/Service";
import MyProducts from "@products/MyProducts";
import NewProduct from "@products/NewProduct";
import ProductDetail from "@products/ProductDetail";
import ProtectedRoute from "@routes/ProtectRoute";
import MainProfile from "@services/MainProfile";
import MyServices from "@services/MyServices";
import NewService from "@services/NewService";
import ServiceDetail from "@services/ServiceDetail";
import { Route, Routes } from "react-router-dom";

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
      <Route path="/properties"  element={<MainRealEstate/>}/>
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
