import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetSingleProductQuery } from "../../store/slices/productsApiSlice";
import { Product } from "../../store/type";
import "./ProductDetail.css";
import { BASE_URL } from "../../store/constants";

const ProductDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleProductQuery(id);
  const singleProduct: Product = data as Product;
  const [selectedImage, setSelectedImage] = useState("");
   useEffect(() => {
    if (singleProduct?.images.length > 0) {
      setSelectedImage(`${BASE_URL}/products${singleProduct.images[0].image}`);
    }
   }, [singleProduct]);
   const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString('en-US').replace(/,/g, '.') + '';  
  };
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error Occurred...</div>;
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(`${BASE_URL}/products${image}`);
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-left">
        <div className="product-image-gallery">
           <img
            className="selected-image"
            src={`${selectedImage}`}
            alt={singleProduct.title}
          /> 
          <div className="image-thumbnails">
            {singleProduct.images.map((image, index) => (
              <img
                key={index}
                className="thumbnail"
                src={`${BASE_URL}/products${image.image}`}
                alt={singleProduct.title}
                onClick={() => handleImageClick(image.image)}
              />
            ))}
          </div> 
        </div>
      </div>

      <div className="product-detail-right">
        <h1 className="product-title">{singleProduct.title}</h1>
        <p className="product-description">{singleProduct.description}</p>
        <div className="product-info">
          <p className="product-price">
            {formatPrice(singleProduct.price)} {singleProduct.currency}
          </p>
          <p className="product-availability">
            {singleProduct.in_stock ? "In Stock" : "Out of Stock"}
          </p>
          <p className="product-condition">Condition: {singleProduct.condition}</p>
          <p className="product-likes">
            Likes: {singleProduct.likeCount} 
          </p>
        </div>
           <div className="product-rating">
          <p>Rating: {singleProduct.rating} / 5</p>
        </div>
        <div className="product-actions">
          <button className="btn-buy-now">Like</button>
          <button className="btn-add-to-cart">Chat</button>
        </div>
     
      </div>
    </div>
  );
};

export default ProductDetail;
