import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FaArrowLeft,
  FaCommentAlt,
  FaEdit, FaHeart,
  FaMapMarkerAlt,
  FaRegHeart,
  FaSignInAlt, FaTrash,
  FaUser
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// API hooks
import { useCreateChatRoomMutation } from "@store/slices/chatSlice";
import {
  useCreateCommentMutation,
  useGetCommentsQuery,
} from "@store/slices/commentApiSlice";
import {
  useGetFavoriteItemsQuery,
  useGetSingleServiceQuery,
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "@store/slices/serviceApiSlice";
import { useDeleteUserServiceMutation } from "@store/slices/users";

// Components
import CommentsMain from "@services/Comments/CommentsMain";
import MyServiceEdit from "@services/ServiceEdit";

// Types and constants
import { ServiceRes } from "@services/MainProfile";
import { BASE_URL } from "@store/constants";
import { RootState } from "@store/index";
import { Category, Comment, Service, SingleService } from "@store/type";

// Custom hooks
const useAuth = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  return {
    userInfo,
    token: userInfo?.token,
    isLoggedIn: !!userInfo,
    userId: userInfo?.user_info?.id
  };
};

const useServiceData = (id: string | undefined, token: string | undefined, isLoggedIn: boolean) => {
  const serviceQuery = useGetSingleServiceQuery(id);
  const favoriteQuery = useGetFavoriteItemsQuery(
    { token },
    { skip: !isLoggedIn || !token }
  );

const serviceId = (serviceQuery.data as any)?.service?.id;

  const commentsQuery = useGetCommentsQuery(
    { serviceId, token },
    { skip: !isLoggedIn || !serviceId || !token }
  );

  return {
    service: serviceQuery.data as SingleService | null,
    isServiceLoading: serviceQuery.isLoading,
    serviceError: serviceQuery.error,
    refetchService: serviceQuery.refetch,
    favoriteItems: favoriteQuery.data as ServiceRes,
    refetchFavorites: favoriteQuery.refetch,
    comments: (commentsQuery.data as Comment[]) || [],
    refetchComments: commentsQuery.refetch,
  };
};


const getCategoryName = (category: Category, language: string): string => {
  const langKey = `name_${language}` as keyof Category;
  const value = category[langKey];
  return (value?.toString() || category.name_en || "");
};

const isServiceLiked = (favoriteItems: ServiceRes | undefined, serviceId: number): boolean => {
  return favoriteItems?.liked_services?.some((item: Service) => item.id === serviceId) || false;
};

// Components
const LoadingSpinner = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <div className="animate-spin inline-block w-8 h-8 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent rounded-full mb-2"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 rounded-xl text-red-700 text-center my-8 mx-4 shadow-sm">
    <div className="font-semibold text-lg">{message}</div>
  </div>
);

const ImageGallery = ({
  images,
  serviceName,
  selectedImage,
  onImageSelect
}: {
  images: Array<{ image: string }>;
  serviceName: string;
  selectedImage: string;
  onImageSelect: (image: string) => void;
}) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    {/* Main image with enhanced styling */}
    <div className="mb-6 overflow-hidden rounded-xl h-80 bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
      <img
        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
        src={selectedImage}
        alt={serviceName}
      />
    </div>

    {/* Thumbnail gallery */}
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300">
      {images.map((image, index) => (
        <div
          key={index}
          className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <img
            src={`${BASE_URL}${image.image}`}
            alt={`${serviceName} ${index + 1}`}
            onClick={() => onImageSelect(`${BASE_URL}${image.image}`)}
            className={`h-full w-full object-cover cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${
              selectedImage === `${BASE_URL}${image.image}`
                ? "border-blue-500 shadow-lg"
                : "border-transparent hover:border-gray-300"
            }`}
          />
        </div>
      ))}
    </div>
  </div>
);

const ServiceOwnerCard = ({
  owner,
  location
}: {
  owner: any;
  location: any;
}) => (
  <div className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl mb-6 border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="mr-4 w-14 h-14 flex-shrink-0">
      {owner?.profile_image?.image ? (
        <div className="w-14 h-14 rounded-full overflow-hidden shadow-md border-2 border-white">
          <img
            src={`${BASE_URL}/${owner.profile_image.image}`}
            alt={owner.username}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-md">
          <FaUser className="text-gray-500" size={22} />
        </div>
      )}
    </div>
    <div>
      <p className="flex items-center text-gray-800 font-semibold text-lg">
        <FaUser className="mr-2 text-blue-500" />
        {owner?.username}
      </p>
      <p className="flex items-center text-gray-600 text-sm mt-1">
        <FaMapMarkerAlt className="mr-2 text-red-500" />
        {location?.region} - {location?.district}
      </p>
    </div>
  </div>
);

const ActionButton = ({
  onClick,
  icon: Icon,
  text,
  variant = 'primary',
  disabled = false,
  className = ""
}: {
  onClick: () => void;
  icon: any;
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
  className?: string;
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
    warning: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl flex-1 min-w-[120px] transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      <Icon size={18} />
      <span>{text}</span>
    </button>
  );
};

const CommentForm = ({
  text,
  setText,
  onSubmit,
  isLoading,
  placeholder
}: {
  text: string;
  setText: (text: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
  }) => {
  const {t} = useTranslation()
  return (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
    <form onSubmit={onSubmit}>
      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e as any);
          }
        }}
        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px] shadow-sm transition-all duration-200"
      />
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? t("posting_label") : t("post_comment_label") }
        </button>
      </div>
    </form>
  </div>
  )
}

const LoginPrompt = ({ message, loginText }: { message: string; loginText: string }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-8 rounded-xl text-center shadow-sm">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-blue-700 bg-blue-100 p-4 rounded-full shadow-md">
        <FaSignInAlt size={28} />
      </div>
      <h3 className="text-xl font-semibold text-blue-800">{message}</h3>
      <Link
        to="/login"
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <FaSignInAlt className="mr-2" />
        {loginText}
      </Link>
    </div>
  </div>
);

// Main component
const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { userInfo, token, isLoggedIn, userId } = useAuth();

  // Local state
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // API data
  const {
    service: serviceItem,
    isServiceLoading,
    serviceError,
    refetchService,
    favoriteItems,
    refetchFavorites,
    comments,
    refetchComments,
  } = useServiceData(id, token, isLoggedIn);

  // API mutations
  const [likeService] = useLikeServiceMutation();
  const [dislikeService] = useUnlikeServiceMutation();
  const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation();
  const [deleteService] = useDeleteUserServiceMutation();
  const [createChatRoom] = useCreateChatRoomMutation();

  // Memoized values
  const service = serviceItem?.service;
  const isOwner = useMemo(() => userId === service?.userName?.id, [userId, service?.userName?.id]);
  const isLiked = useMemo(() =>
    service ? isServiceLiked(favoriteItems, service.id) : false,
    [favoriteItems, service?.id]
  );

  // Effects
  useEffect(() => {
    if (service?.images?.length) {
      setSelectedImage(`${BASE_URL}${service.images[0].image}`);
    }
  }, [service?.images]);

  // Handlers
  const handleImageSelect = useCallback((imageUrl: string) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleLikeToggle = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info(t("login_required_like"), { autoClose: 2000 });
      navigate("/login");
      return;
    }

    if (!service) return;

    try {
      const mutation = isLiked ? dislikeService : likeService;
      const response = await mutation({
        serviceId: service.id,
        token: token!,
      });

      if (response.data) {
        toast.success(
          isLiked ? t("service_unliked") : t("service_liked"),
          { autoClose: 1000 }
        );
        refetchService();
        refetchComments();
        refetchFavorites();
      }
    } catch (error: unknown) {
      toast.error(t("error_occurred"), { autoClose: 2000 });
    }
  }, [isLoggedIn, service, isLiked, likeService, dislikeService, token, navigate, refetchService, refetchComments, refetchFavorites, t]);

  const handleChat = useCallback(async () => {
    if (!isLoggedIn) {
      toast.info(t("login_required_chat"), { autoClose: 2000 });
      navigate("/login");
      return;
    }

    if (!service || !userInfo) return;

    try {
      const productOwnerId = service.userName.id;
      const currentUserId = userInfo.user_info.id;

      if (currentUserId === productOwnerId) {
        toast.info(t("cannot_chat_self"));
        return;
      }

      const chatName = service.userName.username;
      const result = await createChatRoom({
        name: chatName,
        participants: [currentUserId, productOwnerId],
        token: userInfo.token,
      });

      if ("data" in result && result.data) {
        const chatId = (result.data as any).id;
        toast.success(t("chat_created"));
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      toast.error(t("chat_creation_failed"));
    }
  }, [isLoggedIn, service, userInfo, createChatRoom, navigate, t]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t("delete_confirmation_product"))) return;

    try {
      const response = await deleteService({
        serviceId: id!,
        token: token!,
      });

      if ((response as any)?.status === 204) {
        toast.success(t("product_delete_success"), { autoClose: 2000 });
        navigate("/service");
      } else {
        toast.error(t("product_delete_error"), { autoClose: 2000 });
      }
    } catch (error) {
      toast.error(t("product_delete_error"), { autoClose: 2000 });
    }
  }, [id, token, deleteService, navigate, t]);

  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.info(t("enter_comment"));
      return;
    }

    if (!service) return;

    try {
      const response = await createComment({
        text: commentText,
        serviceId: service.id,
        token: token!,
      });

      if (response.data) {
        toast.success(t("comment_created"));
        refetchComments();
        setCommentText("");
      } else {
        toast.error(t("comment_creation_error"));
      }
    } catch (error: unknown) {
      toast.error(t("error_occurred"));
    }
  }, [commentText, service, createComment, token, refetchComments, t]);

  const handleEditClose = useCallback(() => {
    refetchService();
    if (service?.images?.length) {
      setSelectedImage(`${BASE_URL}${service.images[0].image}`);
    }
    setIsEditModalOpen(false);
  }, [refetchService, service?.images]);
  if (isServiceLoading) {
    return <LoadingSpinner message={t("loading")} />;
  }

  // Error state
  if (serviceError || !serviceItem || !service) {
    return <ErrorMessage message={t("error_message")} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8 space-y-8">
      <Link
        to="/service"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium hover:bg-blue-50 px-3 py-2 rounded-lg"
      >
        <FaArrowLeft className="text-sm" />
        <span>{t("service_back")}</span>
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImageGallery
          images={service.images}
          serviceName={service.name}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
        />

        {/* Service info */}
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6 shadow-sm">
            {getCategoryName(service.category, i18n.language)}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 leading-tight">
            {service.name}
          </h1>

          <div className="mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              {service.description}
            </p>
          </div>

          <ServiceOwnerCard
            owner={service.userName}
            location={service.userName?.location}
          />

          {!isOwner && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleLikeToggle}
                  icon={isLiked ? FaHeart : FaRegHeart}
                  text={t("like_label")}
                  variant={isLiked ? "primary" : "secondary"}
                />
                <ActionButton
                  onClick={handleChat}
                  icon={FaCommentAlt}
                  text={t("chat")}
                  variant="success"
                />
              </div>
            </div>
          )}

          {isOwner && (
            <div className="flex flex-wrap gap-3">
              <ActionButton
                onClick={() => setIsEditModalOpen(true)}
                icon={FaEdit}
                text={t("edit_label")}
                variant="warning"
              />
              <ActionButton
                onClick={handleDelete}
                icon={FaTrash}
                text={t("delete_label")}
                variant="danger"
              />
            </div>
          )}

          {isEditModalOpen && (
            <MyServiceEdit
              onClose={handleEditClose}
              serviceId={service.id.toString()}
              closeModelStatus={isEditModalOpen}
            />
          )}
        </div>
      </div>

      {/* Comments section */}
      <section className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-gray-200 text-gray-800">
          {t("comments_label")} {isLoggedIn && `(${comments.length})`}
        </h2>

        {isLoggedIn ? (
          <div className="space-y-6">
            <CommentsMain comments={comments} refetch={refetchComments} />
            <CommentForm
              text={commentText}
              setText={setCommentText}
              onSubmit={handleCommentSubmit}
              isLoading={isCreatingComment}
              placeholder={t("write_comment")}
            />
          </div>
        ) : (
          <LoginPrompt
            message={t("comments_visibility_notice")}
            loginText={t("login")}
          />
        )}
      </section>
      <section className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-6 text-gray-800">{t("recommended_services")}</h3>
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-xl text-center text-gray-500 border border-gray-100">
          <div className="text-lg font-medium">{t("coming_soon")}</div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
