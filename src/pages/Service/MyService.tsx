import { Category, Service } from "@store/type";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ServiceRes } from "@pages/Profile/MainProfile";
import MyServiceEdit from "@services/ServiceEdit";
import { RootState } from "@store/index";
import { useGetFavoriteItemsQuery } from "@store/slices/productsApiSlice";
import {
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "@store/slices/serviceApiSlice";
import { useDeleteUserServiceMutation } from "@store/slices/users";
import {
  FaComment,
  FaEdit,
  FaMapMarkerAlt,
  FaPlus,
  FaRegThumbsUp,
  FaThumbsUp,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";

interface SingleServiceProps {
  service: Service;
  refresh: () => void;
}

const MyService: React.FC<SingleServiceProps> = ({ service, refresh }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [isEdit, setIsEdit] = useState(false);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const [deleteService] = useDeleteUserServiceMutation();

  const { data: favorite_items, refetch: reload_item } =
    useGetFavoriteItemsQuery({
      token: token,
    });
  const [likeService] = useLikeServiceMutation();
  const [dislikeService] = useUnlikeServiceMutation();

  const redirectHandler = (id: number) => navigate(`/service/${id}`);
  const liked_items: ServiceRes = favorite_items as ServiceRes;

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
        toast.error(error.message || "Error while creating product", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred while creating the product", {
          autoClose: 1000,
        });
      }
    }
  };
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return categoryItem[langKey] || categoryItem.name_en || "";
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
  const handleServiceDelete = async () => {
    const confirmed = window.confirm(t("delete_confirmation_product"));
    if (!confirmed) return;

    try {
      const response = await deleteService({
        serviceId: service.id,
        token,
      });
      interface DeleteResponse {
        status: number;
        data?: unknown;
        error?: unknown;
      }
      if (response && (response as DeleteResponse).status === 204) {
        toast.success(t("product_delete_success"), { autoClose: 2000 });
        refresh();
      } else {
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
  const handleNewServiceRedirect = () => navigate("/new-service");
  const handleEditModal = () => setIsEdit(!isEdit);
  const closeHandler = async () => refresh();

  const isLiked = liked_items?.liked_services?.some(
    (item) => item.id === service.id
  );

  return (
    <div className="flex flex-col md:flex-row border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-6 bg-white">
      {/* Image Section */}
      <div
        className="w-full md:w-1/3 h-48 md:h-auto cursor-pointer relative"
        onClick={() => redirectHandler(service.id)}
      >
        {service.images.length > 0 ? (
          <img
            src={`${service.images[0].image}`}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="w-full md:w-2/3 p-4 flex flex-col justify-between">
        <div>
          <div
            className="cursor-pointer"
            onClick={() => redirectHandler(service.id)}
          >
            <span className="text-sm text-blue-600 font-medium">
              {getCategoryName(service.category)}
            </span>
            <h2 className="text-xl font-bold mt-1 mb-2 line-clamp-1">
              {service.name}
            </h2>
            <p className="text-gray-700 line-clamp-2 mb-3">
              {service.description}
            </p>
          </div>

          <div className="flex items-center text-gray-600 mb-4">
            <FaMapMarkerAlt className="mr-1" />
            <span className="text-sm">
              {service.location
                ? `${service.location.region} - ${service.location.district}`
                : ""}
            </span>
          </div>
        </div>

        {/* Edit/Delete Buttons */}
        <div className="flex justify-between items-center border-t pt-3">
          <div className="flex space-x-4">
            <button
              onClick={handleEditModal}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaEdit className="mr-1" />
              <span>{t("edit_label")}</span>
            </button>
            <button
              onClick={() => {
                handleServiceDelete();
              }}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <FaTrash className="mr-1" />
              <span>{t("delete_label")}</span>
            </button>
          </div>

          {/* Like/Comment Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {isLiked ? (
                <FaThumbsUp
                  className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                  onClick={handleDislikeService}
                />
              ) : (
                <FaRegThumbsUp
                  className="cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={handleLikeService}
                />
              )}
            </div>
            <div className="flex items-center space-x-1">
              <FaComment
                className={
                  service.comments.length === 0
                    ? "text-gray-400"
                    : "text-gray-700"
                }
              />
              <span>{service.comments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Service Button (only for authenticated users) */}
      {userInfo && (
        <button
          onClick={handleNewServiceRedirect}
          className="absolute bottom-4 right-4 md:relative md:bottom-auto md:right-auto md:ml-4 p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
        >
          <FaPlus className="text-blue-600" />
        </button>
      )}

      {/* Edit Modal */}
      {isEdit && (
        <MyServiceEdit
          onClose={closeHandler}
          serviceId={service.id.toString()}
          closeModelStatus={isEdit}
        />
      )}
    </div>
  );
};

export default MyService;
