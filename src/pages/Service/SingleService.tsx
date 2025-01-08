import React from 'react';
import { Service } from '../../store/type';
import { BASE_URL } from '../../store/constants';
import './SingleService.css';
import {
  FaMapMarkerAlt,
  FaPlus,

  // FaComment,

} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

interface SingleServiceProps {
  service: Service;
}


const SingleService: React.FC<SingleServiceProps> = ({ service }) => {
const navigate = useNavigate();
  const { search } = useLocation();
   const sp = new URLSearchParams(search);
 const redirectHandler = (id: number) => {
    navigate(`/service/${id}`);
  }
   const handleNewServiceRedirect = () => {
    navigate('/new-service');
  };
  return (
    <section className="service-card" >
      <div className="image-container" onClick={() => redirectHandler(service.id)}>
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
      <div className="service-details" onClick={() => redirectHandler(service.id)}>
        <p className='service-category'>{service.category.name}</p>
        <h2 className="service-title">{service.name.length > 20 ? `${service.name.substring(0, 26)}` : service.name}</h2>
        <p className="service-description">
          <strong>{service.description.length > 34 ? `${service.description.substring(0, 34)}...` : service.description}</strong>
        </p>

        <div className="service-meta">        
          <span className="service-likes">
            <FaMapMarkerAlt size={18} className='service-map-icon' />
            {service.location ? service.location.region : ''} - {service.location ? service.location.district : ''}
          </span> 
      
        </div>
      </div>
            <div className="add-new-service" onClick={handleNewServiceRedirect}>
            <FaPlus style={{ fontSize: '30px', color: '#333' }} />
            </div>
    </section>
  )
}

export default SingleService;
