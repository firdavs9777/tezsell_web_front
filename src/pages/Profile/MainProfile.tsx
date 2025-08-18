import { BASE_URL } from "@store/constants";
import { RootState } from "@store/index";
import {
  useGetDistrictsListQuery,
  useGetFavoriteItemsQuery,
  useGetRegionsListQuery,
} from "@store/slices/productsApiSlice";
import {
  useGetLoggedinUserInfoQuery,
  useGetUserProductsQuery,
  useGetUserServicesQuery,
  useUpdateLoggedUserInfoMutation,
} from "@store/slices/users";
import {
  DistrictsList,
  Product,
  ProductResponse,
  RegionsList,
  SavedPropertiesResponse,
  SavedProperty,
  Service,
  ServiceResponse,
  UserInfo,
} from "@store/type";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Modal from "@components/Modal";
import { useGetSavedPropertiesQuery } from "@store/slices/realEstate";
import {
  FaAngleRight,
  FaBath,
  FaBed,
  FaCamera,
  FaHeart,
  FaHome,
  FaMapMarkerAlt,
  FaPen,
  FaPlus,
  FaRulerCombined,
  FaShoppingBag,
  FaToolbox,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";

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
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'properties'>('products');

  // API queries with optimized options
  const {
    data: loggedUserInfo,
    isLoading: userInfoLoading,
    error: userInfoError,
    refetch,
  } = useGetLoggedinUserInfoQuery({ token }, { skip: !token });

  // Only fetch these once user info is available and we're not loading
  const profileInfo = loggedUserInfo as UserInfo;

  // Initialize dependent requests based on user data
  useEffect(() => {
    if (profileInfo?.data) {
      setCurrentRegion(profileInfo.data?.location?.region);
      setCurrentDistrict(profileInfo.data?.location?.district);
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

  const { data: savedPropertyData, isLoading: savedPropertiesLoading } =
    useGetSavedPropertiesQuery(
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
  const savedProperties = savedPropertyData as SavedPropertiesResponse;

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  const hasError = userInfoError;
  if (hasError)
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <div className="text-center">
          <h3 className="text-lg font-medium">{t("error_loading_profile")}</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
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
        refetch();
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

  const redirectPropertyHandler = (id: string) => {
    navigate(`/property/${id}`);
  };

  // Prepare profile image URL
  const profileImageUrl = profileInfo.data.profile_image
    ? `${BASE_URL}${profileInfo.data.profile_image.image}`
    : "/default-profile.png";

  // Render property card - NEW FUNCTION
  const renderPropertyCard = (savedProperty: SavedProperty) => {
    const property = savedProperty.property;
    const imageUrl = property.main_image
      ? `${property.main_image}`
      : "/property-placeholder.png";

    return (
      <div
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
        onClick={() => redirectPropertyHandler(property.id)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {property.is_featured && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              Featured
            </div>
          )}
          <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
            {property.listing_type_display}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <h4 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h4>
            <p className="text-gray-500 text-sm flex items-center mt-1">
              <FaMapMarkerAlt className="mr-1 text-gray-400" size={12} />
              {property.district}, {property.city}
            </p>
          </div>

          {/* Property Details */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <FaBed className="text-gray-400" size={12} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <FaBath className="text-gray-400" size={12} />
                <span>{property.bathrooms}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FaRulerCombined className="text-gray-400" size={12} />
              <span>{property.square_meters}m²</span>
            </div>
          </div>

          {/* Property Type and Price */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
              {property.property_type_display}
            </span>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {parseFloat(property.price).toLocaleString()} {property.currency}
              </p>
              {property.price_per_sqm && (
                <p className="text-xs text-gray-500">
                  {parseFloat(property.price_per_sqm).toLocaleString()}/{property.currency} per m²
                </p>
              )}
            </div>
          </div>

          {/* Saved date */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Saved {new Date(savedProperty.saved_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render item card
  const renderFavoriteCard = (item: any, isService = false) => {
    const imageUrl =
      item?.images && item?.images.length > 0
        ? `${BASE_URL}${item?.images[0].image}`
        : isService
        ? "/service-placeholder.png"
        : "/product-placeholder.png";

    return (
      <div
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
        onClick={() =>
          isService ? redirectServiceHandler(item.id) : redirectHandler(item.id)
        }
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={isService ? item.name : item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {isService ? item.name : item.title}
          </h4>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {item.description || t("no_description")}
          </p>
          {!isService && item.price && (
            <p className="text-blue-600 font-bold text-lg mt-3">
              {item.price} {item.currency || ""}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderItemCard = (item: any, isService = false) => {
    const imageUrl =
      item?.images && item?.images.length > 0
        ? `${item?.images[0].image}`
        : isService
        ? "/service-placeholder.png"
        : "/product-placeholder.png";

    return (
      <div
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
        onClick={() =>
          isService ? redirectServiceHandler(item.id) : redirectHandler(item.id)
        }
      >
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={isService ? item.name : item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
            {isService ? item.name : item.title}
          </h4>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {item.description || t("no_description")}
          </p>
          {!isService && item.price && (
            <p className="text-blue-600 font-bold text-lg mt-3">
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
      <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            {isService ? (
              <FaToolbox className="mr-3 text-blue-500" size={20} />
            ) : (
              <FaShoppingBag className="mr-3 text-blue-500" size={20} />
            )}
            {title}
            <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
              {itemCount}
            </span>
          </h3>
          {addNewLink && (
            <button
              onClick={() => navigate(addNewLink)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <FaPlus size={14} /> {t("add_new")}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : itemCount === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="mb-4">
              {isService ? (
                <FaToolbox className="mx-auto text-4xl text-gray-300" />
              ) : (
                <FaShoppingBag className="mx-auto text-4xl text-gray-300" />
              )}
            </div>
            <p className="text-lg font-medium">{isService ? t("service_error") : t("product_error")}</p>
            <p className="text-sm mt-2">Start creating to see your items here!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.slice(0, 3).map((item, index) => (
                <div key={`${isService ? 'service' : 'product'}-${index}`}>
                  {renderItemCard(item, isService)}
                </div>
              ))}
            </div>

            {itemCount > 3 && (
              <div className="text-center mt-8">
                <button
                  className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-6 py-3 rounded-lg transition-colors"
                  onClick={() => navigate(seeMoreLink)}
                >
                  {t("see_more_btn")} ({itemCount - 3} more)
                  <FaAngleRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  // Tab component
  const TabButton = ({
    id,
    label,
    icon,
    isActive,
    onClick,
    count
  }: {
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    count?: number;
  }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 min-w-fit ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products': {
        const favoriteProductsCount = likedItems?.liked_products?.length || 0;
        return (
          <div className="mt-8">
            {likedItemsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : favoriteProductsCount === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FaHeart className="mx-auto mb-6 text-5xl text-gray-300" />
                <p className="text-xl font-medium text-gray-900 mb-2">{t("no_favorites")}</p>
                <p className="text-gray-600 max-w-md mx-auto">Start exploring products to add your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedItems.liked_products.map((item, index) =>
                  <div key={`fav-product-${index}`}>
                    {renderFavoriteCard(item, false)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'services': {
        const favoriteServicesCount = likedItems?.liked_services?.length || 0;
        return (
          <div className="mt-8">
            {likedItemsLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : favoriteServicesCount === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FaHeart className="mx-auto mb-6 text-5xl text-gray-300" />
                <p className="text-xl font-medium text-gray-900 mb-2">{t("no_favorites")}</p>
                <p className="text-gray-600 max-w-md mx-auto">Start exploring services to add your favorites!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {likedItems.liked_services.map((item, index) =>
                  <div key={`fav-service-${index}`}>
                    {renderFavoriteCard(item, true)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      case 'properties': {
        const savedPropertiesCount = savedProperties?.results?.length || 0;
        return (
          <div className="mt-8">
            {savedPropertiesLoading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : savedPropertiesCount === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FaHome className="mx-auto mb-6 text-5xl text-gray-300" />
                <p className="text-xl font-medium text-gray-900 mb-2">No saved properties yet</p>
                <p className="text-gray-600 max-w-md mx-auto">Properties you save will appear here!</p>
                <button
                  onClick={() => navigate('/properties')}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Explore Properties
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.results.map((savedProperty, index) =>
                  <div key={`saved-property-${index}`}>
                    {renderPropertyCard(savedProperty)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 h-40 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="px-6 sm:px-8 pb-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 -mt-20 lg:-mt-16">
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-lg">
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

            <div className="flex-grow">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {profileInfo.data.username}
              </h1>
              {profileInfo.data.location?.district && (
                <p className="text-gray-700 flex items-center text-lg font-medium mb-4">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" size={18}/>
                  {profileInfo.data.location.district}, {profileInfo.data.location.region}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-lg"
              >
                <FaPen size={16} /> {t("edit_profile_modal_title")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* My Products and Services Sections */}
      <div className="space-y-8">
        {/* My Products Section */}
        {renderItemSection(
          t("my_products_title"),
          products?.results || [],
          productsLoading,
          false,
          "/my-products",
          "/new-product"
        )}

        {/* My Services Section */}
        {renderItemSection(
          t("my_services_title"),
          services?.results || [],
          servicesLoading,
          true,
          "/my-services",
          "/new-service"
        )}

        {/* Tabbed Favorites Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Favorites & Saved Items</h2>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3 mb-8 p-2 bg-gray-50 rounded-xl">
            <TabButton
              id="products"
              label="Favorite Products"
              icon={<FaShoppingBag size={18} />}
              isActive={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              count={likedItems?.liked_products?.length || 0}
            />
            <TabButton
              id="services"
              label="Favorite Services"
              icon={<FaToolbox size={18} />}
              isActive={activeTab === 'services'}
              onClick={() => setActiveTab('services')}
              count={likedItems?.liked_services?.length || 0}
            />
            <TabButton
              id="properties"
              label="Saved Properties"
              icon={<FaHome size={18} />}
              isActive={activeTab === 'properties'}
              onClick={() => setActiveTab('properties')}
              count={savedProperties?.results?.length || 0}
            />
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <Modal onClose={handleClose} isOpen={modalOpen}>
          <div className="p-6 sm:p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">
              {t("edit_profile_modal_title")}
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Image Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={profileImageUrl}
                        alt="Current profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <label
                    htmlFor="file-upload"
                    className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
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
                <p className="text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
              </div>

              {/* Username Field */}
              <div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              {/* Location Fields */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  {t("location_label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    id="region"
                    value={currentRegion}
                    onChange={handleRegionChange}
                    disabled={regionsLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-50"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-50"
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  onClick={handleClose}
                >
                  {t("cancel_btn_label")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
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
