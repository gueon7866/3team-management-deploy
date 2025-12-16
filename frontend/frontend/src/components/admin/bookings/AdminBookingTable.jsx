import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../common/StatusBadge";

const AdminBookingTable = ({ bookings, onStatusChange, onCancel }) => {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="card">
        <div style={{ padding: "24px", textAlign: "center" }}>예약이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <table>
        <thead>
          <tr>
            <th>예약ID</th>
            <th>호텔</th>
            <th>고객</th>
            <th>체크인</th>
            <th>체크아웃</th>
            <th>금액</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id || booking._id || booking.reservationId}>
              <td>{booking.id || booking.reservationId}</td>
              <td>{booking.hotelId?.name || "-"}</td>
              <td>
                {booking.userId?.name || "-"}
                <div className="sub-info">{booking.userId?.email}</div>
              </td>
              <td>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "-"}</td>
              <td>
                {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "-"}
              </td>
              <td>{booking.totalPrice?.toLocaleString()}원</td>
              <td>
                <StatusBadge status={booking.status} />
              </td>
              <td>
                <div className="table-actions">
                  <Link
                    to={`/admin/bookings/${booking.id || booking.reservationId || booking._id}`}
                    state={{ booking }}
                    className="btn btn-outline"
                  >
                    상세
                  </Link>
                  {booking.status === "pending" && (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={() =>
                          onStatusChange(booking.id || booking._id, "confirmed")
                        }
                      >
                        확정
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => onCancel(booking.id || booking._id)}
                      >
                        취소
                      </button>
                    </>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        onStatusChange(booking.id || booking._id, "completed")
                      }
                    >
                      완료
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookingTable;