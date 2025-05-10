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
import {
  FaUser,
  FaPen,
  FaPlus,
  FaCamera,
  FaMapMarkerAlt,
  FaAngleRight,
  FaHeart,
  FaToolbox,
  FaShoppingBag,
} from "react-icons/fa";

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

  const { data: productsData, isLoading: productsLoading } =
    useGetUserProductsQuery(
      { token },
      {
        skip: !shouldFetchItems,
        // This reduces refetches when navigating back to this page
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: servicesData, isLoading: servicesLoading } =
    useGetUserServicesQuery(
      { token },
      {
        skip: !shouldFetchItems,
        refetchOnMountOrArgChange: true,
      }
    );

  const { data: likedItemsData, isLoading: likedItemsLoading } =
    useGetFavoriteItemsQuery(
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
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-600">
        {t("please_login")}
      </div>
    );

  // Optimize loading states to show partial UI when possible
  const isInitialLoading = userInfoLoading;
  if (isInitialLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  const hasError = userInfoError;
  if (hasError)
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {t("error_loading_profile")}
      </div>
    );

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

  // Prepare profile image URL
  const profileImageUrl = profileInfo.data.profile_image
    ? `${BASE_URL}${profileInfo.data.profile_image.image}`
    : "/default-profile.png";

  // Render item card
  const renderFavoriteCard = (item: any, isService = false) => {
    console.log(item);
    const imageUrl =
      item?.images && item?.images.length > 0
        ? `${BASE_URL}${item?.images[0].image}`
        : isService
        ? "/service-placeholder.png"
        : "/product-placeholder.png";

    return (
      <div
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() =>
          isService ? redirectServiceHandler(item.id) : redirectHandler(item.id)
        }
      >
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={isService ? item.name : item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-800 truncate">
            {isService ? item.name : item.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {item.description || t("no_description")}
          </p>
          {!isService && item.price && (
            <p className="text-blue-600 font-semibold mt-1">
              {item.price} {item.currency || ""}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderItemCard = (item: any, isService = false) => {
    console.log(item);
    const imageUrl =
      item?.images && item?.images.length > 0
        ? `${item?.images[0].image}`
        : isService
        ? "/service-placeholder.png"
        : "/product-placeholder.png";

    return (
      <div
        className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() =>
          isService ? redirectServiceHandler(item.id) : redirectHandler(item.id)
        }
      >
        <div className="aspect-video overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={isService ? item.name : item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <h4 className="font-medium text-gray-800 truncate">
            {isService ? item.name : item.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {item.description || t("no_description")}
          </p>
          {!isService && item.price && (
            <p className="text-blue-600 font-semibold mt-1">
              {item.price} {item.currency || ""}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Render item section
  const renderItemSection = (
    title: string,
    items: any[],
    isLoading: boolean,
    isService = false,
    seeMoreLink: string,
    addNewLink?: string
  ) => {
    const itemCount = items?.length || 0;

    return (
      <section className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            {isService ? (
              <FaToolbox className="mr-2 text-blue-500" />
            ) : (
              <FaShoppingBag className="mr-2 text-blue-500" />
            )}
            {title} ({itemCount})
          </h3>
          {addNewLink && (
            <button
              onClick={() => navigate(addNewLink)}
              className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FaPlus size={12} /> {t("add_new")}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : itemCount === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {isService ? t("service_error") : t("product_error")}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.slice(0, 3).map((item) => renderItemCard(item, isService))}
            </div>

            {itemCount > 3 && (
              <div className="text-center mt-4">
                <button
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={() => navigate(seeMoreLink)}
                >
                  {t("see_more_btn")}{" "}
                  <FaAngleRight size={14} className="ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  // Render favorite section
  const renderFavoriteSection = (
    title: string,
    items: any[],
    isLoading: boolean,
    isService = false
  ) => {
    const itemCount = items?.length || 0;

    return (
      <section className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center mb-4">
          <FaHeart className="mr-2 text-rose-500" />
          <h3 className="text-lg font-semibold">
            {title} ({itemCount})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : itemCount === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {t("no_favorites")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items
              .slice(0, 3)
              .map((item) => renderFavoriteCard(item, isService))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-16 sm:-mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {profileInfo.data.profile_image?.image ? (
                  <img
                    src={profileImageUrl}
                    alt={profileInfo.data.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <FaUser size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex-grow mt-4 sm:mt-0 sm:ml-4 sm:pb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {profileInfo.data.username}
              </h1>
              {profileInfo.data.location?.district && (
                <p className="text-gray-600 flex items-center mt-1">
                  <FaMapMarkerAlt className="mr-1" />
                  {profileInfo.data.location.district},{" "}
                  {profileInfo.data.location.region}
                </p>
              )}
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-auto sm:pb-2">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaPen size={14} /> {t("edit_profile_modal_title")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Products Section */}
        {renderItemSection(
          t("my_products_title"),
          products?.results || [],
          productsLoading,
          false,
          "/my-products",
          "/new-product"
        )}

        {/* Services Section */}
        {renderItemSection(
          t("my_services_title"),
          services?.results || [],
          servicesLoading,
          true,
          "/my-services",
          "/new-service"
        )}

        {/* Favorites Sections */}
        {renderFavoriteSection(
          t("favorite_products_title"),
          likedItems?.liked_products || [],
          likedItemsLoading,
          false
        )}

        {renderFavoriteSection(
          t("favorite_services_title"),
          likedItems?.liked_services || [],
          likedItemsLoading,
          true
        )}
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <Modal onClose={handleClose} isOpen={modalOpen}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-center">
              {t("edit_profile_modal_title")}
            </h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={profileImageUrl}
                          alt="Existing profile"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <label
                      htmlFor="file-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-md"
                    >
                      <FaCamera size={14} />
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) =>
                        setNewImage(e.target.files ? e.target.files[0] : null)
                      }
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-semibold mb-2"
                  htmlFor="username"
                >
                  {t("username_label")}
                </label>
                <input
                  id="username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  {t("location_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    id="region"
                    value={currentRegion}
                    onChange={handleRegionChange}
                    disabled={regionsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("select_region")}</option>
                    {regionsLoading ? (
                      <option disabled>{t("loading_regions")}</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t("select_district")}</option>
                    {districtsLoading ? (
                      <option disabled>{t("loading_districts")}</option>
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={handleClose}
                >
                  {t("cancel_btn_label")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t("save_label")}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MainProfile;
