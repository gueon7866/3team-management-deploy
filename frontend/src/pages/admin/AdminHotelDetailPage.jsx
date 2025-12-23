import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminHotelApi } from "../../api/adminHotelApi";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminHotelDetailPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const hotelData = await adminHotelApi.getHotelById(hotelId);
      setHotel(hotelData);

      // 객실 목록 조회
      try {
        const roomsResponse = await adminHotelApi.getRoomsByHotel(hotelId);
        // axiosClient 인터셉터가 response.data를 반환하므로,
        // roomsResponse는 { success, message, data } 구조일 수 있음
        const roomsData = roomsResponse?.data || roomsResponse;
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (roomErr) {
        console.error("객실 목록 로드 실패 - 상세:", roomErr);
        console.error("에러 응답:", roomErr.response);
        console.error("에러 메시지:", roomErr.message);
        // 에러가 발생해도 빈 배열로 설정하여 페이지는 정상 표시
        setRooms([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "호텔 정보를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("이 호텔을 승인하시겠습니까?")) return;
    try {
      await adminHotelApi.approveHotel(hotelId);
      alert("호텔이 승인되었습니다.");
      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "승인에 실패했습니다."
      );
    }
  };

  const handleReject = async () => {
    if (!window.confirm("이 호텔을 거절하시겠습니까?")) return;
    try {
      await adminHotelApi.rejectHotel(hotelId);
      alert("호텔이 거절되었습니다.");
      loadData();
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "거절에 실패했습니다."
      );
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;
  if (!hotel)
    return (
      <ErrorMessage message="호텔을 찾을 수 없습니다." onRetry={loadData} />
    );

  return (
    <div className="admin-hotel-detail-page" style={{ padding: "30px" }}>
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          뒤로
        </button>
        <h1 style={{ margin: 0 }}>{hotel.name}</h1>
      </div>

      {hotel.images && hotel.images.length > 0 && (
        <div
          className="hotel-images-gallery"
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0" }}>호텔 이미지</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {hotel.images.map((imageUrl, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "75%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${hotel.name} 이미지 ${index + 1}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="hotel-info"
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <label style={{ fontWeight: 600, minWidth: "120px" }}>호텔명:</label>
          <span>{hotel.name}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <label style={{ fontWeight: 600, minWidth: "120px" }}>도시:</label>
          <span>{hotel.city}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <label style={{ fontWeight: 600, minWidth: "120px" }}>주소:</label>
          <span>{hotel.address || "-"}</span>
        </div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <label style={{ fontWeight: 600, minWidth: "120px" }}>상태:</label>
          <StatusBadge status={hotel.status} />
        </div>
        {hotel.rating > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <label style={{ fontWeight: 600, minWidth: "120px" }}>평점:</label>
            <span>{hotel.rating}점</span>
          </div>
        )}
        {hotel.freebies && hotel.freebies.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <label style={{ fontWeight: 600, minWidth: "120px" }}>
              무료 혜택:
            </label>
            <span>{hotel.freebies.join(", ")}</span>
          </div>
        )}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <label style={{ fontWeight: 600, minWidth: "120px" }}>
              편의시설:
            </label>
            <span>{hotel.amenities.join(", ")}</span>
          </div>
        )}
        {hotel.owner && (
          <>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <label style={{ fontWeight: 600, minWidth: "120px" }}>
                사업자명:
              </label>
              <span>{hotel.owner?.name || "-"}</span>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <label style={{ fontWeight: 600, minWidth: "120px" }}>
                사업자번호:
              </label>
              <span>{hotel.owner?.businessNumber || "-"}</span>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <label style={{ fontWeight: 600, minWidth: "120px" }}>
                이메일:
              </label>
              <span>{hotel.owner?.email || "-"}</span>
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <label style={{ fontWeight: 600, minWidth: "120px" }}>등록일:</label>
          <span>{new Date(hotel.createdAt).toLocaleString()}</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/admin/hotels/${hotelId}/edit`)}
          >
            수정
          </button>
          {hotel.status === "pending" && (
            <>
              <button className="btn btn-success" onClick={handleApprove}>
                승인
              </button>
              <button className="btn btn-danger" onClick={handleReject}>
                거절
              </button>
            </>
          )}
          {hotel.status === "approved" && (
            <button className="btn btn-danger" onClick={handleReject}>
              거절
            </button>
          )}
          {hotel.status === "rejected" && (
            <button className="btn btn-success" onClick={handleApprove}>
              승인
            </button>
          )}
        </div>
      </div>

      <div
        className="rooms-section"
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0" }}>객실 목록</h2>
        {rooms.length === 0 ? (
          <div>
            <p style={{ marginBottom: "10px" }}>등록된 객실이 없습니다.</p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              사업자가 객실을 생성했지만 표시되지 않는 경우, 브라우저 콘솔을
              확인해주세요.
            </p>
          </div>
        ) : (
          <div className="rooms-table">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    이미지
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    객실명
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    타입
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    가격
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    수용 인원
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: 600,
                      background: "#f5f5f5",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    재고
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id || room._id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "12px" }}>
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          style={{
                            width: "80px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "60px",
                            background: "#f0f0f0",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            color: "#999",
                          }}
                        >
                          이미지 없음
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>{room.name}</td>
                    <td style={{ padding: "12px" }}>{room.type}</td>
                    <td style={{ padding: "12px" }}>
                      {room.price?.toLocaleString()}원
                    </td>
                    <td style={{ padding: "12px" }}>{room.capacity}명</td>
                    <td style={{ padding: "12px" }}>{room.inventory}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHotelDetailPage;