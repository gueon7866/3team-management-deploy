import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import hotelApi from "../../api/hotelApi";
import roomApi from "../../api/roomApi";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import "./OwnerHotelDetailPage.scss";

const OwnerHotelDetailPage = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    inventory: "",
  });

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const hotelsResponse = await hotelApi.getMyHotels();
      const hotelData = hotelsResponse.data || hotelsResponse; // successResponse(data) 구조 대응
      const foundHotel = hotelData.items?.find(
        (h) => (h.id || h._id)?.toString() === hotelId
      );
      setHotel(foundHotel || null);

      if (foundHotel) {
        const roomsResponse = await roomApi.getRoomsByHotel(hotelId);
        const roomsData = roomsResponse.data || roomsResponse;
        setRooms(roomsData || []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await roomApi.createRoom(hotelId, {
        ...roomFormData,
        price: Number(roomFormData.price),
        capacity: Number(roomFormData.capacity),
        inventory: Number(roomFormData.inventory),
      });
      alert("객실이 등록되었습니다.");
      setShowRoomForm(false);
      setRoomFormData({ name: "", type: "", price: "", capacity: "", inventory: "" });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "객실 등록에 실패했습니다.");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("이 객실을 삭제하시겠습니까?")) return;

    try {
      await roomApi.deleteRoom(roomId);
      alert("객실이 삭제되었습니다.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;
  if (!hotel) return <div>호텔을 찾을 수 없습니다.</div>;

  return (
    <div className="owner-hotel-detail-page">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          뒤로
        </button>
        <h1>{hotel.name}</h1>
      </div>

      <div className="hotel-info">
        <div className="info-item">
          <label>도시:</label>
          <span>{hotel.city}</span>
        </div>
        <div className="info-item">
          <label>주소:</label>
          <span>{hotel.address || "-"}</span>
        </div>
        <div className="info-item">
          <label>상태:</label>
          <StatusBadge status={hotel.status} />
        </div>
      </div>

      <div className="rooms-section">
        <div className="section-header">
          <h2>객실 관리</h2>
          <button className="btn btn-primary" onClick={() => setShowRoomForm(true)}>
            객실 추가
          </button>
        </div>

        {showRoomForm && (
          <div className="room-form">
            <h3>객실 등록</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>객실명</label>
                <input
                  type="text"
                  value={roomFormData.name}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>타입</label>
                <input
                  type="text"
                  value={roomFormData.type}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, type: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>가격 (원)</label>
                <input
                  type="number"
                  value={roomFormData.price}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>수용 인원</label>
                <input
                  type="number"
                  value={roomFormData.capacity}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, capacity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>재고</label>
                <input
                  type="number"
                  value={roomFormData.inventory}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, inventory: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRoomForm(false)}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rooms-table">
          <table>
            <thead>
              <tr>
                <th>객실명</th>
                <th>타입</th>
                <th>가격</th>
                <th>수용 인원</th>
                <th>재고</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                    객실이 없습니다.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id || room._id}>
                    <td>{room.name}</td>
                    <td>{room.type}</td>
                    <td>{room.price?.toLocaleString()}원</td>
                    <td>{room.capacity}명</td>
                    <td>{room.inventory}개</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteRoom(room.id || room._id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerHotelDetailPage;

