import { useState, useEffect } from "react";
import {
  useGetAllLocationListQuery,
  useGetCategoryListQuery,
  useGetProductsQuery,
} from "@store/slices/productsApiSlice";
import { useSelector } from "react-redux";
import {
  AllLocationList,
  Category,
  Product,
  ProductResponse,
} from "@store/type";
import { useTranslation } from "react-i18next";
import SingleProduct from "./SingleProduct";
import Modal from "@components/Modal";

import { BiCategory } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import { FaPlus, FaTimes } from "react-icons/fa";
import Pagination from "@components/Pagination";
import { useNavigate } from "react-router-dom";
import { RootState } from "@store/index";

const ProductScreen = () => {
  // States
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>("");

  const { t, i18n } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const navigate = useNavigate();
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // API Queries
  const { data: data_category, isLoading: isLoading_category } =
    useGetCategoryListQuery({});

  const { data: all_location, isLoading: isLoading_location } =
    useGetAllLocationListQuery({});

  const { data, isLoading, error } = useGetProductsQuery({
    currentPage,
    page_size: pageSize,
    lang: i18n.language,
    category_name: selectedCategory,
    region_name: selectedRegion,
    district_name: selectedDistrict,
    product_title: debouncedSearchQuery,
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedRegion,
    selectedDistrict,
    debouncedSearchQuery,
  ]);

  // Type assertions
  const products = data as ProductResponse;
  const location_info = all_location as AllLocationList;
  const categories = data_category as Category[];

  // Modal toggles
  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleLocationModal = () => setLocationModal((prev) => !prev);

  // Handle pagination
  const handlePageChange = (page: number) => setCurrentPage(page);

  // Loading and error states
  const isLoadingData = isLoading || isLoading_location || isLoading_category;
  const hasError = error;

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        {t("loading_message_product")}
      </div>
    );
  }

  if (hasError) {
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

  const totalCount = products?.count;
  const hasResults = products?.results?.length > 0;
  const hasActiveFilters =
    selectedCategory ||
    selectedRegion ||
    selectedDistrict ||
    debouncedSearchQuery;

  return (
    <div className="px-4 mx-auto max-w-7xl my-4">
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

      {/* Product count & grid */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-medium">
          {totalCount > 0 ? (
            <>{t("products_total", { count: totalCount })}</>
          ) : (
            <>{t("product_error")}</>
          )}
        </h2>

        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-300 rounded p-2 text-sm"
          >
            <option value="12">10 {t("per_page")}</option>
            <option value="24">20 {t("per_page")}</option>
            <option value="48">50 {t("per_page")}</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {hasResults ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.results.map((product: Product) => (
            <SingleProduct product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t("product_error")}</p>
        </div>
      )}

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Add New Product button */}
      {userInfo?.token && (
        <button
          onClick={handleNewProductRedirect}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
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
