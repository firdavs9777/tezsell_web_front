import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store";
import { useTranslation } from "react-i18next";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserProductsQuery,
  useGetUserServicesQuery,
  useUpdateLoggedUserInfoMutation,
} from "@store/slices/users";
import {
  useGetDistrictsListQuery,
  useGetFavoriteItemsQuery,
  useGetRegionsListQuery,
} from "@store/slices/productsApiSlice";
import { BASE_URL } from "@store/constants";
import {
  Product,
  ProductResponse,
  ServiceResponse,
  Service,
  UserInfo,
  RegionsList,
  DistrictsList,
} from "@store/type";

import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import Button from "../../components/Button";
import Card from "../../components/Card";

export interface ServiceRes {
  liked_services: Service[];
  liked_products: Product[];
  liked_comments: Comment[];
}

const MainProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [modalOpen, setModalOpen] = useState(false);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [currentRegion, setCurrentRegion] = useState("");
  const [currentDistrict, setCurrentDistrict] = useState("");

  // API queries with optimized options
  const {
    data: loggedUserInfo,
    isLoading: userInfoLoading,
    error: userInfoError,
  } = useGetLoggedinUserInfoQuery(
    { token },
    { skip: !token, refetchOnMountOrArgChange: true }
  );

  // Only fetch these once user info is available and we're not loading
  const profileInfo = loggedUserInfo as UserInfo;

  // Initialize dependent requests based on user data
  useEffect(() => {
    if (profileInfo?.data) {
      setCurrentRegion(profileInfo.data.location.region);
      setCurrentDistrict(profileInfo.data.location.district);
      setNewUsername(profileInfo.data.username || "");
    }
  }, [profileInfo]);

  // Prefetch regions immediately on page load, regardless of modal state
  const { data: regions, isLoading: regionsLoading } = useGetRegionsListQuery(
    {},
    {
      skip: !token,
      // Cache regions for 24 hours since they rarely change
      refetchOnMountOrArgChange: 86400,
    }
  );

  // Always fetch districts for the current region as soon as region is set
  // This way they're already loaded when the modal opens
  const { data: districts, isLoading: districtsLoading } =
    useGetDistrictsListQuery(currentRegion, {
      skip: !currentRegion || !token,
      // Cache districts for 24 hours since they rarely change
      refetchOnMountOrArgChange: 86400,
    });

  // Memoize the formatted data to prevent unnecessary re-renders
  const regionsList = useMemo(() => regions as RegionsList, [regions]);
  const districtsList = useMemo(() => districts as DistrictsList, [districts]);

  // Use a single dependency for products, services, and liked items
  const shouldFetchItems = !!(token && !userInfoLoading && profileInfo?.data);

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useGetUserProductsQuery(
    { token },
    {
      skip: !shouldFetchItems,
      // This reduces refetches when navigating back to this page
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: servicesData,
    isLoading: servicesLoading,
    error: servicesError,
  } = useGetUserServicesQuery(
    { token },
    {
      skip: !shouldFetchItems,
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: likedItemsData,
    isLoading: likedItemsLoading,
    error: likedItemsError,
  } = useGetFavoriteItemsQuery(
    { token },
    {
      skip: !shouldFetchItems,
      refetchOnMountOrArgChange: true,
    }
  );

  const [updateProfile] = useUpdateLoggedUserInfoMutation();

  // Type assertions
  const products = productsData as ProductResponse;
  const services = servicesData as ServiceResponse;
  const likedItems = likedItemsData as ServiceRes;

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
  if (!token)
    return (
      <div className="auth-message">Please log in to view your profile</div>
    );

  // Optimize loading states to show partial UI when possible
  const isInitialLoading = userInfoLoading;
  if (isInitialLoading) return <div className="loading">Loading...</div>;

  const hasError = userInfoError;
  if (hasError)
    return <div className="error-message">Error loading profile data</div>;

  // Modal handlers
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setImagePreview(null);
    setNewImage(null);
    // Reset form values to match profile data
    if (profileInfo?.data) {
      setNewUsername(profileInfo.data.username || "");
      setCurrentRegion(profileInfo.data.location.region || "");
      setCurrentDistrict(profileInfo.data.location.district || "");
    }
  };

  // Optimize region change to immediately reset district
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setCurrentRegion(newRegion);
    setCurrentDistrict(""); // Reset district when region changes
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    if (newUsername) {
      formData.append("username", newUsername);
    }

    const matchedDistrict = districtsList?.districts?.find(
      (d) => d.district === currentDistrict
    );
    if (matchedDistrict) {
      formData.append("location_id", matchedDistrict.id.toString());
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
  };

  // Render helpers
  const renderItemList = (items: any[], nameKey: string, limit = 3) => {
    if (!items || !items.length) return <p>No items available</p>;

    return (
      <>
        <ul className="item-list">
          {items.slice(0, limit).map((item, index) =>
            item.comments ? (
              <li
                key={item.id || `service-${index}`}
                onClick={() => redirectServiceHandler(item.id)}
              >
                {item[nameKey]}
              </li>
            ) : (
              <li
                key={item.id || `product-${index}`}
                onClick={() => redirectHandler(item.id)}
              >
                {item[nameKey]}
              </li>
            )
          )}
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
              key={item.id || `service-${index}`}
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

  // Prepare profile image URL
  const profileImageUrl = profileInfo.data.profile_image
    ? `${BASE_URL}${profileInfo.data.profile_image.image}`
    : "/default-profile.png";

  return (
    <Card>
      <div className="profile-header">
        <h1>{t("profile_page_title")}</h1>
      </div>

      <div className="profile-content">
        <div className="profile-top">
          <div className="profile-overview">
            {profileInfo.data.profile_image?.image ? (
              <img
                src={profileImageUrl}
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

        {modalOpen && (
          <Modal onClose={handleClose} isOpen={modalOpen}>
            <div className="edit-profile-form">
              <h2>{t("edit_profile_modal_title")}</h2>
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
                      onChange={handleRegionChange}
                      disabled={regionsLoading}
                    >
                      <option value="">Select Region</option>
                      {regionsLoading ? (
                        <option disabled>Loading regions...</option>
                      ) : (
                        regionsList?.regions?.map((region, index) => (
                          <option key={`region-${index}`} value={region.region}>
                            {region.region}
                          </option>
                        ))
                      )}
                    </select>

                    <select
                      id="district"
                      value={currentDistrict}
                      onChange={(e) => setCurrentDistrict(e.target.value)}
                      disabled={districtsLoading || !currentRegion}
                    >
                      <option value="">Select District</option>
                      {districtsLoading ? (
                        <option disabled>Loading districts...</option>
                      ) : (
                        districtsList?.districts?.map((district, index) => (
                          <option
                            key={`district-${index}`}
                            value={district.district}
                          >
                            {district.district}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-image">
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
                        src={profileImageUrl}
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
                    {t("upload_btn_label")}
                  </button>
                  <button
                    type="button"
                    className="close-btn"
                    onClick={handleClose}
                  >
                    {t("cancel_btn_label")}
                  </button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Products section with loading indicator */}
        <section className="my-products">
          <h3>
            {t("my_products_title")} ({products?.results?.length || 0})
          </h3>
          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <p>Error loading products</p>
          ) : (
            renderItemList(products?.results || [], "title")
          )}
          <Button
            label={t("add_new_product_btn")}
            onClick={() => navigate("/new-product")}
            variant="add"
          />
        </section>

        {/* Services section with loading indicator */}
        <section className="my-services">
          <h3>
            {t("my_services_title")} ({services?.results?.length || 0})
          </h3>
          {servicesLoading ? (
            <p>Loading services...</p>
          ) : servicesError ? (
            <p>Error loading services</p>
          ) : (
            renderServiceList(services?.results || [], "name")
          )}
          <Button
            label={t("add_new_service_btn")}
            onClick={() => navigate("/new-service")}
            variant="add"
          />
        </section>

        {/* Liked products section with loading indicator */}
        <section className="recent-activity">
          <h3>
            {t("favorite_products_title")} (
            {likedItems?.liked_products?.length || 0})
          </h3>
          {likedItemsLoading ? (
            <p>Loading favorite products...</p>
          ) : likedItemsError ? (
            <p>Error loading favorite products</p>
          ) : (
            renderItemList(likedItems?.liked_products || [], "title")
          )}
        </section>

        {/* Liked services section with loading indicator */}
        <section className="recent-activity">
          <h3>
            {t("favorite_services_title")} (
            {likedItems?.liked_services?.length || 0})
          </h3>
          {likedItemsLoading ? (
            <p>Loading favorite services...</p>
          ) : likedItemsError ? (
            <p>Error loading favorite services</p>
          ) : (
            renderItemList(likedItems?.liked_services || [], "name")
          )}
        </section>
      </div>
    </Card>
  );
};

export default MainProfile;
