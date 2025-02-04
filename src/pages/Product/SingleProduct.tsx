import React, { useState } from 'react';
import { Product } from '../../store/type';
import { BASE_URL } from '../../store/constants';
import './SingleProduct.css';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaPlus, FaRegHeart } from 'react-icons/fa';

import { IoLocationOutline } from "react-icons/io5";
import { MdDescription } from "react-icons/md";
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useGetFavoriteItemsQuery, useLikeProductMutation, useUnlikeProductMutation } from '../../store/slices/productsApiSlice';
import { ServiceRes } from '../Profile/MainProfile';
import { toast } from 'react-toastify';

interface SingleProductProps {
  product: Product;
}

const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const navigate = useNavigate();


  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const { data: favorite_items, isLoading: fav_loading, error: fav_error, refetch: reload } = useGetFavoriteItemsQuery({
    token: token,
  });
  const [likeProduct, { isLoading: create_loading_like }] = useLikeProductMutation()
    const [dislikeProduct, { isLoading: create_loading_unlike }] = useUnlikeProductMutation()
  
  const liked_items: ServiceRes = favorite_items as ServiceRes;


  const redirectHandler = (id: number) => {
    navigate(`/product/${id}`);
  };

  const handleNewProductRedirect = () => {
    navigate('/new-product');
  };

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString('en-US').replace(/,/g, '.') + '';
  };

  const formattedDate = new Date(product.created_at).toLocaleDateString();


    const handleLikeProduct = async () => {
      try {
        const token = userInfo?.token;
        const response = await likeProduct({ productId: product.id, token: token });
  
        if (response.data) {
          toast.success('Product liked successfully', { autoClose: 1000 });
      
          reload();
        }
      }
      catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Error while creating product", { autoClose: 1000 });
        } else {
          toast.error("An unknown error occurred while creating the product", { autoClose: 3000 });
        }
      }
    };
  
    const handleDislikeProduct = async () => {
      try {
        const token = userInfo?.token;
        const response = await dislikeProduct({ productId: product.id, token: token });
  
        if (response.data) {
          toast.success('Product disliked successfully', { autoClose: 1000 });
          reload();
        }
      }
      catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || "Error while creating product", { autoClose: 3000 });
        } else {
          toast.error("An unknown error occurred while creating the product", { autoClose: 3000 });
        }
      }
    };

  return (
    <div className="product-card">
      <div className="image-container" onClick={() => redirectHandler(product.id)} onClick={() => redirectHandler(product.id)}>
        {product && product.images.length > 0 ? (
          <img
            src={`${BASE_URL}/products${product.images[0].image}`}
            alt={product.title}
            className="product-image"
          />
        ) : (
          <></>
        )}
      </div>
      <div className="product-details" >
        <h2 className="product-price" onClick={() => redirectHandler(product.id)}>{formatPrice(product.price)} So'm</h2>
        <p className="product-title" onClick={() => redirectHandler(product.id)}>

          <MdDescription />
          {product.title}</p>

        <p className="product-location" onClick={() => redirectHandler(product.id)}>
          <IoLocationOutline />    {product.location ? product.location.region + ' - ' : ''}
          {product.location ? product.location.district : ''}
        </p>

        <div className="like-container" >

          {liked_items && liked_items.liked_products && liked_items.liked_products.some((item: Product) => item.id === product.id) ? (<div>
            <FaHeart style={{ color: 'red' }} onClick={handleDislikeProduct}/></div>) : (<div>
              <FaRegHeart onClick={handleLikeProduct} />
            </div>)} 
        </div>

        <p className="product-created-at">{formattedDate}</p>
      </div>
      <div className="add-new-product" onClick={handleNewProductRedirect}>
        <FaPlus style={{ fontSize: '30px', color: 'white' }} />
      </div>
    </div>
  );
};

export default SingleProduct;
