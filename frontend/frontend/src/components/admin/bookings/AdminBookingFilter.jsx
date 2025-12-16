import React from "react";

const AdminBookingFilter = ({ filters, onFilterChange, onSearch }) => {
  return (
    <div className="card filter-card">
      <div className="filter-row">
        <div className="form-group">
          <label>상태</label>
          <select
            value={filters.status || ""}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="">전체</option>
            <option value="pending">대기</option>
            <option value="confirmed">확정</option>
            <option value="cancelled">취소</option>
            <option value="completed">완료</option>
          </select>
        </div>
        <div className="form-group">
          <label>호텔 ID</label>
          <input
            type="text"
            placeholder="호텔 ObjectId"
            value={filters.hotelId || ""}
            onChange={(e) => onFilterChange({ hotelId: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>시작일</label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>종료일</label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" onClick={onSearch}>
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingFilter;