import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserProductsQuery,
  useGetUserServicesQuery,
  useUpdateLoggedUserInfoMutation,
} from "../../store/slices/users";
import {
  useGetDistrictsListQuery,
  useGetFavoriteItemsQuery,
  useGetRegionsListQuery,
} from "../../store/slices/productsApiSlice";
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

import { setCredentials } from "../../store/slices/authSlice";
import Button from "../../components/Button";
import Card from "../../components/Card";

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
  const [currentDistrict, setCurrentDistrict] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");

  const { t, i18n } = useTranslation();
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
  }, [
    token,
    refetchProducts,
    refetchServices,
    refetchLikedItems,
    refetchUserInfo,
  ]);

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
    const matchedDistrict = districtsList.districts.find(d => d.district === currentDistrict);
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
        toast.success(t("profile_update_success_message"), { autoClose: 3000 });
        refetchUserInfo();
        handleClose();
      } else {
        toast.error(t("profile_update_fail_message"), { autoClose: 3000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while updating profile", {
          autoClose: 3000,
        });
      } else {
        toast.error(t("error_message"), {
          autoClose: 3000,
        });
      }
    }
  };
  const redirectHandler = (id: number) => {
    navigate(`/product/${id}`);
  };
  const redirectServiceHandler = (id: number) => {
    navigate(`/service/${id}`);
  }

  // Render helpers
  const renderItemList = (items: any[], nameKey: string, limit = 3) => {
    if (!items || !items.length) return <p>No items available</p>;

    return (
      <>
        <ul className="item-list">
          {items.slice(0, limit).map((item, index) => (
            item.comments ? (
                      <li key={item.id || index} onClick={() => redirectServiceHandler(item.id)}>
                {item[nameKey]}
              </li>
              
            ) : (
              <li key={item.id || index} onClick={() => redirectHandler(item.id)}>
                {item[nameKey]}
              </li>
            )
          ))}
        </ul>

        {items.length > limit && (
          <Button
            onClick={() => navigate("/my-products")}
            label={t("see_more_btn")}
            variant="see-more"
          />
        )}
      </>
    );
  };
  const renderServiceList = (items: any[], nameKey: string, limit = 3) => {
    if (!items || !items.length) return <p>No items available</p>;

    return (
      <>
        <ul className="item-list">
          {items.slice(0, limit).map((item, index) => (
            <li
              key={item.id || index}
              onClick={() => redirectServiceHandler(item.id)}
            >
              {item[nameKey]}
            </li>
          ))}
        </ul>
        {items.length > limit && (
          <Button
            onClick={() => navigate("/my-services")}
            label={t("see_more_btn")}
            variant="see-more"
          />
        )}
      </>
    );
  };

  return (
    <Card>
   
      <div className="profile-header">
        <h1>{t('profile_page_title')}</h1>
      </div>

      <div className="profile-content">
        <div className="profile-top">
          <div className="profile-overview">
            {profileInfo.data.profile_image?.image ? (
              <img
                src={`${BASE_URL}${profileInfo.data?.profile_image.image}`}
                alt="User profile"
                className="profile-image"
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
            <p className="profile-username">{profileInfo.data.username}</p>
          </div>
          <Button
            variant="edit"
            onClick={handleOpenModal}
            label={t("edit_profile_modal_title")}
          />
        </div>

        <Modal onClose={handleClose} isOpen={modalOpen}>
          <div className="edit-profile-form">
            <h2> {t("edit_profile_modal_title")}</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="username">{t("username_label")}</label>
                <input
                  id="username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">{t("location_label")}</label>
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
                <label htmlFor="profile-image">
                  {" "}
                  {t("profile_image_label")}
                </label>
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
                    {t("choose_file_label")}
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
                  {t('upload_btn_label')}
                </button>
                <button type="button" className="close-btn" onClick={handleClose}>
                  {t('cancel_btn_label')}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <section className="my-products">
          <h3> {t('my_products_title')} ({products?.results?.length || 0})</h3>
          {renderItemList(products?.results || [], 'title')}
          <Button label={t("add_new_product_btn")} onClick={() => navigate("/new-product")} variant="add"/>
            
        </section>

        <section className="my-services">
          <h3>{t('my_services_title')} ({services?.results?.length || 0})</h3>
          {renderServiceList(services?.results || [], 'name')}
 
                    <Button label={t('add_new_service_btn')} onClick={() => navigate("/new-service")} variant="add"/>
        </section>

        <section className="recent-activity">
          <h3>
            {t("favorite_products_title")} (
            {likedItems?.liked_products?.length || 0})
          </h3>
          {renderItemList(likedItems?.liked_products || [], "title")}
        </section>

        <section className="recent-activity">
          <h3>
            {t("favorite_services_title")} (
            {likedItems?.liked_services?.length || 0})
          </h3>
          {renderItemList(likedItems?.liked_services || [], "name")}
        </section>
      </div>
  
      </Card>
  );
};

export default MainProfile;
