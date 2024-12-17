import React from 'react';
import { Service } from '../../store/type';
import { BASE_URL } from '../../store/constants';
import './SingleService.css';
import {
  FaMapMarkerAlt,
  FaStar,
  FaHeart,
  FaComment,
  FaTag,
} from 'react-icons/fa';

interface SingleServiceProps {
  service: Service;
}

const SingleProduct: React.FC<SingleServiceProps> = ({ service }) => {
  return (
    <div className="service-card">
      <div className="image-container">
        {service.images.length > 0 ? (
          <img
            src={`${BASE_URL}${service.images[0].image}`}
            alt={service.name}
            className="service-image"
          />
        ) : (
          <div className="no-image-placeholder">No Image</div>
        )}
      </div>
      <div className="service-details">
        <h3 className="service-title">{service.name}</h3>
        <p className="service-location">
          <FaMapMarkerAlt className='service-map-icon' />
          {service.location.region} - {service.location.district}
        </p>
        <div className="service-meta">
          {/* <span className="service-rating">
            <FaStar style={{ marginRight: '4px', color: '#FFD700' }} />
            {service}
          </span>
          <span className="service-likes">
            <FaHeart style={{ marginRight: '4px', color: 'red' }} />
            {service.likeCount}
          </span> */
          <span className="service-comments">
            <FaComment style={{ marginRight: '4px', color: '#666' }} />
            {service.comments.length}
          </span> 
          }
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
