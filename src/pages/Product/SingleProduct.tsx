import { ServiceRes } from "@pages/Profile/MainProfile";

import { RootState } from "@store/index";
import {
  useGetFavoriteItemsQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "@store/slices/productsApiSlice";
import { Product } from "@store/type";
import React, { useEffect, useState } from "react";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdDescription } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface SingleProductProps {
  product: Product;
}

const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data: favorite_items, refetch: reload } = useGetFavoriteItemsQuery({
    token,
  });
  const [likeProduct] = useLikeProductMutation();
  const [dislikeProduct] = useUnlikeProductMutation();
  const [isLiked, setIsLiked] = useState(false);

  // Image loading states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  useEffect(() => {
    if (liked_items?.liked_products) {
      setIsLiked(
        liked_items.liked_products.some(
          (item: Product) => item.id === product.id
        )
      );
    }
  }, [product, liked_items]);

  // Preload image when component mounts or product changes
  useEffect(() => {
    if (product?.images?.length > 0) {
      const imageUrl = product.images[0].image;
      console.log("Loading image URL:", imageUrl);

      // Reset states
      setImageLoaded(false);
      setImageError(false);

      // Preload image
      const img = new Image();
      img.onload = () => {
        console.log("Image loaded successfully:", imageUrl);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.error("Image failed to load:", imageUrl);
        setImageError(true);
      };
      img.src = imageUrl;
    }
  }, [product]);

  const redirectHandler = (id: number) => navigate(`/product/${id}`);

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString("en-US").replace(/,/g, ".") + " So'm";
  };

  const formattedDate = new Date(product.created_at).toLocaleDateString();

  const handleLikeAction = async () => {
    if (!userInfo || !token) {
      toast.error("You must be logged in to like products", {
        autoClose: 2000,
      });
      return;
    }

    try {
      const wasLiked = isLiked;
      setIsLiked(!wasLiked); // Optimistic update

      const response = wasLiked
        ? await dislikeProduct({ productId: product.id, token })
        : await likeProduct({ productId: product.id, token });

      if (response.data) {
        toast.success(
          `Product ${wasLiked ? "disliked" : "liked"} successfully`,
          {
            autoClose: 1000,
          }
        );
        reload();
      }
    } catch (error) {
      setIsLiked(isLiked); // Revert on error
      const errorMessage =
        error instanceof Error
          ? error.message
          : `An unknown error occurred while ${
              isLiked ? "disliking" : "liking"
            } the product`;
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => redirectHandler(product.id)}
    >
      <div className="w-full aspect-square bg-gray-100 relative overflow-hidden">
        {product?.images?.length > 0 ? (
          <>
            <img
              src={product.images[0].image}
              alt={product.title}
              className={`w-full h-full object-cover hover:scale-105 transition-all duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error(
                  "Image error on render:",
                  product.images[0].image
                );
                if (!imageError) {
                  setImageError(true);
                  // Retry once after a short delay
                  setTimeout(() => {
                    e.currentTarget.src = product.images[0].image;
                  }, 100);
                }
              }}
            />
            {/* Loading spinner */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {/* Error state */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm">Image failed to load</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No Image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        {/* Price */}
        <h2 className="text-xl font-bold text-blue-600 mb-2">
          {formatPrice(product.price)}
        </h2>
        <div className="flex items-start mb-2">
          <MdDescription
            className="mt-1 mr-2 text-gray-500 min-w-[24px]"
            size={20}
          />
          <span className="line-clamp-2 text-gray-800">{product.title}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <IoLocationOutline className="mr-2" size={16} />
          <span>
            {product.location
              ? `${product.location.region} - ${product.location.district}`
              : ""}
          </span>
        </div>

        <div className="flex justify-between items-center mt-auto pt-2 border-t">
          <span className="text-xs text-gray-400">Posted: {formattedDate}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLikeAction();
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isLiked ? "Unlike product" : "Like product"}
          >
            {isLiked ? (
              <FaThumbsUp className="text-blue-600" size={18} />
            ) : (
              <FaRegThumbsUp className="text-gray-600" size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
