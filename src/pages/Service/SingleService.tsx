import { ServiceRes } from "@pages/Profile/MainProfile";
import { BASE_URL } from "@store/constants";
import { RootState } from "@store/index";
import { useGetFavoriteItemsQuery } from "@store/slices/productsApiSlice";
import {
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "@store/slices/serviceApiSlice";
import { Category, Service } from "@store/type";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaComment,
  FaMapMarkerAlt,
  FaRegThumbsUp,
  FaThumbsUp,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
interface SingleServiceProps {
  service: Service;
}

const SingleService: React.FC<SingleServiceProps> = ({ service }) => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const { data: favorite_items, refetch: reload_item } = useGetFavoriteItemsQuery({
    token: token,
  });
  const [likeService] = useLikeServiceMutation();
  const [dislikeService] = useUnlikeServiceMutation();

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  const redirectHandler = (id: number) => {
    navigate(`/service/${id}`);
  };

  const handleLikeService = async () => {
    try {
      const response = await likeService({
        serviceId: service.id,
        token: token,
      });

      if (response.data) {
        toast.success("Service liked successfully", { autoClose: 1000 });
        reload_item();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while liking service", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred while liking the service", {
          autoClose: 3000,
        });
      }
    }
  };

  const handleDislikeService = async () => {
    try {
      const response = await dislikeService({
        serviceId: service.id,
        token: token,
      });

      if (response.data) {
        toast.success("Service disliked successfully", { autoClose: 1000 });
        reload_item();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while disliking service", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred while disliking the service", {
          autoClose: 3000,
        });
      }
    }
  };

  const isLiked = liked_items?.liked_services?.some((item) => item.id === service.id);
  const truncatedName = service.name.length > 20
    ? `${service.name.substring(0, 26)}`
    : service.name;
  const truncatedDescription = service.description.length > 34
    ? `${service.description.substring(0, 34)}...`
    : service.description;
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return categoryItem[langKey] as string
  };
  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
      <div
        className="relative cursor-pointer"
        onClick={() => redirectHandler(service.id)}
      >
        {service.images.length > 0 ? (
          <img
            src={`${BASE_URL}${service.images[0].image}`}
            alt={service.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <span
          className="text-xs font-semibold text-blue-600 uppercase tracking-wide cursor-pointer"
          onClick={() => redirectHandler(service.id)}
        >
          {getCategoryName(service.category)}
        </span>

        <h2
          className="mt-1 text-lg font-semibold text-gray-900 cursor-pointer"
          onClick={() => redirectHandler(service.id)}
        >
          {truncatedName}
        </h2>

        <p
          className="mt-2 text-sm text-gray-700 font-medium cursor-pointer"
          onClick={() => redirectHandler(service.id)}
        >
          {truncatedDescription}
        </p>

        <div className="mt-3 flex items-center text-sm text-gray-600 cursor-pointer" onClick={() => redirectHandler(service.id)}>
          <FaMapMarkerAlt className="text-gray-500 mr-1" />
          <span>
            {service.location ? service.location.region : ""}
            {service.location?.district ? ` - ${service.location.district}` : ""}
          </span>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            className="flex items-center focus:outline-none"
            onClick={isLiked ? handleDislikeService : handleLikeService}
          >
            {isLiked ? (
              <FaThumbsUp className="text-blue-600" size={20} />
            ) : (
              <FaRegThumbsUp className="text-gray-600 hover:text-blue-600" size={20} />
            )}
          </button>

          <div className="flex items-center text-gray-600">
            <FaComment
              size={20}
              className={service.comments.length === 0 ? "text-gray-400" : "text-gray-600"}
            />
            <span className="ml-1">{service.comments.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleService;
