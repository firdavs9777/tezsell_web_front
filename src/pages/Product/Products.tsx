import React, { useState } from "react";
import { useGetAllLocationListQuery, useGetCategoryListQuery, useGetProductsQuery } from "../../store/slices/productsApiSlice";
import { AllLocationList, Category, Product, ProductResponse } from "../../store/type";
import { useTranslation } from 'react-i18next';
import SingleProduct from "./SingleProduct";
import './Products.css';
import Modal from "../../components/Modal";
import { IoSearch } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { FaLocationDot } from "react-icons/fa6";
import Pagination from "../../components/Pagination";

const ProductScreen = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLocationModal, setLocationModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState('');
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(''); // Set to null for no selection initially
  const [selectedRegion, setSelectedRegion] = useState<string | null>('');
  const [selectedDistrict, setSelectedtDistrict] = useState<string | null>('');
  const { t } = useTranslation();

  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };
  const toggleLocationModal = () => {
    setLocationModal((prev) => !prev);
  }

  const nextPagehandler = (page: number) => {
    setCurrentPage(page);
  };

  const { data: data_category, isLoading: isLoading_category, error: error_cat } = useGetCategoryListQuery({});
  const { data: all_location, isLoading: isLoading_location, error: error_loc } = useGetAllLocationListQuery({})
  const { data, isLoading, error } = useGetProductsQuery({ currentPage, page_size: pageSize, category_name: selectedCategory, region_name: selectedRegion, district_name: selectedDistrict, product_title: searchProductQuery });

  const products: ProductResponse = data as ProductResponse;
  const location_info: AllLocationList = all_location as AllLocationList;
  const categories: Category[] = data_category as Category[];
  console.log(location_info)
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isLoading_location) {
    return <div>Loading Location...</div>;
  }
  if (error) {
    return <div>Error while loading product: {(error as { message: string }).message}</div>;
  }
  if (error_loc) {
    return <div>Error while loading product: {(error as { message: string }).message}</div>;
  }
  if (isLoading_category) {
    return <div>Loading categories...</div>;
  }

  if (error_cat) {
    return <div>Error loading categories: {(error_cat as { message: string }).message}</div>;
  }

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName); // Set the selected category
    toggleModal(); // Close the modal after selection
  };
  const handleLocationSelect = (regionName: string, districtName: string) => {
    setSelectedRegion(regionName);
    setSelectedtDistrict(districtName);
    toggleLocationModal()
  }

  const handleFilterRemove = () => {
    if (selectedCategory !== '') {
      setSelectedCategory('')
    }
    setSelectedRegion('')
    setSelectedtDistrict('')
  }

  const totalCount = products.count || 0;



  return (
    <div>
      <div className="search-area">
        <button className="search-category" onClick={toggleLocationModal}>
          <FaLocationDot size={20} className="search-icon" />
          Location
        </button>
        <button className="search-category" onClick={toggleModal}>
          <BiCategory size={20} className="search-icon" />
          Categories
        </button>
        <div className="search-input-wrapper">
          <IoSearch size={20} className="search-input-icon" />
          <input placeholder="Search for Products" className="search-input" value={searchProductQuery} onChange={(e) => setSearchProductQuery(e.target.value)}/>
        </div>
        <button className="search-category">
          <IoSearch size={20} className="search-icon" />
          Search
        </button>
      </div>

      {selectedCategory && (
        <div className="selected-category">
          <p>Selected Category: <strong>{selectedCategory}</strong></p>
        </div>
      )}

      {selectedRegion && selectedDistrict && (
        <div className="selected-location">
          <p>Selected Location: <strong>{selectedRegion}</strong> - <strong>{selectedDistrict}</strong></p>
        </div>
      )}
      {(selectedRegion || selectedDistrict || selectedCategory) && (
        <button className="clear-category" onClick={handleFilterRemove}>Clear All Filters</button>
      )}


      <div className="product-list">
        {products?.results?.length ? (
          products.results.filter((product:Product) => product.title.toLowerCase().includes(searchProductQuery.toLowerCase())).map((product: Product) => (
            <SingleProduct product={product} key={product.id} />
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
      <div className="pagination-container">
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={nextPagehandler}
        />
      </div>
      <Modal isOpen={showLocationModal} onClose={toggleLocationModal}>
        <h1>Select a location</h1>
        <div className="selected-category">
        </div>
        <input
          type="text"
          placeholder="Search region here"
          value={searchLocationQuery}
          onChange={(e) => setSearchLocationQuery(e.target.value)}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        {location_info.regions.map((region) => {
          // Filter districts based on the search query
          const filteredDistricts = region.districts.filter((district) =>
            district.toLowerCase().includes(searchLocationQuery.toLowerCase())
          );

          if (filteredDistricts.length > 0) {
            return (
              <div key={region.region}>
                <h2>{region.region}</h2>
                <ul>
                  {filteredDistricts.map((district, index) => (
                    <li key={index} onClick={() => handleLocationSelect(region.region, district)}>
                      {district}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null; // Return null if no districts match
        })}
      </Modal>

      <Modal isOpen={showModal} onClose={toggleModal}>
        <h3>Select a Category</h3>
        <input
          type="text"
          placeholder="Search Categories"
          value={searchCategoryQuery}
          onChange={(e) => setSearchCategoryQuery(e.target.value)}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '100%',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <ul className="categories-list">
          {categories?.length ? (
            categories.filter((category: Category) => category.name.toLowerCase().includes(searchCategoryQuery.toLowerCase())).map((category: Category) => (
              <li
                key={category.id}
                onClick={() => handleCategorySelect(category.name)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #ccc',
                  backgroundColor: selectedCategory === category.name ? '#08b3f7' : 'transparent', // Change color if selected
                  color: selectedCategory === category.name ? 'white' : 'black', // Change text color
                }}
              >
                <p>{category.name}</p>
              </li>

            ))
          ) : (
            <li>No categories available</li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default ProductScreen;
