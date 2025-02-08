import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserProductsQuery,
  useGetUserServicesQuery,
  useUpdateLoggedUserInfoMutation,
} from "../../store/slices/users";
import { useGetFavoriteItemsQuery } from "../../store/slices/productsApiSlice";
import { BASE_URL } from "../../store/constants";
import {
  Product,
  ProductResponse,
  ServiceResponse,
  Service,
  UserInfo,
} from "../../store/type";
import "./MainProfile.css";
import { FaUserCircle } from "react-icons/fa";
import Modal from "../../components/Modal";
import { setCredentials } from "../../store/slices/authSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
export interface ServiceRes {
  liked_services: Service[];
  liked_products: Product[];
}

const MainProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const navigate = useNavigate();

  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetUserProductsQuery({ token });
  const {
    data: servicesData,
    isLoading: serviceLoading,
    error: serviceError,
    refetch: serviceRefetch,
  } = useGetUserServicesQuery({ token });
  const {
    data: likedItemsData,
    isLoading: favLoading,
    error: favError,
    refetch: reload,
  } = useGetFavoriteItemsQuery({ token });
  const {
    data: loggedUserInfo,
    isLoading: loggedUserLoad,
    error: loginError,
    refetch: refresh,
  } = useGetLoggedinUserInfoQuery({ token });

  const [modalOpen, setModalOpen] = useState(false);

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [updateProfile] = useUpdateLoggedUserInfoMutation(); // Assuming there's an API for updating the profile
  // const dispatch = useDispatch();
  const products: ProductResponse | undefined = productsData as ProductResponse;
  const services: ServiceResponse | undefined = servicesData as ServiceResponse;
  const likedItems: ServiceRes | undefined = likedItemsData as ServiceRes;

  const profileInfo: UserInfo | undefined = loggedUserInfo as UserInfo;
  const [newUsername, setNewUsername] = useState("");
  useEffect(() => {
    if (token) {
      refetch();
      serviceRefetch();
      reload();
      refresh();
    }
    setNewUsername(profileInfo?.data?.username || "");
  }, [token, refetch, serviceRefetch, reload, refresh, profileInfo]);

  useEffect(() => {
    if (newImage) {
      const objectUrl = URL.createObjectURL(newImage);
      setImagePreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
    }
  }, [newImage]);

  if (!token) return <div>Please log in to view products</div>;
  if (isLoading || serviceLoading || favLoading) return <div>Loading...</div>;
  if (error || serviceError || favError) return <div>Error loading data</div>;

  if (loggedUserLoad) return <div>Loading....</div>;
  if (loginError) return <div>Error Loading...</div>;
  const handleClose = () => {
    setModalOpen(!modalOpen);
    setImagePreview(null);
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(); // ✅ Declare once
    if (newUsername) {
      formData.append("username", newUsername);
    }
    if (newImage) {
      formData.append("profile_image", newImage);
    }

    try {
      const token = userInfo?.token;
      const response: Response | any = await updateProfile({
        userData: formData,
        token,
      }).unwrap();
      if (response) {
        toast.success("Profile info updated", { autoClose: 3000 });
        refresh();
        handleClose();
      } else {
        toast.error("Profile info updated", { autoClose: 3000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while updating profile", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred while updating the profile", {
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Page</h1>
      </div>

      <div className="profile-content">
        <div className="profile-top">
          <div className="profile-overview">
            {profileInfo.data.profile_image &&
            profileInfo.data.profile_image.image ? (
              <img
                src={`${BASE_URL}${profileInfo.data.profile_image.image}`}
                alt="User profile"
                className="profile-image"
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <p className="profile-username">{profileInfo.data.username}</p>
            <br />
          </div>
          <button className="edit-btn" onClick={handleClose}>
            Edit Profile
          </button>
        </div>

        <Modal onClose={handleClose} isOpen={modalOpen}>
          <div className="edit-profile-form">
            <h1>Edit Profile</h1>
            <form onSubmit={handleProfileUpdate}>
              <label>Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />

              <label>Profile Image</label>
              <div className="image-preview">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview-img"
                  />
                ) : (
                  <img
                    src={
                      profileInfo.data.profile_image
                        ? `${BASE_URL}${profileInfo.data.profile_image.image}`
                        : "/default-profile.png"
                    }
                    alt="Existing profile"
                    className="image-preview-img"
                  />
                )}
              </div>
              <div className="upload-container">
                {/* Custom button to trigger file input */}
                <label htmlFor="file-upload" className="custom-upload-btn">
                  Choose a file
                </label>
                <input
                  type="file"
                  id="file-upload"
                  className="file-input"
                  onChange={(e) =>
                    setNewImage(e.target.files ? e.target.files[0] : null)
                  }
                  accept="image/*"
                />
              </div>
              <button type="submit" className="upload-btn">
                Update Profile
              </button>
            </form>
          </div>
        </Modal>

        <div className="my-products">
          <h3>
            My Products - Total Products ({products?.results?.length || 0})
          </h3>
          {products.results && products.results.length ? (
            <>
              <ul>
                {products.results.slice(0, 3).map((product) => (
                  <li key={product.id}>{product.title}</li>
                ))}
              </ul>

              {products.results.length > 3 && (
                <button
                  className="see-more-btn"
                  onClick={() => navigate("/my-products")}
                >
                  See More
                </button>
              )}
            </>
          ) : (
            <p>No products available</p>
          )}

          <button className="add-btn" onClick={() => navigate("/new-product")}>
            Add New Product
          </button>
        </div>

        <div className="my-services">
          <h3>
            My Services - Total Services ({services?.results?.length || 0})
          </h3>
          {services.results && services.results.length ? (
            <>
              <ul>
                {services.results.slice(0, 3).map((service) => (
                  <li key={service.id}>{service.name}</li>
                ))}
              </ul>
              {services.results.length > 3 && (
                <button
                  className="see-more-btn"
                  onClick={() => navigate("/my-products")}
                >
                  See More
                </button>
              )}
            </>
          ) : (
            <p>No services available</p>
          )}
          <button className="add-btn" onClick={() => navigate("/new-service")}>
            Add New Service
          </button>
        </div>

        <div className="recent-activity">
          <h3>Favorite Products ({likedItems?.liked_products?.length || 0})</h3>
          {likedItems?.liked_products?.length ? (
            <>
              <ul>
                {likedItems.liked_products.slice(0, 3).map((product, index) => (
                  <li key={index}>{product.title}</li>
                ))}
              </ul>
              {likedItems.liked_products.length > 3 && (
                <button
                  className="see-more-btn"
                  onClick={() => navigate("/my-products")}
                >
                  See More
                </button>
              )}
            </>
          ) : (
            <p>No favorite products</p>
          )}
        </div>

        <div className="recent-activity">
          <h3>Favorite Services ({likedItems?.liked_services?.length || 0})</h3>
          {likedItems?.liked_services?.length ? (
            <>
              <ul>
                {likedItems.liked_services.slice(0, 3).map((service, index) => (
                  <li key={index}>{service.name}</li>
                ))}
              </ul>
              {likedItems.liked_services.length > 3 && (
                <button
                  className="see-more-btn"
                  onClick={() => navigate("/my-products")}
                >
                  See More
                </button>
              )}
            </>
          ) : (
            <p>No favorite services</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
