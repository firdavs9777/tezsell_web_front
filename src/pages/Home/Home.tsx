import React from 'react';
import ProductScreen from '../Product/Products';
// import { useTranslation } from 'react-i18next';

const Home = () => {
  // const { t } = useTranslation();

  return (
    <div className="home-container">
      <ProductScreen/>
    </div>
  );
};

export default Home;
