import React from 'react';
import { Product } from '../../store/type';
import { BASE_URL } from '../../store/constants';
import './SingleProduct.css'
interface SingleProductProps {
  product: Product;
}
const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const formattedDate = new Date(product.created_at).toLocaleDateString();
  return (
    <div className="product-card">
      <div className="image-container">
        {product && product.images.length > 0 ? (
        <img src={`${BASE_URL}/products${product.images[0].image}`} alt={product.title} className="product-image" />
        ): (<></>)}
      </div>
      <div className="product-details">
        <h2 className="product-price">{product.price} sum</h2>
        <p className="product-title"><strong>{product.title}</strong> </p>
        
        <p className="product-location"> { product.location ? product.location.region : ''} - {product.location ? product.location.district:''} tumani</p>
        <p className="product-created-at">{formattedDate}</p>
      </div>
    </div>
  );
};

export default SingleProduct;
