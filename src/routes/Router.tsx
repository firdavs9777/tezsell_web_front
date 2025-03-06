import React from "react";
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
import MainProfile from "../pages/Profile/MainProfile";
import MyProducts from "../pages/Profile/MyProducts";

const Router = () => {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/new-product" element={<NewProduct />} />
      <Route path="/service" element={<Service />} />
      <Route path="/service/:id" element={<ServiceDetail />} />
      <Route path="/new-service" element={<NewService />} />
      <Route path="/myprofile" element={<MainProfile />} />
      <Route path="/my-products" element={<MyProducts />} />
    </Routes>
  );
};

export default Router;
