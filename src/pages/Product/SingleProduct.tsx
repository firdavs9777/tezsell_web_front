import React, { useEffect, useState } from "react";
import { Product } from "@store/type";
import { BASE_URL } from "@store/constants";
import "./SingleProduct.css";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";

import { IoLocationOutline } from "react-icons/io5";
import { MdDescription } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useGetFavoriteItemsQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} from "@store/slices/productsApiSlice";
import { ServiceRes } from "../Profile/MainProfile";
import { toast } from "react-toastify";

interface SingleProductProps {
  product: Product;
}

const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const navigate = useNavigate();

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
  const [likeProduct, { isLoading: create_loading_like }] =
    useLikeProductMutation();
  const [dislikeProduct, { isLoading: create_loading_unlike }] =
    useUnlikeProductMutation();

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const redirectHandler = (id: number) => {
    navigate(`/product/${id}`);
  };

  // const handleNewProductRedirect = () => {
  //   navigate("/new-product");
  // };

  const formatPrice = (price: string) => {
    const priceNumber = parseFloat(price);
    return priceNumber.toLocaleString("en-US").replace(/,/g, ".") + "";
  };

  const formattedDate = new Date(product.created_at).toLocaleDateString();

  useEffect(() => {
    if (product && product.likeCount !== undefined) {
      setLikeCount(product.likeCount);
    }

    // Check if this product is liked by the user
    if (liked_items && liked_items.liked_products) {
      const isProductLiked = liked_items.liked_products.some(
        (item: Product) => item.id === product.id
      );
      setIsLiked(isProductLiked);
    }
  }, [product, liked_items]);

  const handleLikeProduct = async () => {
    if (!userInfo || !token) {
      toast.error("You must be logged in to like products", {
        autoClose: 2000,
      });
      return;
    }

    try {
      // Optimistic update
      setLikeCount((prevCount) => prevCount + 1);
      setIsLiked(true);

      const response = await likeProduct({
        productId: product.id,
        token: token,
      });

      if (response.data) {
        toast.success("Product liked successfully", { autoClose: 1000 });
        // If server returns a different count, sync with it
        if (response.data !== undefined) {
          const liked_product = response.data as Product;
          setLikeCount(liked_product.likeCount);
        }
        reload();
      }
    } catch (error: unknown) {
      // Revert optimistic update on error
      setLikeCount((prevCount) => prevCount - 1);
      setIsLiked(false);

      if (error instanceof Error) {
        toast.error(error.message || "Error while liking product", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred while liking the product", {
          autoClose: 3000,
        });
      }
    }
  };

  const handleDislikeProduct = async () => {
    if (!userInfo || !token) {
      toast.error("You must be logged in to unlike products", {
        autoClose: 2000,
      });
      return;
    }

    try {
      setIsLiked(false);

      const response = await dislikeProduct({
        productId: product.id,
        token: token,
      });

      if (response.data) {
        toast.success("Product disliked successfully", { autoClose: 1000 });
        // If server returns a different count, sync with it
        const liked_product = response.data as Product;
        if (response.data !== undefined) {
          setLikeCount(liked_product.likeCount);
        }
        reload();
      }
    } catch (error: unknown) {
      // Revert optimistic update on error
      setLikeCount((prevCount) => prevCount + 1);
      setIsLiked(true);

      if (error instanceof Error) {
        toast.error(error.message || "Error while disliking product", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred while disliking the product", {
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="product-card">
      <div
        className="image-container"
        onClick={() => redirectHandler(product.id)}
      >
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
      <div className="product-details">
        <h2
          className="product-price"
          onClick={() => redirectHandler(product.id)}
        >
          {formatPrice(product.price)} So'm
        </h2>
        <p
          className="product-title flex flex-row m-2"
          onClick={() => redirectHandler(product.id)}
        >
          <MdDescription size={24} />
          {product.title}
        </p>

        <p
          className="product-location flex flex-row m-2"
          onClick={() => redirectHandler(product.id)}
        >
          <IoLocationOutline />{" "}
          {product.location ? product.location.region + " - " : ""}
          {product.location ? product.location.district : ""}
        </p>

        <div className="like-container">
          {isLiked ? (
            <div>
              <FaThumbsUp
                size={24}
                style={{ color: "blue" }}
                onClick={handleDislikeProduct}
              />
            </div>
          ) : (
            <div>
              <FaRegThumbsUp size={24} onClick={handleLikeProduct} />
            </div>
          )}
        </div>

        <p className="product-created-at">{formattedDate}</p>
      </div>
      
    </div>
  );
};

export default SingleProduct;
