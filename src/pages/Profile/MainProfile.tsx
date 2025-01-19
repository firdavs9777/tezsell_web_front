import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetUserProductsQuery } from "../../store/slices/users";
import "./MainProfile.css"; // Import the CSS file
import { RootState } from "../../store";
import { Product, ProductResponse } from "../../store/type";

const MainProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  const { data, isLoading, error, refetch } = useGetUserProductsQuery({
    token: token,
  });
  const products: ProductResponse = data as ProductResponse;
  useEffect(() => {
    if (token) {
      refetch(); // Refetch user products whenever token is available
    }
  }, [token, refetch]); // Depend on token and refetch function

  if (!token) {
    return <div>Please log in to view products</div>;
  }

  if (isLoading) {
    return <div>User Products Loading...</div>;
  }

  if (error) {
    return <div>User Products Loading Error</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Page</h1>
      </div>

      <div className="profile-content">
        <div className="profile-overview">
          <img
            src="https://via.placeholder.com/150"
            alt="Profile"
            className="profile-image"
          />
          <div className="profile-details">
            <h2>John Doe</h2>
            <p className="bio">
              A short bio about the user. Something interesting about them.
            </p>
            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <ul>
            <li>Added a new product: Coffee Mug</li>
            <li>Posted a new service: Web Design</li>
            <li>Liked a post: "Great recipes!"</li>
          </ul>
        </div>

        <div className="my-products">
          <h3>My Products</h3>
          {products && products.results.length > 0 ? (
            <ul>
              {products.results.map((product: Product) => (
                <li key={product.id}>{product.title}</li>
              ))}
            </ul>
          ) : (
            <p>No products available</p>
          )}
          <button className="add-btn">Add New Product</button>
        </div>

        <div className="my-services">
          <h3>My Services</h3>
          <ul>
            <li>Product 1</li>
            <li>Product 2</li>
          </ul>
          <button className="add-btn">Add New Service</button>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
