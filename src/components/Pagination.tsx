import '@components/Pagination.css';
import React from 'react';
import { useTranslation } from 'react-i18next';
interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);
   const { t } = useTranslation();

  return (
    <div className="pagination-section">
        <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        className="pagination-button"
      >
        « {t('pagination_first')}
      </button>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="pagination-button"
      >
        « {t('pagination_previous')}
      </button>
      <div className="pagination-info">
        {t('page_info')} <span className="pagination-number">{currentPage}</span> of{" "}
        <span className="pagination-number">{totalPages}</span>
      </div>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="pagination-button"
      >
        {t('page_next')} »
      </button>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        className="pagination-button"
      >
        {t('page_last')} »
      </button>
    </div>
  );
};

export default Pagination;
