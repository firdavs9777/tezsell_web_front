import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetFavoriteItemsQuery,
  useGetSingleProductQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "../../store/slices/productsApiSlice";
import { Product, SingleProduct } from "../../store/type";
import "./ProductDetail.css";
import { BASE_URL } from "../../store/constants";
import {
  FaHeart,
  FaRegHeart,
  FaArrowLeft,
  FaThumbsUp,
  FaRegThumbsUp,
  FaCommentAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa"; // Importing FaArrowLeft

import { useSelector } from "react-redux";
import { ServiceRes } from "../Profile/MainProfile";
import { RootState } from "../../store";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetSingleProductQuery(id);
  const [likeProduct, { isLoading: create_loading_like }] =
    useLikeProductMutation();
  const [dislikeProduct, { isLoading: create_loading_unlike }] =
    useUnlikeProductMutation();

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const {
    data: favorite_items,
    isLoading: fav_loading,
    error: fav_error,
    refetch: reload,
  } = useGetFavoriteItemsQuery({
    token: token,
  });

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const singleProduct: SingleProduct = data as SingleProduct;
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();

  // Handle back navigation
  const handleGoBack = () => {
    navigate("/"); // Go back to the previous page
  };

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

  const handleLikeProduct = async () => {
    try {
      const token = userInfo?.token;
      const response = await likeProduct({
        productId: singleProduct.product.id,
        token: token,
      });

      if (response.data) {
        toast.success("Product liked successfully", { autoClose: 1000 });
        refetch();
        reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating product", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred while creating the product", {
          autoClose: 3000,
        });
      }
    }
  };

  const handleDislikeProduct = async () => {
    try {
      const token = userInfo?.token;
      const response = await dislikeProduct({
        productId: singleProduct.product.id,
        token: token,
      });

      if (response.data) {
        toast.success("Product disliked successfully", { autoClose: 1000 });
        refetch();
        reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating product", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred while creating the product", {
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div>
      <div className="product-detail-container">
        {/* Back button */}
        <div className="back-button" onClick={handleGoBack}>
          <FaArrowLeft size={24} />
        </div>

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
          </div>
          <div className="product-rating">
            <p>Rating: {singleProduct.product.rating} / 5</p>
          </div>
          {userInfo?.user_info.id == singleProduct.product.userName.id ? (
      <div className="product-modification">
                    <p className="product-edit">
                      <span >
                        <FaEdit  /> Edit
                      </span>
                    </p>
                    <p className="product-delete">
                      <FaTrash />
                      <span>Delete</span>
                    </p>
                  </div>
          ): (<></>)}
            
          

          {liked_items &&
          liked_items.liked_products &&
          liked_items.liked_products.some(
            (item: Product) => item.id === singleProduct.product.id
          ) ? (
            <div className="product-actions">
              <button className="btn-like" onClick={handleDislikeProduct}>
                <FaThumbsUp size={24} color="white" /> Like
              </button>
            </div>
          ) : (
            <div className="product-actions">
              <button className="btn-dislike" onClick={handleLikeProduct}>
                <FaRegThumbsUp size={24} /> Like
              </button>
            </div>
          )}

          <div className="product-actions">
            <button className="btn-chat">
              <FaCommentAlt size={24} /> Chat
            </button>
          </div>

          <div className="like-count-section">
  <FaThumbsUp size={24} color="blue" /> {singleProduct.product.likeCount} 
</div>
        </div>
      </div>

      <section className="recommended-products-section">
        <h1 className="section-title">Recommended Products</h1>
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