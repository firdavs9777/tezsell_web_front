import { useNavigate, useParams } from "react-router-dom";
import { useGetSingleServiceQuery } from "../../store/slices/serviceApiSlice";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../store/constants";
import { SingleService } from "../../store/type";
import { FaHeart, FaCommentAlt, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import "./ServiceDetail.css";

const ServiceDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useGetSingleServiceQuery(id);
  const serviceItem: SingleService | null = data as SingleService;

  const [selectedImage, setSelectedImage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (serviceItem?.service.images?.length) {
      setSelectedImage(`${BASE_URL}/services${serviceItem.service.images[0].image}`);
    }
  }, [serviceItem]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !serviceItem) {
    return <div className="error">Error Occurred...</div>;
  }

  const { service } = serviceItem;

  return (
    <>
    <div className="service-detail-container">

      <section className="service-detail-left">
        <div className="service-image-gallery">
          <div className="service-image-thumbnails">
            {service.images.map((image, index) => (
              <img
                key={index}
                src={`${BASE_URL}/services${image.image}`}
                alt={`${service.name} ${index + 1}`}
                onClick={() => setSelectedImage(`${BASE_URL}/services${image.image}`)}
                className={
                  selectedImage === `${BASE_URL}/services${image.image}`
                    ? "thumbnail-selected"
                    : ""
                }
              />
            ))}
          </div>
            <img
            className="service-selected-image"
            src={selectedImage}
            alt={service.name}
          />
      
        </div>
      </section>
      <section className="service-detail-right">
        <p className="service-category">{service.category.name}</p>
        <h2 className="service-item-title">{service.name}</h2>
        <p className="service-item-description">{service.description}</p>

        <div className="service-detail-info">
        
          <div className="service-owner">
            <img
              src={`${BASE_URL}/${service.userName.profile_image.image}`}
              alt={service.userName.username}
              className="owner-profile-image"
            />
            <div>
              <p>
                <FaUser /> {service.userName.username}
              </p>
              <p>
                <FaMapMarkerAlt /> {service.userName.location.region} -{" "}
                {service.userName.location.district}
              </p>
            </div>
          </div>
        </div>

        <div className="service-actions">
          <button className="service-btn service-btn-like">
            <FaHeart /> Like
          </button>
          <button
            className="service-btn service-btn-chat"
            onClick={() => navigate("/chat")}
          >
            <FaCommentAlt /> Chat
          </button>
        </div>
      </section>

     
    </div>
     <section className="recommended-services-container">
        <h3>Recommended Services</h3>
      
      </section>
    </>
  );
};

export default ServiceDetail;
