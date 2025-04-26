import React, { useState } from "react";
import { useGetAllLocationListQuery } from "@store/slices/productsApiSlice";
import {
  AllLocationList,
  Category,
  Service,
  ServiceResponse,
} from "../../store/type";
import { useTranslation } from "react-i18next";
import SingleService from "./SingleService";
import Modal from "@components/Modal";
import { IoSearch } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import Pagination from "@components/Pagination";
import {
  useGetServiceCategoryListQuery,
  useGetServicesQuery,
} from "@store/slices/serviceApiSlice";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ServiceScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [searchLocationQuery, setSearchLocationQuery] = useState("");
  const [searchServiceQuery, setSearchServiceQuery] = useState("");
  const [pageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedtDistrict] = useState("");
  const { t } = useTranslation();

  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleLocationModal = () => setLocationModal((prev) => !prev);
  const nextPagehandler = (page) => setCurrentPage(page);
  const navigate = useNavigate();
  const {
    data: data_category,
    isLoading: isLoading_category,
    error: error_cat,
  } = useGetServiceCategoryListQuery({});
  const {
    data: all_location,
    isLoading: isLoading_location,
    error: error_loc,
  } = useGetAllLocationListQuery({});
  const { data, isLoading, error, refetch } = useGetServicesQuery({
    currentPage,
    page_size: pageSize,
    category_name: selectedCategory,
    region_name: selectedRegion,
    district_name: selectedDistrict,
    service_name: searchServiceQuery,
  });

  const services = data as ServiceResponse;
  const location_info = all_location as AllLocationList;
  const categories = data_category as Category[];

  if (isLoading || isLoading_location || isLoading_category)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center py-10 text-lg text-gray-600">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent rounded-full mb-2" />
          <div>{t("loading")}</div>
        </div>
      </div>
    );
  if (error || error_loc || error_cat)
    return (
      <div className="text-center py-10 text-lg text-red-600 bg-red-50 rounded-lg shadow-sm border border-red-100">
        {t("error")}
      </div>
    );

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    toggleModal();
  };
  const handleLocationSelect = (regionName, districtName) => {
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
  const handleNewServiceRedirect = () => {
    navigate("/new-service");
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 max-w-6xl mx-auto">
      {/* Search bar section, more like ProductScreen */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center mb-6">
        <button
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
          onClick={toggleLocationModal}
        >
          <FaLocationDot size={20} className="text-blue-600" />
          {t("search_location")}
        </button>

        <button
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200"
          onClick={toggleModal}
        >
          <BiCategory size={20} className="text-green-600" />
          {t("search_category")}
        </button>

        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={t("search_service_placeholder")}
            className="w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            value={searchServiceQuery}
            onChange={(e) => setSearchServiceQuery(e.target.value)}
          />
        </div>

        <button
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
          onClick={reloadSearch}
        >
          <IoSearch size={20} />
          <span className="hidden sm:inline">{t("search_text")}</span>
        </button>
      </div>

      {/* Active Filters */}
      {(selectedCategory || (selectedRegion && selectedDistrict)) && (
        <div className="mb-6 space-y-2">
          {selectedCategory && (
            <div className="flex items-center justify-between bg-yellow-100 px-4 py-2 rounded-md">
              <span>
                {t("selected_category")} <strong>{selectedCategory}</strong>
              </span>
              <button
                onClick={handleCategoryRemove}
                className="ml-4 text-red-500 font-bold hover:text-red-700 transition duration-200"
              >
                X
              </button>
            </div>
          )}

          {selectedRegion && selectedDistrict && (
            <div className="flex items-center justify-between bg-pink-100 px-4 py-2 rounded-md">
              <span>
                {t("selected_location")} <strong>{selectedRegion}</strong> -{" "}
                <strong>{selectedDistrict}</strong>
              </span>
              <button
                onClick={handleLocationRemoveFilter}
                className="ml-4 text-red-500 font-bold hover:text-red-700 transition duration-200"
              >
                X
              </button>
            </div>
          )}

          {(selectedRegion || selectedDistrict || selectedCategory) && (
            <button
              onClick={handleFilterRemove}
              className="bg-red-100 hover:bg-red-200 text-sm px-4 py-1 rounded-md transition duration-200"
            >
              {t("clear_filters")}
            </button>
          )}
        </div>
      )}

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services?.results?.length ? (
          services.results.map((service: Service) => (
            <SingleService key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-full bg-gray-50 py-10 px-6 rounded-lg text-center">
            <p className="text-gray-500">{t("service_error")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {services?.results?.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalCount={services.count || 0}
            pageSize={pageSize}
            onPageChange={nextPagehandler}
          />
        </div>
      )}
      <div className="add-new-service" onClick={handleNewServiceRedirect}>
        <FaPlus style={{ fontSize: "30px", color: "#333" }} />
      </div>

      {/* Location Modal */}
      <Modal isOpen={showLocationModal} onClose={toggleLocationModal}>
        <h1 className="text-xl font-bold mb-4 text-gray-800">
          {t("location_header")}
        </h1>
        <input
          type="text"
          placeholder={t("location_placeholder")}
          value={searchLocationQuery}
          onChange={(e) => setSearchLocationQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {location_info.regions.map((region) => {
            const filteredDistricts = region.districts.filter((d) =>
              d.toLowerCase().includes(searchLocationQuery.toLowerCase())
            );
            return (
              filteredDistricts.length > 0 && (
                <div
                  key={region.region}
                  className="border-b border-gray-200 pb-3 last:border-b-0"
                >
                  <h2 className="font-bold mt-2 mb-2 text-gray-700">
                    {region.region}
                  </h2>
                  <ul className="space-y-1">
                    {filteredDistricts.map((district, i) => (
                      <li
                        key={i}
                        onClick={() =>
                          handleLocationSelect(region.region, district)
                        }
                        className={`cursor-pointer px-3 py-2 rounded-md transition duration-200 ${
                          selectedDistrict === district
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-blue-200"
                        }`}
                      >
                        {district}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            );
          })}
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showModal} onClose={toggleModal}>
        <h3 className="text-xl font-bold mb-4 text-gray-800">
          {t("category_header")}
        </h3>
        <input
          type="text"
          placeholder={t("category_placeholder")}
          value={searchCategoryQuery}
          onChange={(e) => setSearchCategoryQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
        <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
          {categories?.length ? (
            categories
              .filter((c) =>
                c.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())
              )
              .map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleCategorySelect(c.name)}
                  className={`p-3 cursor-pointer hover:bg-blue-200 transition duration-200 ${
                    selectedCategory === c.name
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {c.name}
                </li>
              ))
          ) : (
            <li className="p-3 text-gray-500 text-center">
              {t("category_error")}
            </li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default ServiceScreen;
