import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetFavoriteItemsQuery,
  useGetSingleProductQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "@store/slices/productsApiSlice";
import { Product, SingleProduct } from "@store/type";
import "./ProductDetail.css";
import { BASE_URL } from "@store/constants";
import {
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
  const [createChatRoom, { isLoading: chatLoading }] =
    useCreateChatRoomMutation();

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
    } else {
      setSelectedImage("");
    }
  };
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

      const result = await createChatRoom({
        name: chatName,
        participants: [currentUserId, productOwnerId],
        token: userInfo.token,
      });

      if ("data" in result) {
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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Back Button */}
      <div
        className="mb-4 cursor-pointer text-gray-600 hover:text-black"
        onClick={handleGoBack}
      >
        <FaArrowLeft size={24} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left - Product Images */}
        <div className="flex-1">
          <div className="w-full">
            <img
              className="w-full h-auto rounded-xl object-cover"
              src={selectedImage}
              alt={singleProduct.product.title}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {singleProduct.product.images.map((image, index) => (
              <img
                key={index}
                src={`${BASE_URL}/products${image.image}`}
                alt="thumbnail"
                className="w-16 h-16 object-cover rounded-md cursor-pointer border hover:border-blue-500"
                onClick={() => handleImageClick(image.image)}
              />
            ))}
          </div>
        </div>

        {/* Right - Product Details */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold">{singleProduct.product.title}</h1>
          <p className="text-gray-600">{singleProduct.product.description}</p>

          <div className="space-y-1">
            <p className="text-xl font-semibold text-green-600">
              {formatPrice(singleProduct.product.price)}{" "}
              {singleProduct.product.currency}
            </p>
            <p className="text-sm">
              {singleProduct.product.in_stock ? "In Stock" : "Out of Stock"}
            </p>
            <p className="text-sm">
              Condition: {singleProduct.product.condition}
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Rating: {singleProduct.product.rating} / 5
          </div>

          <div className="flex items-center gap-4 p-2 border rounded-md">
            {singleProduct.product.userName?.profile_image ? (
              <img
                src={`${BASE_URL}/${singleProduct.product.userName.profile_image.image}`}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
                <FaUser size={24} />
              </div>
            )}
            <div>
              <p className="font-semibold">
                {singleProduct.product.userName.username}
              </p>
              <p className="text-sm text-gray-600">
                <FaMapMarkerAlt className="inline mr-1" />

                {singleProduct.product?.userName?.location?.district}
              </p>
            </div>
          </div>

          {userInfo?.user_info.id === singleProduct.product.userName.id && (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleEditModal}
                className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <FaEdit /> Edit
              </button>
              <button className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                <FaTrash /> Delete
              </button>
            </div>
          )}

          {isEdit && (
            <MyProductEdit
              onClose={onCloseHandler}
              productId={singleProduct.product.id.toString()}
              closeModelStatus={isEdit}
            />
          )}

          <div className="flex gap-4 mt-6">
            {liked_items?.liked_products?.some(
              (item: Product) => item.id === singleProduct.product.id
            ) ? (
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleDislikeProduct}
              >
                <FaThumbsUp /> Liked
              </button>
            ) : (
              <button
                className="flex items-center gap-2 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={handleLikeProduct}
              >
                <FaRegThumbsUp /> Like
              </button>
            )}

            <button
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              onClick={handleChat}
            >
              <FaCommentAlt /> Chat
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 text-blue-600 font-semibold">
            <FaThumbsUp /> {singleProduct.product.likeCount}
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Recommended Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {singleProduct.recommended_products.map((item: Product) => (
            <div
              key={item.id}
              onClick={() => redirectHandler(item.id)}
              className="bg-white rounded-lg border shadow hover:shadow-lg cursor-pointer p-3 transition"
            >
              <img
                src={`${BASE_URL}/products${item.images[0]?.image}`}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h3 className="text-sm font-semibold">
                {item.title.slice(0, 15)}
              </h3>
              <p className="text-xs text-gray-500">
                {item.description.slice(0, 10)}...
              </p>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-green-600">{item.price} So'm</span>
                <span className="text-gray-500">{item.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
