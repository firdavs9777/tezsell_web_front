import './MainProfile.css'; // Import the CSS file

const MainProfile = () => {
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
            <p className="bio">A short bio about the user. Something interesting about them.</p>
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
          <ul>
            <li>Product 1</li>
            <li>Product 2</li>
          </ul>
          <button className="add-btn">Add New Product</button>
        </div>
         <div className="my-services">
          <h3>My Services</h3>
          <ul>
            <li>Product 1</li>
            <li>Product 2</li>
          </ul>
          <button className="add-btn">Add New Product</button>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
