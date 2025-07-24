import { RootState } from "@store/index";
import {
  useGetFavoriteItemsQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "@store/slices/productsApiSlice";
import { useDeleteUserProductMutation } from "@store/slices/users";
import { Product } from "@store/type";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaEdit,
  FaPlus,
  FaRegThumbsUp,
  FaThumbsUp,
  FaTrash,
} from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdDescription } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MyProductEdit from "@products/ProductEdit";
import { ServiceRes } from "@services/MainProfile";
interface SingleProductProps {
  product: Product;
  refresh: () => void;
}

const MyProduct: React.FC<SingleProductProps> = ({ product, refresh }) => {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const {t} = useTranslation()

  const { data: favorite_items, refetch: reload } = useGetFavoriteItemsQuery({
    token,
  });
  const [likeProduct] = useLikeProductMutation();
  const [deleteProduct] = useDeleteUserProductMutation();
  const [dislikeProduct] = useUnlikeProductMutation();

  const liked_items: ServiceRes = favorite_items as ServiceRes;
  const isLiked = liked_items?.liked_products?.some(
    (item: Product) => item.id === product.id
  );

  const redirectHandler = (id: number) => navigate(`/product/${id}`);
  const handleNewProductRedirect = () => navigate("/new-product");

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString("en-US").replace(/,/g, ".") + " So'm";
  };

  const formattedDate = new Date(product.created_at).toLocaleDateString();

  const handleLikeProduct = async () => {
    try {
      const response = await likeProduct({ productId: product.id, token });
      if (response.data) {
        toast.success("", { autoClose: 1000 });
        reload();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleDislikeProduct = async () => {
    try {
      const response = await dislikeProduct({ productId: product.id, token });
      if (response.data) {
        toast.success(t("productLikeSuccess"), { autoClose: 1000 });
        reload();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const handleEditModal = () => setIsEdit(!isEdit);
  const closeHandler = async () => {
    await reload();
    refresh();
  };

  const deleteProductHandler = async () => {
    if (window.confirm(t("delete_confirmation_product"))) {
      try {
        await deleteProduct({ productId: product.id, token });
        toast.success(t("product_delete_success"), {autoClose: 1000});
        refresh();
      } catch {
        toast.error("Error occurred while deleting the product");
      }
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image */}
      <div
        className="w-full h-48 bg-gray-100 cursor-pointer relative overflow-hidden"
        onClick={() => redirectHandler(product.id)}
      >
        {product?.images?.length > 0 ? (
          <img
            src={product.images[0].image}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Price */}
        <div
          className="text-xl font-bold text-blue-600 mb-2 cursor-pointer"
          onClick={() => redirectHandler(product.id)}
        >
          {formatPrice(product.price)}
        </div>

        {/* Title */}
        <div
          className="flex items-center text-gray-800 font-medium mb-2 cursor-pointer"
          onClick={() => redirectHandler(product.id)}
        >
          <MdDescription className="mr-2 text-gray-500" />
          <span className="line-clamp-2">{product.title}</span>
        </div>

        {/* Location */}
        <div
          className="flex items-center text-gray-600 text-sm mb-4 cursor-pointer"
          onClick={() => redirectHandler(product.id)}
        >
          <IoLocationOutline className="mr-2" />
          <span>
            {product.location
              ? `${product.location.region} - ${product.location.district}`
              : ""}
          </span>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-400 mt-auto mb-2">
          Posted: {formattedDate}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t pt-3">
          <div className="flex space-x-3">
            <button
              onClick={handleEditModal}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaEdit className="mr-1" />
              <span className="text-sm">Edit</span>
            </button>
            <button
              onClick={deleteProductHandler}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <FaTrash className="mr-1" />
              <span className="text-sm">Delete</span>
            </button>
          </div>

          {/* Like Button */}
          <button
            onClick={isLiked ? handleDislikeProduct : handleLikeProduct}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isLiked ? (
              <FaThumbsUp className="text-blue-600" size={18} />
            ) : (
              <FaRegThumbsUp className="text-gray-600" size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Add New Product Button (Floating) */}
      {userInfo && (
        <button
          onClick={handleNewProductRedirect}
          className="absolute bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus size={18} />
        </button>
      )}

      {/* Edit Modal */}
      {isEdit && (
        <MyProductEdit
          onClose={closeHandler}
          productId={product.id.toString()}
          closeModelStatus={isEdit}
        />
      )}
    </div>
  );
};

export default MyProduct;
