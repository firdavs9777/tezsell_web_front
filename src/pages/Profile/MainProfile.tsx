import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useGetUserProductsQuery, useGetUserServicesQuery } from "../../store/slices/users";
import "./MainProfile.css"; // Import the CSS file
import { RootState } from "../../store";
import { Product, ProductResponse, ServiceResponse, Service } from "../../store/type";
import { BASE_URL } from "../../store/constants";
import { useNavigate } from "react-router-dom";
import { useGetFavoriteItemsQuery } from "../../store/slices/productsApiSlice";

const MainProfile = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

 const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetUserProductsQuery({
    token: token,
  });
  const { data: favorite_items, isLoading: fav_loading, error:fav_error, refetch: reload } = useGetFavoriteItemsQuery({
    token: token,
  });

  const { data: service_data, isLoading: service_loading, error: service_error, refetch:service_refetch } = useGetUserServicesQuery({
    token: token,
  });
   
  interface ServiceRes   {
    liked_services: Service[];
    liked_products: Product[];
  }
  const products: ProductResponse = data as ProductResponse;
  const services: ServiceResponse  = service_data as ServiceResponse
  const liked_items: ServiceRes = favorite_items as ServiceRes;
  console.log(liked_items);
  useEffect(() => {
    if (token) {
      refetch(); 
      service_refetch();
      reload()
    }
  }, [token, refetch, service_refetch, reload]); 

  if (!token) {
    return <div>Please log in to view products</div>;
  }
  if (isLoading) {
    return <div>User Products Loading...</div>;
  }
  if (service_loading) {
    return <div> User Services Loading... </div>
  }
  if (error) {
    return <div>User Products Loading Error</div>;
  }
  if (service_error) {
    return <div> User Services Loading Error</div>
  }
  const handleNewProductRedirect = () => {
    navigate('/new-product');
  };
  const handleNewServiceRedirect = () => {
      navigate('/new-service');
  }
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Page</h1>
      </div>

      <div className="profile-content">
        <div className="profile-overview">

          {userInfo ? (
            <img
              src={`${BASE_URL}${userInfo.user_info.user_image}`}
              alt="User profile"
              className="navbar-profile-image"
            />
          ) : (
            <img
              src="https://via.placeholder.com/150"
              alt="Profile"
              className="profile-image"
            />
          )}

          <div className="profile-details">
            <h2>
              {userInfo ? (
                <p>
                  {userInfo.user_info.username}
                </p>
              ) : (<p>d</p>)}
            </h2>
            <p className="bio">
              A short bio about the user. Something interesting about them.
            </p>
            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>



        <div className="my-products">
          <h3>My Products - Total Products({products.results.length}) </h3>
          {products && products.results.length > 0 ? (
            <ul>
              {products.results.map((product: Product) => (
                <li key={product.id}>{product.title}</li>
              ))}
            </ul>
          ) : (
            <p>No products available</p>
          )}
          <button className="add-btn" onClick={handleNewProductRedirect}>Add New Product</button>
        </div>
        <div className="my-services">
          <h3>My Services-Total Services({services.results.length})</h3>
            {services && services.results.length > 0 ? (
            <ul>
              {services.results.map((service: Service) => (
                <li key={service.id}>{service.name}</li>
              ))}
            </ul>
          ) : (
            <p>No services available</p>
          )}
          <button className="add-btn" onClick={handleNewServiceRedirect}>Add New Service</button>
        </div>
                <div className="recent-activity">
          <h3>Favorite Products</h3>
          <ul>
            <li>Added a new product: Coffee Mug</li>
            <li>Posted a new service: Web Design</li>
            <li>Liked a post: "Great recipes!"</li>
          </ul>
        </div>

        
        <div className="recent-activity">
          <h3>Favorite Services ( {liked_items.liked_services.length})</h3>
          <ul>
            <li >Added a new product: Coffee Mug</li>
           
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
