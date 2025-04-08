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
  FaUser,
  FaMapMarkerAlt,
} from "react-icons/fa"; // Importing FaArrowLeft

import { useSelector } from "react-redux";
import { ServiceRes } from "../Profile/MainProfile";
import { RootState } from "../../store";
import { toast } from "react-toastify";
import MyProductEdit from "../Profile/ProductEdit";
import { Chat, useCreateChatRoomMutation } from "../../store/slices/chatSlice";

const ProductDetail = () => {
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
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
const [createChatRoom, { isLoading: chatLoading }] = useCreateChatRoomMutation();

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
  const handleEditModal = () => {
    setIsEdit(!isEdit);
  };
  const onCloseHandler = () => {
    refetch();
    if (singleProduct.product.images) {
     setSelectedImage(
        `${BASE_URL}/products${singleProduct.product.images[0].image}`
      ); 
    }
    else {
      setSelectedImage('')
    }
     
  }
  const handleChat = async () => {
  if (!userInfo?.token || !userInfo?.user_info?.id) {
    toast.error("You must be logged in to start a chat");
    return;
  }

  try {
    const productOwnerId = singleProduct.product.userName.id;
    const currentUserId = userInfo.user_info.id;

    // Avoid chatting with yourself
    if (currentUserId === productOwnerId) {
      toast.info("You can't chat with yourself.");
      return;
    }

    const chatName = `${singleProduct.product.userName.username}`;

    const result= await createChatRoom({
      name: chatName,
      participants: [currentUserId, productOwnerId],
      token: userInfo.token,
    });

    if ('data' in result) {
      const res = result.data as Chat;
      const chatId = res.id;
      toast.success("Chat room created!");
      navigate(`/chat/${chatId}`); // Redirect to chat page
    } else {
      throw new Error("Failed to create chat");
    }
  } catch (error: any) {
    toast.error(error.message || "Chat creation failed");
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
          
          <div className="flex p-2 m-2 ">
                         {singleProduct.product.userName?.profile_image ? (
                <img
                  src={`${BASE_URL}/${singleProduct.product.userName.profile_image.image}`}
                  alt={singleProduct.product.userName.username}
                  className="owner-profile-image m-1"
                />
              ) : (
                <svg
                  className="comment-author-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="50"
                  height="50"
                  fill="gray"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              )}
              <div className="p-2">
                          <p className="p-2">
                            <FaUser /> {singleProduct.product.userName.username}
                          </p>
                          <p className="p-2">
                            <FaMapMarkerAlt /> {singleProduct.product.userName?.region} -{" "}
                 {singleProduct.product.userName.location.district}
                          </p>
                        </div>
 </div>
          {userInfo?.user_info.id == singleProduct.product.userName.id ? (
      <div className="product-modification">
                    <p className="product-edit">
                      <span onClick={handleEditModal} >
                        <FaEdit onClick={handleEditModal} /> Edit
                      </span>
                    </p>
                    <p className="product-delete">
                      <FaTrash />
                      <span>Delete</span>
                    </p>
                  </div>
          ): (<></>)}
            
          
                  {isEdit && (
            <MyProductEdit
              onClose={onCloseHandler}
            productId={singleProduct.product.id.toString()}
            closeModelStatus={isEdit}
          />
        )}
          

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
            <button className="btn-chat" onClick={handleChat}>
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