import Modal from "@components/Modal";
import Pagination from "@components/Pagination";
import SingleService from "@services/SingleService";
import { useGetAllLocationListQuery } from "@store/slices/productsApiSlice";
import {
  useGetServiceCategoryListQuery,
  useGetServicesQuery,
} from "@store/slices/serviceApiSlice";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BiCategory } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  AllLocationList,
  Category,
  Service,
  ServiceResponse,
} from "../../store/type";

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
  const { t, i18n } = useTranslation();

  const toggleModal = () => setShowModal((prev) => !prev);
  const toggleLocationModal = () => setLocationModal((prev) => !prev);
  const nextPagehandler = (page: number) => setCurrentPage(page);
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
    lang: i18n.language,
    region_name: selectedRegion,
    district_name: selectedDistrict,
    service_name: searchServiceQuery,
  });

  const services = data as ServiceResponse;
  console.log(services);
  const location_info = all_location as AllLocationList;
  const categories = data_category as Category[];

  // Use the current language to determine which category field to display
  const currentLang = i18n.language;

  const getCategoryName = (category: Category) => {
    if (!category) return "";

    // Make sure we have a valid category object
    if (typeof category !== "object") return "";

    switch (currentLang) {
      case "uz":
        return category.name_uz;
      case "ru":
        return category.name_ru;
      case "en":
      default:
        return category.name_en;
    }
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categories?.length) return [];

    return categories.filter((c) => {
      const categoryName = getCategoryName(c);
      // Make sure categoryName is a string before calling toLowerCase()
      return categoryName && typeof categoryName === "string"
        ? categoryName.toLowerCase().includes(searchCategoryQuery.toLowerCase())
        : false;
    });
  }, [categories, searchCategoryQuery, currentLang]);

  if (isLoading || isLoading_location || isLoading_category)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center py-10 text-lg text-gray-600">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent rounded-full mb-2" />
          <div>{t("loading.loading")}</div>
        </div>
      </div>
    );
  if (error || error_loc || error_cat)
    return (
      <div className="text-center py-10 text-lg text-red-600 bg-red-50 rounded-lg shadow-sm border border-red-100">
        {t("error")}
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

  const handleNewServiceRedirect = () => {
    navigate("/new-service");
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row flex-wrap gap-3 md:items-center mb-8">
        <button
          onClick={toggleLocationModal}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 border border-gray-300 rounded-full shadow-sm text-sm transition"
        >
          <FaLocationDot size={18} className="text-blue-600" />
          {t("search_location")}
        </button>

        <button
          onClick={toggleModal}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-green-50 border border-gray-300 rounded-full shadow-sm text-sm transition"
        >
          <BiCategory size={18} className="text-green-600" />
          {t("search_category")}
        </button>

        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={t("search_service_placeholder")}
            value={searchServiceQuery}
            onChange={(e) => setSearchServiceQuery(e.target.value)}
            className="w-full h-12 pl-14 pr-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 transition"
          />
        </div>

        <button
          onClick={reloadSearch}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm shadow-md transition"
        >
          <IoSearch size={18} />
          <span className="hidden sm:inline">{t("search_text")}</span>
        </button>
      </div>

      {/* Active Filters */}
      {(selectedCategory || (selectedRegion && selectedDistrict)) && (
        <div className="mb-6 space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-md shadow-sm">
                  <span className="mr-2">
                    {t("selected_category")}:{" "}
                    <strong>{selectedCategory}</strong>
                  </span>
                  <button
                    onClick={handleCategoryRemove}
                    className="ml-2 w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition duration-200"
                    aria-label="Remove category filter"
                  >
                    ×
                  </button>
                </div>
              )}

              {selectedRegion && selectedDistrict && (
                <div className="flex items-center bg-pink-100 px-4 py-2 rounded-md shadow-sm">
                  <span className="mr-2">
                    {t("selected_location")}: <strong>{selectedRegion}</strong>{" "}
                    - <strong>{selectedDistrict}</strong>
                  </span>
                  <button
                    onClick={handleLocationRemoveFilter}
                    className="ml-2 w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition duration-200"
                    aria-label="Remove location filter"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {(selectedRegion || selectedDistrict || selectedCategory) && (
              <div className="mt-2">
                <button
                  onClick={handleFilterRemove}
                  className="bg-red-100 hover:bg-red-200 text-red-600 text-sm px-4 py-1 rounded-md transition duration-200 shadow-sm"
                >
                  {t("clear_filters")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {services?.results?.length ? (
          services.results.map((service: Service) => (
            <SingleService key={service.id} service={service} />
          ))
        ) : (
          <div className="col-span-full bg-gray-50 py-12 px-6 rounded-lg text-center shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">{t("service_error")}</p>
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

      {/* Add new service button */}
      <div
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-110"
        onClick={handleNewServiceRedirect}
      >
        <FaPlus className="text-white text-xl" />
      </div>

      <Modal isOpen={showLocationModal} onClose={toggleLocationModal}>
        <h1 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          {t("location_header")}
        </h1>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t("location_placeholder")}
            value={searchLocationQuery}
            onChange={(e) => setSearchLocationQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
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
        <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
          {t("category_header")}
        </h3>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={t("category_placeholder")}
            value={searchCategoryQuery}
            onChange={(e) => setSearchCategoryQuery(e.target.value)}
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {filteredCategories?.length ? (
            filteredCategories.map((c) => (
              <li
                key={c.id}
                onClick={() => handleCategorySelect(getCategoryName(c))}
                className={`p-3 cursor-pointer rounded-md transition duration-200 ${
                  selectedCategory === getCategoryName(c)
                    ? "bg-blue-500 text-white"
                    : "bg-white hover:bg-blue-100"
                }`}
              >
                {getCategoryName(c)}
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
