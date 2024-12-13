import React, { useState } from "react"
import { useGetCategoryListQuery, useGetProductsQuery } from "../../store/slices/productsApiSlice";
import { Category, Product, ProductResponse } from "../../store/type";
import SingleProduct from "./SingleProduct";
import './Products.css'
import Modal from "../../components/Modal";
const ProductScreen = () => {

  const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  const toggleModal = () => {
    setShowModal((prev) => !prev); // Toggle the modal visibility
  };
  const {data: data_category, isLoading: isLoading_category,error: error_cat} = useGetCategoryListQuery({})
  const { data, isLoading, error } = useGetProductsQuery({});

  const products: ProductResponse = data as ProductResponse;

  const categories: Category[] = data_category as Category[]
  console.log(categories);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    // Assuming error has a message field, if not adjust accordingly
    return <div>Error: {(error as { message: string }).message}</div>;
  } 
   if (isLoading_category) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error loading products: {(error as { message: string }).message}</div>;
  }

  if (error_cat) {
    return <div>Error loading categories: {(error_cat as { message: string }).message}</div>;
  }
    const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey); // Set the selected category
    toggleModal(); // Close the modal after selection
  };
  return (
    <div>
      <div className="search-area">
        <button className="search-category" onClick={toggleModal}>Categories</button>
        <input placeholder='Search for Products' className="search-input" />
            <Modal isOpen={showModal} onClose={toggleModal} >
          <h3>Select a Category</h3>
          <ul className="categories-list">
            {categories?.length ? (
              categories.map((category: Category) => (
                <li 
                  key={category.id} 
                  onClick={() => handleCategorySelect(category.key)}
                  style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                >
                  {category.name}
                </li>
              ))
            ) : (
              <li>No categories available</li>
            )}
          </ul>
        </Modal>
      </div>  
      <div className="product-list">
        {products?.results?.length ? (
          products.results.map((product: Product) => (
            <SingleProduct product={product} key={product.id} />
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>

    </div>
  )
}
export default ProductScreen;