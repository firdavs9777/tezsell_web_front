import React from 'react';
import './Modal.css'; // Make sure to create the corresponding CSS file

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Do not render modal if not open

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="close-modal" onClick={onClose}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default Modal;
