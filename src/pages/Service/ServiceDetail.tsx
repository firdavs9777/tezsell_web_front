import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useGetFavoriteItemsQuery,
  useGetSingleServiceQuery,
  useLikeServiceMutation,
  useUnlikeServiceMutation,
} from "../../store/slices/serviceApiSlice";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../store/constants";
import { Comment, Service, SingleService } from "../../store/type";
import {
  FaCommentAlt,
  FaMapMarkerAlt,
  FaUser,
  FaThumbsUp,
  FaRegThumbsUp,
  FaArrowLeft,
} from "react-icons/fa";
import "./ServiceDetail.css";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import {
  useCreateCommentMutation,
  useGetCommentsQuery,
} from "../../store/slices/commentApiSlice";
import { toast } from "react-toastify";
import { ServiceRes } from "../Profile/MainProfile";
import { Chat, useCreateChatRoomMutation } from "../../store/slices/chatSlice";


const ServiceDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetSingleServiceQuery(id);
  const [createComment, { isLoading: create_loading }] =
    useCreateCommentMutation();

  const [likeService, { isLoading: create_loading_like }] =
    useLikeServiceMutation();
  const [dislikeService, { isLoading: create_loading_unlike }] =
    useUnlikeServiceMutation();

  const [text, setText] = useState<string>("");
   const navigate = useNavigate();
  const [createChatRoom, { isLoading: chatLoading }] =
    useCreateChatRoomMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const {
    data: favorite_items,
    isLoading: favorite_loading,
    error: favorite_error,
    refetch: reload_fav,
  } = useGetFavoriteItemsQuery({
    token: token,
  });
  // Ensure serviceItem is available and defined
  const serviceItem: SingleService | null = data as SingleService;
  const serviceId = serviceItem?.service.id;
  const {
    data: comments_data,
    isLoading: fav_loading,
    error: fav_error,
    refetch: reload,
  } = useGetCommentsQuery({
    serviceId: serviceId || "", // Ensure serviceId is not undefined
    token: token,
  });

  const liked_items: ServiceRes = favorite_items as ServiceRes;

  // Make sure comments data is in the correct format
  const comments: Comment[] = (comments_data as Comment[]) || [];

  const [selectedImage, setSelectedImage] = useState<string>("");

  // Update selectedImage when serviceItem or serviceItem images are available
  useEffect(() => {
    if (serviceItem?.service.images?.length) {
      setSelectedImage(
        `${BASE_URL}/services${serviceItem.service.images[0].image}`
      );
    }
  }, [serviceItem]);

  if (isLoading || fav_loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || fav_error || !serviceItem) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center my-8 mx-4">
        Error Occurred. Please try again later.
      </div>
    );
  }

  const handleLikeService = async () => {
    try {
      const token = userInfo?.token;
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
        serviceId: serviceItem.service.id,
        token: token,
      });

      if (response.data) {
        toast.success("Service disliked successfully", { autoClose: 1000 });
        refetch();
        reload();
        reload_fav();
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
  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", text);
    try {
      const token = userInfo?.token;
      const response = await createComment({
        text: text,
        serviceId: service.id,
        token,
      });

      if (response.data) {
        toast.success("Comment created successfully");
        reload();
        setText("");
      } else {
        toast.error("Error occured during the creation");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating service");
      } else {
        toast.error("An unknown error occurred while creating the service");
      }
    }
  };

  const { service } = serviceItem;
  const handleChat = async () => {
    if (!userInfo?.token || !userInfo?.user_info?.id) {
      toast.error("You must be logged in to start a chat");
      return;
    }

    try {
      const productOwnerId =  service.userName.id;
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
      {/* Return to services button */}
      <div className="mb-4">
        <Link
          to="/service"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <FaArrowLeft className="text-sm" />
          <span>Back to Services</span>
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
                    src={`${BASE_URL}/services${image.image}`}
                    alt={`${service.name} ${index + 1}`}
                    onClick={() =>
                      setSelectedImage(`${BASE_URL}/services${image.image}`)
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
              {service.category.name}
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
                {service.userName.profile_image != null ? (
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
                  {service.userName.username}
                </p>
                <p className="flex items-center text-gray-600 text-sm mt-1">
                  <FaMapMarkerAlt className="mr-2 text-gray-500" />
                  {service.userName.location.region} -{" "}
                  {service.userName.location.district}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={
                  liked_items?.liked_services?.some(
                    (item: Service) => item.id === serviceItem.service.id
                  )
                    ? handleDislikeService
                    : handleLikeService
                }
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-md flex-1 min-w-[120px] transition-colors ${
                  liked_items?.liked_services?.some(
                    (item: Service) => item.id === serviceItem.service.id
                  )
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {liked_items?.liked_services?.some(
                  (item: Service) => item.id === serviceItem.service.id
                ) ? (
                  <FaThumbsUp size={18} />
                ) : (
                  <FaRegThumbsUp size={18} />
                )}
                <span>Like</span>
              </button>

              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-md flex-1 min-w-[120px] hover:bg-green-200 transition-colors"  onClick={handleChat}>
                <FaCommentAlt size={18} />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
          Comments ({comments.length})
        </h2>

        {/* Comments list - SCROLLABLE */}
        <div className="mb-6">
          <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {comments.length ? (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                  >
                    <div className="flex items-start mb-3">
                      <div className="mr-3 w-10 h-10 flex-shrink-0">
                        {comment.user.profile_image != null ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={`${BASE_URL}/${comment.user.profile_image.image}`}
                              alt={comment.user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <FaUser className="text-gray-500" size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {comment.user.username}
                        </p>
                        <p className="text-sm text-gray-500">
                          {comment.user.location
                            ? `${comment.user.location.region}, ${comment.user.location.district}`
                            : ""}
                        </p>
                      </div>
                      <div className="ml-auto text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>

        {/* Comment form */}
        {userInfo ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <form onSubmit={submitFormHandler}>
              <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px]"
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={create_loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {create_loading ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
            Please login to leave a comment
          </div>
        )}
      </section>

      {/* Recommended services section */}
      <section className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Recommended Services</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
          Coming soon
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
