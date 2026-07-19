import Modal from "@components/Modal";
import SingleProduct from "@products/SingleProduct";
import {
  useGetAllLocationListQuery,
  useGetCategoryListQuery,
  useGetProductsQuery,
} from "@store/slices/productsApiSlice";
import {
  AllLocationList,
  Category,
  Product,
  ProductResponse,
} from "@store/type";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { RootState } from "@store/index";
import { BiCategory } from "react-icons/bi";
import { FaPlus, FaTimes } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 12;

const ProductScreen = () => {
  // States
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>("");

  // Infinite scroll states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { t, i18n } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const processedUserInfo = useSelector((state: RootState) => state.auth.processedUserInfo);
  const navigate = useNavigate();

  // Get user location for default filtering
  const userLocation = (processedUserInfo?.user as any)?.location;
  const defaultRegion = userLocation?.region || null;
  const defaultDistrict = userLocation?.district || null;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchProductQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchProductQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize location filters with user location if not set and user has location
  useEffect(() => {
    if (!selectedRegion && !selectedDistrict && defaultRegion && defaultDistrict) {
      setSelectedRegion(defaultRegion);
      setSelectedDistrict(defaultDistrict);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRegion, defaultDistrict]);

  // API Queries
  const { data: data_category, isLoading: isLoading_category } =
    useGetCategoryListQuery({});

  const { data: all_location, isLoading: isLoading_location } =
    useGetAllLocationListQuery({});

  // Use selected location or default to user location
  const regionFilter = selectedRegion || defaultRegion || "";
  const districtFilter = selectedDistrict || defaultDistrict || "";

  const { data, isLoading, error, isFetching } = useGetProductsQuery({
    currentPage,
    page_size: PAGE_SIZE,
    lang: i18n.language,
    category_name: selectedCategory,
    region_name: regionFilter,
    district_name: districtFilter,
    product_title: debouncedSearchQuery,
  });

  // Reset products when filters change
  useEffect(() => {
    setAllProducts([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [
    selectedCategory,
    selectedRegion,
    selectedDistrict,
    debouncedSearchQuery,
  ]);

  // Append new products when data changes
  useEffect(() => {
    const products = data as ProductResponse;
    if (products?.results) {
      if (currentPage === 1) {
        setAllProducts(products.results);
      } else {
        setAllProducts(prev => {
          const newIds = new Set(products.results.map(p => p.id));
          const filtered = prev.filter(p => !newIds.has(p.id));
          return [...filtered, ...products.results];
        });
      }
      // Check if there are more products to load
      const totalLoaded = currentPage * PAGE_SIZE;
      setHasMore(totalLoaded < products.count);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Type assertions
  const location_info = all_location as AllLocationList;
  const categories = data_category as Category[];

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isFetching) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMore, isFetching]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetching) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, isFetching]);

  // Modal toggles
  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleLocationModal = () => setLocationModal((prev) => !prev);

  // Loading and error states
  const isLoadingData = isLoading_location || isLoading_category;

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">{t("loading_message_product")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {t("loading_message_error")}
      </div>
    );
  }

  // Handlers
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    toggleModal();
  };

  const handleLocationSelect = (regionName: string, districtName: string) => {
    setSelectedRegion(regionName);
    setSelectedDistrict(districtName);
    toggleLocationModal();
  };

  const handleCategoryRemove = () => setSelectedCategory("");

  const handleLocationRemoveFilter = () => {
    setSelectedRegion("");
    setSelectedDistrict("");
    // Reset to user location after clearing manual selection
    if (defaultRegion && defaultDistrict) {
      setSelectedRegion(defaultRegion);
      setSelectedDistrict(defaultDistrict);
    }
  };

  const handleFilterRemove = () => {
    setSelectedCategory("");
    setSelectedRegion("");
    setSelectedDistrict("");
    setSearchProductQuery("");
    setDebouncedSearchQuery("");
  };

  const handleNewProductRedirect = () => navigate("/new-product");

  // Get proper category name based on current language
  const getCategoryName = (category: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return category[langKey] as string;
  };

  const totalCount = (data as ProductResponse)?.count || 0;
  const hasResults = allProducts.length > 0;
  // Only show as active filter if manually selected (not default user location)
  const hasActiveFilters =
    selectedCategory ||
    (selectedRegion && selectedRegion !== defaultRegion) ||
    (selectedDistrict && selectedDistrict !== defaultDistrict) ||
    debouncedSearchQuery;

  // Get current location display (selected or default)
  const currentRegion = selectedRegion || defaultRegion;
  const currentDistrict = selectedDistrict || defaultDistrict;
  const hasLocation = currentRegion && currentDistrict;

  return (
    <div className="px-4 mx-auto max-w-7xl my-4">
      {/* Current Location Display */}
      {hasLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <FaLocationDot className="text-blue-600" size={18} />
            <span className="text-blue-800 font-medium">
              {t("selected_location")} {currentRegion} - {currentDistrict}
            </span>
          </div>
        </div>
      )}

      {/* Search bar section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 order-3 md:order-1">
            <div className="relative">
              <input
                type="text"
                placeholder={t("search_product_placeholder")}
                className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 order-1 md:order-2">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={toggleLocationModal}
            >
              <FaLocationDot size={18} />
              <span className="hidden sm:inline">{t("search_location")}</span>
            </button>

            <button
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={toggleModal}
            >
              <BiCategory size={18} />
              <span className="hidden sm:inline">{t("search_category")}</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {debouncedSearchQuery && (
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span className="mr-1">{t("search")}:</span>
                <span className="font-medium">{debouncedSearchQuery}</span>
                <button
                  onClick={() => setSearchProductQuery("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {selectedCategory && (
              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <span className="mr-1">{t("category")}:</span>
                <span className="font-medium">{selectedCategory}</span>
                <button
                  onClick={handleCategoryRemove}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {selectedRegion && selectedDistrict && (
              <div className="inline-flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                <span className="mr-1">{t("location")}:</span>
                <span className="font-medium">
                  {selectedRegion} - {selectedDistrict}
                </span>
                <button
                  onClick={handleLocationRemoveFilter}
                  className="ml-2 text-pink-600 hover:text-pink-800"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={handleFilterRemove}
                className="text-sm text-gray-600 hover:text-gray-800 underline ml-2"
              >
                {t("clear_all_filters")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product count */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-medium">
          {totalCount > 0 ? (
            <>
              {t("products_total")}: {totalCount}
            </>
          ) : (
            <>{t("product_error")}</>
          )}
        </h2>
        <span className="text-sm text-gray-500">
          {t("showing") || "Showing"} {allProducts.length} {t("of") || "of"} {totalCount}
        </span>
      </div>

      {/* Initial Loading */}
      {isLoading && currentPage === 1 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Product Grid */}
      {hasResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product: Product) => (
            <SingleProduct product={product} key={product.id} />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t("product_error")}</p>
        </div>
      ) : null}

      {/* Infinite scroll loading indicator */}
      <div ref={observerTarget} className="py-8 flex justify-center">
        {(isFetching || isLoadingMore) && hasMore && (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-500">{t("loading_more") || "Loading more..."}</span>
          </div>
        )}
        {!hasMore && allProducts.length > 0 && (
          <p className="text-gray-400 text-sm">{t("no_more_products") || "No more products to load"}</p>
        )}
      </div>

      {/* Add New Product button */}
      {userInfo?.token && (
        <button
          onClick={handleNewProductRedirect}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-50"
          aria-label={t("add_new_product")}
        >
          <FaPlus className="text-white" size={24} />
        </button>
      )}

      {/* Location Modal */}
      <Modal isOpen={showLocationModal} onClose={toggleLocationModal}>
        <h1 className="text-xl font-semibold mb-4">{t("location_header")}</h1>
        <div className="relative mb-4">
          <input
            type="text"
            value={searchLocationQuery}
            onChange={(e) => setSearchLocationQuery(e.target.value)}
            placeholder={t("location_placeholder")}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {location_info?.regions.map((region) => {
            const filteredDistricts = region.districts.filter(
              (district) =>
                district
                  .toLowerCase()
                  .includes(searchLocationQuery.toLowerCase()) ||
                region.region
                  .toLowerCase()
                  .includes(searchLocationQuery.toLowerCase())
            );

            if (!filteredDistricts.length) return null;

            return (
              <div key={region.region} className="mb-4">
                <h2 className="font-bold text-lg mb-2 sticky top-0 bg-white py-2">
                  {region.region}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredDistricts.map((district, idx) => (
                    <div
                      key={idx}
                      onClick={() =>
                        handleLocationSelect(region.region, district)
                      }
                      className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedRegion === region.region &&
                          selectedDistrict === district
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-blue-100"
                        }`}
                    >
                      {district}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showModal} onClose={toggleModal}>
        <h3 className="text-xl font-semibold mb-4">{t("category_header")}</h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t("category_placeholder")}
            value={searchCategoryQuery}
            onChange={(e) => setSearchCategoryQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {Array.isArray(categories) &&
            categories
              .filter((category) => {
                const categoryName = getCategoryName(category)?.toLowerCase() || '';
                const query = searchCategoryQuery?.toLowerCase() || '';
                return categoryName.includes(query);
              })

              .map((category) => (
                <div
                  key={category.id}
                  onClick={() =>
                    handleCategorySelect(getCategoryName(category))
                  }
                  className={`cursor-pointer px-3 py-2 rounded-md transition-colors ${selectedCategory === getCategoryName(category)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-blue-100"
                    }`}
                >
                  {getCategoryName(category)}
                </div>
              ))}
        </div>
      </Modal>
    </div>
  );
};

export default ProductScreen;
