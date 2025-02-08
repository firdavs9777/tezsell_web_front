import React, { useState } from "react";
import { Service } from "../../store/type";
import { BASE_URL } from "../../store/constants";
import "./SingleService.css";
import {
  FaComment,
  FaHeart,
  FaMapMarkerAlt,
  FaPlus,
  FaRegComment,
  FaRegHeart,

  // FaComment,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useGetFavoriteItemsQuery } from "../../store/slices/productsApiSlice";
import { ServiceRes } from "../Profile/MainProfile";
import {
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "../../store/slices/serviceApiSlice";
import { toast } from "react-toastify";

interface SingleServiceProps {
  service: Service;
}

const SingleService: React.FC<SingleServiceProps> = ({ service }) => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const {
    data: favorite_items,
    isLoading: fav_loading,
    error: fav_error,
    refetch: reload_item,
  } = useGetFavoriteItemsQuery({
    token: token,
  });
  const [likeService, { isLoading: create_loading_like }] =
    useLikeServiceMutation();
  const [dislikeService, { isLoading: create_loading_unlike }] =
    useUnlikeServiceMutation();

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const redirectHandler = (id: number) => {
    navigate(`/service/${id}`);
  };
  const handleNewServiceRedirect = () => {
    navigate("/new-service");
  };

  const [likeCount, setLikeCount] = useState(service.likeCount);
  const handleLikeService = async () => {
    try {
      const token = userInfo?.token;
      const response = await likeService({
        serviceId: service.id,
        token: token,
      });

      if (response.data) {
        setLikeCount((prev) => prev + 1);
        toast.success("Service liked successfully", { autoClose: 1000 });
        reload_item();
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

  const handleDislikeService = async () => {
    try {
      const token = userInfo?.token;
      const response = await dislikeService({
        serviceId: service.id,
        token: token,
      });

      if (response.data) {
        setLikeCount((prev) => prev - 1);
        toast.success("Service disliked successfully", { autoClose: 1000 });
        reload_item();
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
    <section className="service-card">
      <div
        className="image-container"
        onClick={() => redirectHandler(service.id)}
      >
        {service.images.length > 0 ? (
          <img
            src={`${BASE_URL}${service.images[0].image}`}
            alt={service.name}
            className="service-image"
          />
        ) : (
          <div className="no-image-placeholder">No Image</div>
        )}
      </div>
      <div className="service-details">
        <p
          className="service-category"
          onClick={() => redirectHandler(service.id)}
        >
          {service.category.name}
        </p>
        <h2
          className="service-title"
          onClick={() => redirectHandler(service.id)}
        >
          {service.name.length > 20
            ? `${service.name.substring(0, 26)}`
            : service.name}
        </h2>
        <p
          className="service-description"
          onClick={() => redirectHandler(service.id)}
        >
          <strong>
            {service.description.length > 34
              ? `${service.description.substring(0, 34)}...`
              : service.description}
          </strong>
        </p>

        <div className="service-meta">
          <span
            className="service-likes"
            onClick={() => redirectHandler(service.id)}
          >
            <FaMapMarkerAlt size={18} className="service-map-icon" />
            {service.location ? service.location.region : ""} -{" "}
            {service.location ? service.location.district : ""}
          </span>
          <br />
        </div>
        {liked_items &&
        liked_items.liked_services &&
        liked_items.liked_services.some(
          (item: Service) => item.id === service.id
        ) ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaHeart style={{ color: "red" }} onClick={handleDislikeService} />{" "}
            {service.likeCount}
            <FaComment /> {service.comments.length}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaRegHeart onClick={handleLikeService} /> {likeCount}
            <FaComment /> {service.comments.length}
          </div>
        )}
      </div>
      {userInfo ? (
        <div className="add-new-service" onClick={handleNewServiceRedirect}>
          <FaPlus style={{ fontSize: "30px", color: "#333" }} />
        </div>
      ) : (
        <p></p>
      )}
    </section>
  );
};

export default SingleService;
