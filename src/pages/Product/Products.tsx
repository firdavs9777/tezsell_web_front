import React, { useState } from "react";
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
import { useTranslation } from "react-i18next";
import SingleProduct from "./SingleProduct";
import Modal from "@components/Modal";
import { IoSearch } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import Pagination from "@components/Pagination";

const ProductScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [pageSize, setPageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>("");
  const [selectedDistrict, setSelectedtDistrict] = useState<string | null>("");
  const { t, i18n } = useTranslation();

  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleLocationModal = () => setLocationModal((prev) => !prev);
  const nextPagehandler = (page: number) => setCurrentPage(page);

  const {
    data: data_category,
    isLoading: isLoading_category,
    error: error_cat,
  } = useGetCategoryListQuery({});
  const {
    data: all_location,
    isLoading: isLoading_location,
    error: error_loc,
  } = useGetAllLocationListQuery({});
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    currentPage,
    page_size: pageSize,
    category_name: selectedCategory,
    region_name: selectedRegion,
    district_name: selectedDistrict,
    product_title: searchProductQuery,
  });

  const products: ProductResponse = data as ProductResponse;
  const location_info: AllLocationList = all_location as AllLocationList;
  const categories: Category[] = data_category as Category[];

  if (isLoading || isLoading_location || isLoading_category)
    return (
      <div className="text-center py-8">{t("loading_message_product")}</div>
    );
  if (error || error_loc || error_cat)
    return (
      <div className="text-red-500 text-center py-8">
        {t("loading_message_error")}
      </div>
    );

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    toggleModal();
  };

  const handleLocationSelect = (regionName: string, districtName: string) => {
    setSelectedRegion(regionName);
    setSelectedtDistrict(districtName);
    toggleLocationModal();
  };

  const reloadSearch = () => refetch();

  const handleCategoryRemove = () => setSelectedCategory("");
  const handleLocationRemoveFilter = () => {
    setSelectedRegion("");
    setSelectedtDistrict("");
  };
  const handleFilterRemove = () => {
    setSelectedCategory("");
    setSelectedRegion("");
    setSelectedtDistrict("");
  };

  const totalCount = products.count || 0;

  return (
    <div className="px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
        <button
          className="flex items-center gap-2 mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={toggleLocationModal}
        >
          <FaLocationDot size={20} />
          {t("search_location")}
        </button>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          onClick={toggleModal}
        >
          <BiCategory size={20} />
          {t("search_category")}
        </button>

        <div className="relative mt-2 flex-1 w-full">
          <input
            type="text"
            placeholder={t("search_product_placeholder")}
            className="w-full h-[50px]  y-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={searchProductQuery}
            onChange={(e) => setSearchProductQuery(e.target.value)}
          />
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          onClick={() => {
            setSearchProductQuery(searchProductQuery);
            reloadSearch();
          }}
        >
          <IoSearch size={20} />
          {t("search_text")}
        </button>
      </div>

      {/* Active Filters */}
      <div className="mb-4 space-y-2">
        {selectedCategory && (
          <div className="flex items-center justify-between bg-yellow-100 px-4 py-2 rounded">
            <span>
              {t("selected_category")} <strong>{selectedCategory}</strong>
            </span>
            <button
              onClick={handleCategoryRemove}
              className="ml-4 text-red-500 font-bold"
            >
              X
            </button>
          </div>
        )}
        {selectedRegion && selectedDistrict && (
          <div className="flex items-center justify-between bg-pink-100 px-4 py-2 rounded">
            <span>
              {t("selected_location")} <strong>{selectedRegion}</strong> -{" "}
              <strong>{selectedDistrict}</strong>
            </span>
            <button
              onClick={handleLocationRemoveFilter}
              className="ml-4 text-red-500 font-bold"
            >
              X
            </button>
          </div>
        )}
        {(selectedRegion || selectedDistrict || selectedCategory) && (
          <button
            onClick={handleFilterRemove}
            className="bg-red-100 hover:bg-red-200 text-sm px-4 py-1 rounded"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.results?.length ? (
          products.results.map((product: Product) => (
            <SingleProduct product={product} key={product.id} />
          ))
        ) : (
          <p className="text-gray-500">{t("product_error")}</p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={nextPagehandler}
        />
      </div>

      {/* Location Modal */}
      <Modal isOpen={showLocationModal} onClose={toggleLocationModal}>
        <h1 className="text-lg font-semibold mb-4">{t("location_header")}</h1>
        <input
          type="text"
          value={searchLocationQuery}
          onChange={(e) => setSearchLocationQuery(e.target.value)}
          placeholder={t("location_placeholder")}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        {location_info.regions.map((region) => {
          const filtered = region.districts.filter((d) =>
            d.toLowerCase().includes(searchLocationQuery.toLowerCase())
          );
          if (!filtered.length) return null;
          return (
            <div key={region.region}>
              <h2 className="font-bold mt-4 mb-2">{region.region}</h2>
              <ul className="space-y-1">
                {filtered.map((district, idx) => (
                  <li
                    key={idx}
                    onClick={() =>
                      handleLocationSelect(region.region, district)
                    }
                    className={`cursor-pointer px-3 py-2 rounded hover:bg-blue-200 ${
                      selectedDistrict === district
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {district}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showModal} onClose={toggleModal}>
        <h3 className="text-lg font-semibold mb-4">{t("category_header")}</h3>
        <input
          type="text"
          placeholder={t("category_placeholder")}
          value={searchCategoryQuery}
          onChange={(e) => setSearchCategoryQuery(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <ul className="divide-y divide-gray-200">
          {categories?.length ? (
            categories
              .filter((category) =>
                category.name
                  .toLowerCase()
                  .includes(searchCategoryQuery.toLowerCase())
              )
              .map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleCategorySelect(category.name)}
                  className={`p-3 cursor-pointer hover:bg-blue-200 ${
                    selectedCategory === category.name
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {category.name}
                </li>
              ))
          ) : (
            <li className="text-gray-500">{t("category_error")}</li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default ProductScreen;
