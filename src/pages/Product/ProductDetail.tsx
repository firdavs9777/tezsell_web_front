import { BASE_URL } from "@store/constants";
import {
  useDeleteProductItemMutation,
  useGetFavoriteItemsQuery,
  useGetSingleProductQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "@store/slices/productsApiSlice";
import { Product, SingleProduct } from "@store/type";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCommentAlt,
  FaEdit,
  FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaStar,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../store";
import { Chat, useCreateChatRoomMutation } from "../../store/slices/chatSlice";
import { ServiceRes } from "../Service/MainProfile";
import MyProductEdit from "./ProductEdit";

const ProductDetail = () => {
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const { data, isLoading, error, refetch } = useGetSingleProductQuery(id);
  const [likeProduct] = useLikeProductMutation();
  const [dislikeProduct] = useUnlikeProductMutation();
  const [deleteProduct] = useDeleteProductItemMutation();

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const { data: favorite_items, refetch: reload } = useGetFavoriteItemsQuery({
    token: token,
  });
  const [createChatRoom] = useCreateChatRoomMutation();

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const singleProduct: SingleProduct = data as SingleProduct;
  const [selectedImage, setSelectedImage] = useState("");

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Handle back navigation
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  useEffect(() => {
    if (singleProduct?.product.images.length > 0) {
      setSelectedImage(`${BASE_URL}${singleProduct.product.images[0].image}`);
    }
  }, [singleProduct]);

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString("en-US").replace(/,/g, ".") + "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {t("verification_error")}
      </div>
    );
  }

  const handleImageClick = (image: string) => {
    setSelectedImage(`${BASE_URL}${image}`);
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
        toast.success(t("productLikeSuccess"), { autoClose: 3000 });
        reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || t("like_product_error"), {
          autoClose: 1000,
        });
      } else {
        toast.error(t("unknown_error_message"), {
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
        toast.success(t("productDislikeSuccess"), { autoClose: 1000 });

        reload();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("dislike_product_error"), {
          autoClose: 3000,
        });
      } else {
        toast.error(t("unknownError"), {
          autoClose: 3000,
        });
      }
    }
  };

  const handleEditModal = () => {
    refetch();
    setIsEdit(!isEdit);
  };

  const onCloseHandler = () => {
    refetch();
    if (singleProduct.product.images) {
      setSelectedImage(`${BASE_URL}${singleProduct.product.images[0].image}`);
    } else {
      setSelectedImage("");
    }
  };

  const handleChat = async () => {
    if (!userInfo?.token || !userInfo?.user_info?.id) {
      toast.error(t("chat_login_message"), { autoClose: 2000 });
      return;
    }
    try {
      const productOwnerId = singleProduct.product.userName.id;
      const currentUserId = userInfo.user_info.id;
      if (currentUserId === productOwnerId) {
        toast.info(t("chat_yourself_message"), { autoClose: 2000 });
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
        toast.success(t("chat_room_message"), { autoClose: 2000 });
        navigate(`/chat/${chatId}`); // Redirect to chat page
      } else {
        toast.error(t("chat_room_error"), { autoClose: 2000 });
      }
    } catch {
      toast.error(t("chat_creation_error"));
    }
  };
  const handleProductRedirect = () => navigate("/");
  // Add these types to your API slice or types file

  const handleProductDelete = async () => {
    const confirmed = window.confirm(t("delete_confirmation_product"));
    if (!confirmed) return;

    try {
      const response = await deleteProduct({
        productId: id,
        token,
      });

      // RTK Query mutation returns either:
      // { data: YourSuccessResponse } or { error: YourErrorResponse }
      if ("data" in response && response.data) {
        // Success case
        toast.success(t("product_delete_success"), { autoClose: 2000 });
        handleProductRedirect();
      } else if ("error" in response) {
        // Error case
        toast.error(t("product_delete_error"), { autoClose: 2000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("product_delete_error"), { autoClose: 2000 });
      } else {
        toast.error(t("unknown_error_message"), { autoClose: 1000 });
      }
    }
  };

  const isLiked = liked_items?.liked_products?.some(
    (item: Product) => item.id === singleProduct.product.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-gray-50">
      <button
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        onClick={handleGoBack}
      >
        <FaArrowLeft size={16} />
        <span>{t("product_back")}</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="relative bg-white rounded-xl shadow-sm overflow-hidden aspect-[4/3]">
            <img
              className="w-full h-full object-contain"
              src={selectedImage}
              alt={singleProduct.product.title}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {singleProduct.product.images.map((image, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer
                  ${
                    selectedImage === `${BASE_URL}${image.image}`
                      ? "ring-2 ring-blue-500"
                      : "ring-1 ring-gray-200"
                  }`}
                onClick={() => handleImageClick(image.image)}
              >
                <img
                  src={`${BASE_URL}${image.image}`}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800">
              {singleProduct.product.title}
            </h1>
            <button
              onClick={isLiked ? handleDislikeProduct : handleLikeProduct}
              className="text-rose-500 hover:scale-110 transition-transform"
              title={
                isLiked ? t("remove_from_favorites") : t("add_to_favorites")
              }
            >
              {isLiked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <div className="flex items-center text-amber-500">
              <FaStar />
              <span className="ml-1">{singleProduct.product.rating}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              <p>
                {singleProduct.product.condition
                  ? t(singleProduct.product.condition)
                  : ""}
              </p>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {singleProduct.product.in_stock
                ? t("product_in_stock")
                : t("product_out_stock")}
            </span>
          </div>

          <div className="text-3xl font-bold text-blue-600">
            {formatPrice(singleProduct.product.price)}{" "}
            {singleProduct.product.currency}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2">
              {t("description")}
            </h3>
            <p className="text-gray-600">{singleProduct.product.description}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            {singleProduct.product.userName?.profile_image ? (
              <img
                src={`${BASE_URL}/${singleProduct.product.userName.profile_image.image}`}
                alt="profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
                <FaUser size={20} className="text-gray-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">
                {singleProduct.product.userName.username}
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <FaMapMarkerAlt className="mr-1" size={14} />
                {singleProduct.product?.userName?.location?.district ||
                  t("no_location")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
           {userInfo?.user_info?.id && userInfo.user_info.id !== singleProduct.product.userName.id && (
  <button
    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    onClick={handleChat}
  >
    <FaCommentAlt size={16} />
    {t("message_seller")}
  </button>
)}

{userInfo?.user_info?.id && userInfo.user_info.id === singleProduct.product.userName.id && (
  <>
    <button
      onClick={handleEditModal}
      className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors font-medium"
    >
      <FaEdit size={16} /> {t("edit_label")}
    </button>
    <button
      onClick={() => {
        handleProductDelete();
      }}
      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
    >
      <FaTrash size={16} /> {t("delete_label")}
    </button>
  </>
)}
          </div>

          {isEdit && (
            <MyProductEdit
              onClose={onCloseHandler}
              productId={singleProduct.product.id.toString()}
              closeModelStatus={isEdit}
            />
          )}
        </div>
      </div>
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {t("recommended_products")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {singleProduct.recommended_products.map((item: Product) => (
            <div
              key={item.id}
              onClick={() => redirectHandler(item.id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow overflow-hidden group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={`${BASE_URL}/${item.images[0]?.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-blue-600 font-bold">
                    {formatPrice(item.price)} {item.currency}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    {item.condition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
