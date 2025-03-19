import { useParams } from "react-router-dom";
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

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }
  if (fav_loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !serviceItem) {
    return <div className="error">Error Occurred...</div>;
  }
  if (fav_error || !serviceItem) {
    return <div className="error">Error Occurred...</div>;
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

  return (
    <>
      <div className="service-detail-container">
        <section className="service-detail-left">
          <div className="service-image-gallery">
            <div className="service-image-thumbnails">
              {service.images.map((image, index) => (
                <img
                  key={index}
                  src={`${BASE_URL}/services${image.image}`}
                  alt={`${service.name} ${index + 1}`}
                  onClick={() =>
                    setSelectedImage(`${BASE_URL}/services${image.image}`)
                  }
                  className={
                    selectedImage === `${BASE_URL}/services${image.image}`
                      ? "thumbnail-selected"
                      : ""
                  }
                />
              ))}
            </div>
            <img
              className="service-selected-image"
              src={selectedImage}
              alt={service.name}
            />
          </div>
        </section>

        <section className="service-detail-right">
          <p className="service-category">{service.category.name}</p>
          <h2 className="service-item-title">{service.name}</h2>
          <p className="service-item-description">{service.description}</p>

          <div className="service-detail-info">
            <div className="service-owner">
              {service.userName.profile_image != null ? (
                <img
                  src={`${BASE_URL}/${service.userName.profile_image.image}`}
                  alt={service.userName.username}
                  className="owner-profile-image"
                />
              ) : (
                <svg
                  className="comment-author-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                  fill="gray"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              )}
              <div>
                <p>
                  <FaUser /> {service.userName.username}
                </p>
                <p>
                  <FaMapMarkerAlt /> {service.userName.location.region} -{" "}
                  {service.userName.location.district}
                </p>
              </div>
            </div>
          </div>

          <div className="service-actions">
            {liked_items &&
            liked_items?.liked_services?.some(
              (item: Service) => item.id === serviceItem.service.id
            ) ? (
              <div onClick={handleDislikeService}>
                <FaThumbsUp size={24} color="blue" /> Like
              </div>
            ) : (
              <div onClick={handleLikeService}>
                <FaRegThumbsUp size={24} /> Like
              </div>
            )}
            <div>
              <FaCommentAlt size={24} /> Chat
            </div>
          </div>
        </section>
      </div>

      <section className="comments-section">
        <h2 className="comments-title">Comments</h2>
        <div className="comments-list">
          {comments.length ? (
            comments.map((comment, index) => (
              <div key={index} className="comment-card">
                <div className="comment-author-info">
                  {comment.user.profile_image != null ? (
                    <img
                      src={`${BASE_URL}/${comment.user.profile_image.image}`}
                      alt={comment.user.username}
                      className="comment-author-image"
                    />
                  ) : (
                    <svg
                      className="comment-author-icon"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="40"
                      height="40"
                      fill="gray"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                  )}

                  <div className="comment-author-details">
                    <p className="comment-author">{comment.user.username}</p>
                    <p className="comment-location">
                      {comment.user.location
                        ? `${comment.user.location.region}, ${comment.user.location.district}`
                        : ""}
                    </p>
                  </div>
                </div>
                <p className="comment-text">{comment.text}</p>
                <p className="comment-time">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="no-comments">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        {userInfo ? (
          <div className="comment-input">
            <form onSubmit={submitFormHandler}>
              <textarea
                placeholder="Write a comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="comment-textarea"
              />
              <button type="submit" className="comment-submit-btn">
                Post Comment
              </button>
            </form>
          </div>
        ) : (
          <p>Please login first</p>
        )}
      </section>

      <section className="recommended-services-container">
        <h3>Recommended Services</h3>
      </section>
    </>
  );
};

export default ServiceDetail;
