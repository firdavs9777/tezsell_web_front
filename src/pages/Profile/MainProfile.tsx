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
import { useGetDistrictsListQuery, useGetFavoriteItemsQuery, useGetRegionsListQuery } from "../../store/slices/productsApiSlice";
import { BASE_URL } from "../../store/constants";
import {
  Product,
  ProductResponse,
  ServiceResponse,
  Service,
  UserInfo,
  RegionsList,
  DistrictsList,
} from "../../store/type";
import "./MainProfile.css";
import { FaUserCircle } from "react-icons/fa";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";

export interface ServiceRes {
  liked_services: Service[];
  liked_products: Product[];
}

const MainProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const navigate = useNavigate();

  // API queries
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useGetUserProductsQuery({ token });
  
  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useGetUserServicesQuery({ token });
  
  const {
    data: likedItemsData,
    isLoading: likedItemsLoading,
    error: likedItemsError,
    refetch: refetchLikedItems,
  } = useGetFavoriteItemsQuery({ token });
  
  const {
    data: loggedUserInfo,
    isLoading: userInfoLoading,
    error: userInfoError,
    refetch: refetchUserInfo,
  } = useGetLoggedinUserInfoQuery({ token });

  const {
    data: regions,
    isLoading: regionsLoading,
  } = useGetRegionsListQuery({});
 
  const [currentRegion, setCurrentRegion] = useState('');
  
  const {
    data: districts,
    isLoading: districtsLoading,
  } = useGetDistrictsListQuery(currentRegion);

  // State
  const [currentDistrict, setCurrentDistrict] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");

  // API mutations
  const [updateProfile] = useUpdateLoggedUserInfoMutation();
  
  // Type assertions
  const products = productsData as ProductResponse;
  const services = servicesData as ServiceResponse;
  const likedItems = likedItemsData as ServiceRes;
  const profileInfo = loggedUserInfo as UserInfo;
  const regionsList = regions as RegionsList;
  const districtsList = districts as DistrictsList;

  // Data fetching
  useEffect(() => {
    if (token) {
      refetchProducts();
      refetchServices();
      refetchLikedItems();
      refetchUserInfo();
    }
  }, [token, refetchProducts, refetchServices, refetchLikedItems, refetchUserInfo]);

  // Initialize form values when profile data is loaded
  useEffect(() => {
    if (profileInfo?.data) {
      setCurrentRegion(profileInfo.data.location.region);
      setCurrentDistrict(profileInfo.data.location.district);
      setNewUsername(profileInfo.data.username || "");
    }
  }, [profileInfo]);

  // Handle image preview
  useEffect(() => {
    if (newImage) {
      const objectUrl = URL.createObjectURL(newImage);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
    }
  }, [newImage]);

  // Loading and error handling
  if (!token) return <div className="auth-message">Please log in to view your profile</div>;
  
  const isLoading = productsLoading || servicesLoading || likedItemsLoading || userInfoLoading || regionsLoading || districtsLoading;
  if (isLoading) return <div className="loading">Loading...</div>;
  
  const hasError = productsError || servicesError || likedItemsError || userInfoError;
  if (hasError) return <div className="error-message">Error loading profile data</div>;

  // Modal handlers
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setImagePreview(null);
    setNewImage(null);
    setNewUsername(profileInfo?.data.username);
    setCurrentRegion(profileInfo?.data.location.region);
    setCurrentDistrict(profileInfo?.data.location.district);

  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    
    if (newUsername) {
      formData.append("username", newUsername);
  
    }
   const matchedDistrict =  districtsList.districts.find(d => d.district === currentDistrict);
    if (matchedDistrict) {
    const locationId = matchedDistrict.id; // Get the id of the matched district
    console.log("Location ID:", locationId);
    formData.append("location_id", locationId.toString());
}  
    if (newImage) {
      formData.append("profile_image", newImage);
    }

    
    try {
      const response = await updateProfile({
        userData: formData,
        token,
      }).unwrap();
      
      if (response) {
        toast.success("Profile successfully updated", { autoClose: 3000 });
        refetchUserInfo();
        handleClose();
      } else {
        toast.error("Failed to update profile", { autoClose: 3000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while updating profile", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred", {
          autoClose: 3000,
        });
      }
    }
  };

  // Render helpers
  const renderItemList = (items: any[], nameKey: string, limit = 3) => {
    if (!items || !items.length) return <p>No items available</p>;
    
    return (
      <>
        <ul className="item-list">
          {items.slice(0, limit).map((item, index) => (
            <li key={item.id || index}>{item[nameKey]}</li>
          ))}
        </ul>
        {items.length > limit && (
          <button className="see-more-btn" onClick={() => navigate("/my-products")}>
            See More
          </button>
        )}
      </>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Page</h1>
      </div>

      <div className="profile-content">
        <div className="profile-top">
          <div className="profile-overview">
            {profileInfo.data.profile_image?.image ? (
              <img
                src={`${BASE_URL}${profileInfo.data.profile_image.image}`}
                alt="User profile"
                className="profile-image"
              />
            ) : (
              <FaUserCircle className="profile-icon" />
            )}
            <p className="profile-username">{profileInfo.data.username}</p>
          </div>
          <button className="edit-btn" onClick={handleOpenModal}>
            Edit Profile
          </button>
        </div>

        <Modal onClose={handleClose} isOpen={modalOpen}>
          <div className="edit-profile-form">
            <h2>Edit Profile</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Current Location</label>
                <div className="location-selects">
                  <select 
                    id="region"
                    value={currentRegion}
                    onChange={(e) => setCurrentRegion(e.target.value)}
                  >
                    {regionsList?.regions?.map((region, index) => (
                      <option key={index} value={region.region}>
                        {region.region}
                      </option>
                    ))}
                  </select>
                  <select 
                    id="district"
                    value={currentDistrict}
                    onChange={(e) => setCurrentDistrict(e.target.value)}
                  >
                    {districtsList?.districts?.map((district, index) => (
                      <option key={index} value={district.district}>
                         {district.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile-image">Profile Image</label>
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
              </div>

              <div className="form-actions">
                <button type="submit" className="upload-btn">
                  Update
                </button>
                <button type="button" className="close-btn" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <section className="my-products">
          <h3>My Products ({products?.results?.length || 0})</h3>
          {renderItemList(products?.results || [], 'title')}
          <button className="add-btn" onClick={() => navigate("/new-product")}>
            Add New Product
          </button>
        </section>

        <section className="my-services">
          <h3>My Services ({services?.results?.length || 0})</h3>
          {renderItemList(services?.results || [], 'name')}
          <button className="add-btn" onClick={() => navigate("/new-service")}>
            Add New Service
          </button>
        </section>

        <section className="recent-activity">
          <h3>Favorite Products ({likedItems?.liked_products?.length || 0})</h3>
          {renderItemList(likedItems?.liked_products || [], 'title')}
        </section>

        <section className="recent-activity">
          <h3>Favorite Services ({likedItems?.liked_services?.length || 0})</h3>
          {renderItemList(likedItems?.liked_services || [], 'name')}
        </section>
      </div>
    </div>
  );
};

export default MainProfile;