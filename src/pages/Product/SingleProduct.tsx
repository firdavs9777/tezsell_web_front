import React from 'react';
import { Product } from '../../store/type';
import { BASE_URL } from '../../store/constants';
import './SingleProduct.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
interface SingleProductProps {
  product: Product;
}
const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
   const sp = new URLSearchParams(search);
  //  const redirect = sp.get('redirect') || '/';
  const redirectHandler = (id: number) => {
    navigate(`/product/${id}`);
  }
    const handleNewProductRedirect = () => {
    navigate('/new-product');
  };
   const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString('en-US').replace(/,/g, '.') + '';  
  };
  const formattedDate = new Date(product.created_at).toLocaleDateString();
  return (
    <div className="product-card" >
      <div className="image-container" onClick={() => redirectHandler(product.id)}>
        {product && product.images.length > 0 ? (
        <img src={`${BASE_URL}/products${product.images[0].image}`} alt={product.title} className="product-image" />
        ): (<></>)}
      </div>
      <div className="product-details" onClick={() => redirectHandler(product.id)}>
        <h2 className="product-price">{formatPrice(product.price)} So'm</h2>
        <p className="product-title"><strong>{product.title}</strong> </p>
        
        <p className="product-location"> { product.location ? product.location.region + ' - ' : ''}  {product.location ? product.location.district : ''}</p>
        <p className="product-created-at">{formattedDate}</p>
      </div>
           <div className="add-new-product" onClick={handleNewProductRedirect}>
      <FaPlus style={{ fontSize: '30px', color: 'white' }} />
      </div>
    </div>
  );
};

export default SingleProduct;
