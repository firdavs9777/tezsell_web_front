import React from 'react';
import './Pagination.css'
interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="pagination-section">
        <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="pagination-button"
      >
        « First
      </button>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-button"
      >
        « Previous
      </button>
      <div className="pagination-info">
        Page <span className="pagination-number">{currentPage}</span> of{" "}
        <span className="pagination-number">{totalPages}</span>
      </div>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-button"
      >
        Next »
      </button>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="pagination-button"
      >
        Last »
      </button>
    </div>
  );
};

export default Pagination;
