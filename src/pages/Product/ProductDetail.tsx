import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSingleProductQuery } from "../../store/slices/productsApiSlice";
import { Product, SingleProduct } from "../../store/type";
import "./ProductDetail.css";
import { BASE_URL } from "../../store/constants";

const ProductDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleProductQuery(id);
  const singleProduct: SingleProduct = data as SingleProduct;
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    if (singleProduct?.product.images.length > 0) {
      setSelectedImage(
        `${BASE_URL}/products${singleProduct.product.images[0].image}`
      );
    }
  }, [singleProduct]);
  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString("en-US").replace(/,/g, ".") + "";
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
  const redirectHandler = (id: number) => {
    navigate(`/product/${id}`);
  };

  return (
    <div>
      <div className="product-detail-container">
        <div className="product-detail-left">
          <div className="product-image-gallery">
            <img
              className="selected-image"
              src={`${selectedImage}`}
              alt={singleProduct.product.title}
            />
            <div className="image-thumbnails">
              {singleProduct.product.images.map((image, index) => (
                <img
                  key={index}
                  className="thumbnail"
                  src={`${BASE_URL}/products${image.image}`}
                  alt={singleProduct.product.title}
                  onClick={() => handleImageClick(image.image)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="product-detail-right">
          <h1 className="product-title">{singleProduct.product.title}</h1>
          <p className="product-description">
            {singleProduct.product.description}
          </p>
          <div className="product-info">
            <p className="product-price">
              {formatPrice(singleProduct.product.price)}{" "}
              {singleProduct.product.currency}
            </p>
            <p className="product-availability">
              {singleProduct.product.in_stock ? "In Stock" : "Out of Stock"}
            </p>
            <p className="product-condition">
              Condition: {singleProduct.product.condition}
            </p>
            <p className="product-likes">
              Likes: {singleProduct.product.likeCount}
            </p>
          </div>
          <div className="product-rating">
            <p>Rating: {singleProduct.product.rating} / 5</p>
          </div>
          <div className="product-actions">
            <button className="btn-buy-now">Like</button>
            <button className="btn-add-to-cart">Chat</button>
          </div>
        </div>
      </div>
      <section className="recommended-products-section">
        <h1>Recommended Products</h1>
        <div className="rec-product-grid">
          {singleProduct.recommended_products.map((item: Product) => (
            <div
              key={item.id}
              className="rec-product-card"
              onClick={() => redirectHandler(item.id)}
            >
              <img
                src={`${BASE_URL}/products${item.images[0]?.image}`}
                alt={item.title}
                className="rec-product-image"
              />
              <h3 className="rec-product-title">{item.title.slice(0, 15)}</h3>
              <p className="rec-product-description">
                {item.description.slice(0, 10)}...
              </p>
              <div className="rec-product-footer">
                <span className="rec-product-price">{item.price} So'm </span>
                <span className="rec-product-condition">{item.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
