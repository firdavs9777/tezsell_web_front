import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useGetFavoriteItemsQuery,
  useGetSingleServiceQuery,
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "@store/slices/serviceApiSlice";
import { useEffect, useState } from "react";
import { BASE_URL } from "@store/constants";
import { Category, Comment, Service, SingleService } from "@store/type";
import {
  FaCommentAlt,
  FaMapMarkerAlt,
  FaUser,
  FaThumbsUp,
  FaRegThumbsUp,
  FaArrowLeft,
  FaSignInAlt,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useCreateCommentMutation,
  useGetCommentsQuery,
} from "@store/slices/commentApiSlice";
import { toast } from "react-toastify";
import { ServiceRes } from "./MainProfile";
import { Chat, useCreateChatRoomMutation } from "@store/slices/chatSlice";
import CommentsMain from "./Comments/CommentsMain";
import { useTranslation } from "react-i18next";
import MyServiceEdit from "./ServiceEdit";
import { useDeleteUserServiceMutation } from "@store/slices/users";

const ServiceDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetSingleServiceQuery(id);
  const [createComment, { isLoading: create_loading }] =
    useCreateCommentMutation();
  const [deleteService] = useDeleteUserServiceMutation();

  const { t, i18n } = useTranslation();
  const [likeService] = useLikeServiceMutation();
  const [dislikeService] = useUnlikeServiceMutation();
  const [isEdit, setIsEdit] = useState(false);
  const [text, setText] = useState<string>("");
  const navigate = useNavigate();
  const [createChatRoom] = useCreateChatRoomMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const isLoggedIn = !!userInfo; // Boolean check if user is logged in

  const { data: favorite_items, refetch: reload_fav } =
    useGetFavoriteItemsQuery(
      {
        token: token,
      },
      { skip: !isLoggedIn }
    ); // Skip query if user is not logged in

  // Ensure serviceItem is available and defined
  const serviceItem: SingleService | null = data as SingleService;
  console.log(data);
  const serviceId = serviceItem?.service.id;

  const {
    data: comments_data,

    refetch: reload,
  } = useGetCommentsQuery(
    {
      serviceId: serviceId, // Ensure serviceId is not undefined
      token: token,
    },
    { skip: !isLoggedIn }
  ); // Skip query if user is not logged in

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  // Make sure comments data is in the correct format
  const comments: Comment[] = (comments_data as Comment[]) || [];

  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleServiceRedirect = () => navigate("/service");

  const handleServiceDelete = async () => {
    const confirmed = window.confirm(t("delete_confirmation_product"));
    if (!confirmed) return;

    try {
      const response = await deleteService({
        serviceId: id,
        token,
      });
      interface DeleteResponse {
        status: number;
        data?: unknown;
        error?: unknown;
      }
      if (response && (response as DeleteResponse).status === 204) {
        toast.success(t("product_delete_success"), { autoClose: 2000 });
        handleServiceRedirect();
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
  // Update selectedImage when serviceItem or serviceItem images are available
  useEffect(() => {
    if (serviceItem?.service.images?.length) {
      setSelectedImage(`${BASE_URL}${serviceItem.service.images[0].image}`);
    }
  }, [serviceItem]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !serviceItem) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center my-8 mx-4">
        {t("error_message")}
      </div>
    );
  }
  const onCloseHandler = () => {
    refetch();
    if (service.images) {
      setSelectedImage(`${BASE_URL}${service.images[0].image}`);
    } else {
      setSelectedImage("");
    }
  };

  const handleLikeService = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to like this service", { autoClose: 2000 });
      navigate("/login");
      return;
    }

    try {
      const response = await likeService({
        serviceId: serviceItem.service.id,
        token: token,
      });

      if (response.data) {
        toast.success("Service liked successfully", { autoClose: 1000 });
        refetch();
        reload();
        reload_fav();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while liking service", {
          autoClose: 1000,
        });
      } else {
        toast.error("An unknown error occurred", {
          autoClose: 3000,
        });
      }
    }
  };
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return categoryItem[langKey] || categoryItem.name_en || "";
  };

  const handleDislikeService = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to interact with this service", {
        autoClose: 2000,
      });
      navigate("/login");
      return;
    }

    try {
      const response = await dislikeService({
        serviceId: serviceItem.service.id,
        token: token,
      });

      if (response.data) {
        toast.success("Service removed from likes", { autoClose: 1000 });
        refetch();
        reload();
        reload_fav();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while unliking service", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred", {
          autoClose: 3000,
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.info("Please enter a comment");
      return;
    }

    try {
      const response = await createComment({
        text: text,
        serviceId: serviceItem.service.id,
        token,
      });

      if (response.data) {
        toast.success("Comment created successfully");
        reload();
        setText("");
      } else {
        toast.error("Error occurred during the creation");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating comment");
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  const submitFormHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const { service } = serviceItem;

  const handleChat = async () => {
    if (!isLoggedIn) {
      toast.info("Please log in to start a chat", { autoClose: 2000 });
      navigate("/login");
      return;
    }

    try {
      const productOwnerId = service.userName.id;
      const currentUserId = userInfo.user_info.id;

      // Avoid chatting with yourself
      if (currentUserId === productOwnerId) {
        toast.info("You can't chat with yourself.");
        return;
      }

      const chatName = `${service.userName.username}`;

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
  const handleEditModal = () => {
    refetch();
    setIsEdit(!isEdit);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      {/* Return to services button */}
      <div className="mb-4">
        <Link
          to="/service"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <FaArrowLeft className="text-sm" />
          <span>{t("service_back")}</span>
        </Link>
      </div>

      {/* Main service detail section */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Images */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-4">
            {/* Selected main image - FIXED HEIGHT */}
            <div className="mb-4 overflow-hidden rounded-lg h-80 flex items-center justify-center bg-gray-100">
              <img
                className="w-full h-full object-contain"
                src={selectedImage}
                alt={service.name}
              />
            </div>

            {/* Thumbnails - FIXED SIZE */}
            <div className="flex overflow-x-auto gap-3 pb-2">
              {service.images.map((image, index) => (
                <div
                  key={index}
                  className="h-16 w-16 flex-shrink-0 overflow-hidden rounded"
                >
                  <img
                    src={`${BASE_URL}${image.image}`}
                    alt={`${service.name} ${index + 1}`}
                    onClick={() =>
                      setSelectedImage(`${BASE_URL}${image.image}`)
                    }
                    className={`h-full w-full object-cover cursor-pointer border-2 ${
                      selectedImage === `${BASE_URL}/services${image.image}`
                        ? "border-blue-500"
                        : "border-transparent"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Service info */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-4">
              {getCategoryName(service.category)}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {service.name}
            </h1>

            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Service owner info */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
              <div className="mr-4 w-12 h-12 flex-shrink-0">
                {service.userName?.profile_image?.image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={`${BASE_URL}/${service.userName.profile_image.image}`}
                      alt={service.userName.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUser className="text-gray-500" size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="flex items-center text-gray-800 font-medium">
                  <FaUser className="mr-2 text-gray-500" />
                  {service?.userName?.username}
                </p>
                <p className="flex items-center text-gray-600 text-sm mt-1">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  {service?.userName?.location?.region} -{" "}
                  {service?.userName?.location?.district}
                </p>
              </div>
            </div>

            {isLoggedIn && (
              <div className="flex flex-wrap gap-2 mb-2">
                {/* Like/Unlike Button */}
                <button
                  onClick={
                    isLoggedIn &&
                    liked_items?.liked_services?.some(
                      (item: Service) => item.id === serviceItem.service.id
                    )
                      ? handleDislikeService
                      : handleLikeService
                  }
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md flex-1 min-w-[120px] transition-colors ${
                    isLoggedIn &&
                    liked_items?.liked_services?.some(
                      (item: Service) => item.id === serviceItem.service.id
                    )
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {isLoggedIn &&
                  liked_items?.liked_services?.some(
                    (item: Service) => item.id === serviceItem.service.id
                  ) ? (
                    <FaThumbsUp size={18} />
                  ) : (
                    <FaRegThumbsUp size={18} />
                  )}
                  <span>{t("like_label")}</span>
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-md flex-1 min-w-[120px] hover:bg-green-200 transition-colors"
                  onClick={handleChat}
                >
                  <FaCommentAlt size={18} />
                  <span>{t("chat")}</span>
                </button>
              </div>
            )}

            {isLoggedIn && (
              <div className="flex flex-wrap gap-2">
                {/* Edit Button */}
                <button
                  onClick={handleEditModal}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  <FaEdit size={16} /> {t("edit_label")}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    handleServiceDelete();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <FaTrash size={16} /> {t("delete_label")}
                </button>
              </div>
            )}

            {isEdit && (
              <MyServiceEdit
                onClose={onCloseHandler}
                serviceId={service.id.toString()}
                closeModelStatus={isEdit}
              />
            )}
          </div>
        </div>
      </div>

      {/* Comments section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
          {t("comments_label")} {isLoggedIn && `(${comments.length})`}
        </h2>

        {isLoggedIn ? (
          <>
            {/* Comments list - Shown only to logged in users */}
            <CommentsMain comments={comments} refetch={reload} />

            {/* Comment form */}
            <div className="bg-gray-50 rounded-lg p-4">
              <form onSubmit={submitFormHandler}>
                <textarea
                  placeholder={t("write_comment")}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={create_loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {create_loading
                      ? t("posting_label")
                      : t("post_comment_label")}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-blue-700 bg-blue-100 p-3 rounded-full">
                <FaSignInAlt size={24} />
              </div>
              <h3 className="text-lg font-medium text-blue-800">
                {t("comments_visibility_notice")}
              </h3>
              <p className="text-blue-600 mb-2">{t("login_prompt")}</p>
              <Link
                to="/login"
                className="inline-flex items-center px-5 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaSignInAlt className="mr-2" />
                {t("login")}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Recommended services section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">{t("recommended_services")}</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          {t("coming_soon")}
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
