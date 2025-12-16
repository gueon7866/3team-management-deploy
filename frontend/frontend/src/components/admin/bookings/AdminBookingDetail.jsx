import React from "react";
import StatusBadge from "../../common/StatusBadge";

const AdminBookingDetail = ({ booking }) => {
  if (!booking) {
    return <div className="card">예약 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="card detail-card">
      <div className="detail-row">
        <span className="label">예약 ID</span>
        <span>{booking.id || booking.reservationId}</span>
      </div>
      <div className="detail-row">
        <span className="label">호텔</span>
        <span>{booking.hotelId?.name}</span>
      </div>
      <div className="detail-row">
        <span className="label">객실</span>
        <span>{booking.roomId?.roomNumber || booking.roomId?.name || "-"}</span>
      </div>
      <div className="detail-row">
        <span className="label">고객</span>
        <span>
          {booking.userId?.name} ({booking.userId?.email})
        </span>
      </div>
      <div className="detail-row">
        <span className="label">체크인</span>
        <span>{booking.checkIn ? new Date(booking.checkIn).toLocaleString() : "-"}</span>
      </div>
      <div className="detail-row">
        <span className="label">체크아웃</span>
        <span>
          {booking.checkOut ? new Date(booking.checkOut).toLocaleString() : "-"}
        </span>
      </div>
      <div className="detail-row">
        <span className="label">인원</span>
        <span>{booking.guests}명</span>
      </div>
      <div className="detail-row">
        <span className="label">총 금액</span>
        <span>{booking.totalPrice?.toLocaleString()}원</span>
      </div>
      <div className="detail-row">
        <span className="label">상태</span>
        <StatusBadge status={booking.status} />
      </div>
      <div className="detail-row">
        <span className="label">생성일</span>
        <span>{new Date(booking.createdAt).toLocaleString()}</span>
      </div>
      <div className="detail-row">
        <span className="label">수정일</span>
        <span>{new Date(booking.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
};

export default AdminBookingDetail;