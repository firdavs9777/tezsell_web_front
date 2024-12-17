import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import Service from '../pages/Service/Service';
import Login from '../pages/Authentication/Login/Login';
import Register from '../pages/Authentication/Register/Register';


const Router = () => {
  return (
    <Routes>
      <Route path="/about" element={<About />} />
      <Route path="/service" element={<Service />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register/>} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default Router;
