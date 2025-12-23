import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminHotelApi } from "../../api/adminHotelApi";
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
  const [editingRoom, setEditingRoom] = useState(null); // 수정 중인 객실
  const [roomFormData, setRoomFormData] = useState({
    name: "",
    type: "",
    price: "",
    capacity: "",
    inventory: "",
    amenities: [],
  });
  const [roomImages, setRoomImages] = useState([]);
  const [roomImagePreviews, setRoomImagePreviews] = useState([]);
  const [existingRoomImages, setExistingRoomImages] = useState([]); // 기존 이미지 URL

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // admin API를 사용 (백엔드에서 owner도 접근 가능하도록 수정됨)
      const hotelData = await adminHotelApi.getHotelById(hotelId);
      setHotel(hotelData);

      if (hotelData) {
        const roomsResponse = await roomApi.getRoomsByHotel(hotelId);
        const roomsData = roomsResponse.data || roomsResponse;
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } else {
        setRooms([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - roomImagePreviews.length;
    const newFiles = files.slice(0, remainingSlots);
    
    if (newFiles.length === 0) return;
    
    setRoomImages((prev) => [...prev, ...newFiles]);
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setRoomImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeRoomImagePreview = (index) => {
    const existingCount = existingRoomImages.length;
    
    if (index < existingCount) {
      // 기존 이미지 제거
      setExistingRoomImages((prev) => prev.filter((_, i) => i !== index));
      setRoomImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새 이미지 제거
      const newIndex = index - existingCount;
      const fileToRemove = roomImages[newIndex];
      if (fileToRemove && fileToRemove instanceof File) {
        URL.revokeObjectURL(roomImagePreviews[index]);
      }
      setRoomImages((prev) => prev.filter((_, i) => i !== newIndex));
      setRoomImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name || "",
      type: room.type || "",
      price: room.price?.toString() || "",
      capacity: room.capacity?.toString() || "",
      inventory: room.inventory?.toString() || "",
      amenities: room.amenities || [],
    });
    const roomImages = room.images || [];
    setExistingRoomImages(roomImages);
    setRoomImagePreviews(roomImages);
    setRoomImages([]);
    setShowRoomForm(true);
  };

  const resetRoomForm = () => {
    setEditingRoom(null);
    setRoomFormData({ name: "", type: "", price: "", capacity: "", inventory: "", amenities: [] });
    setRoomImages([]);
    setRoomImagePreviews([]);
    setExistingRoomImages([]);
    setShowRoomForm(false);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append("name", roomFormData.name);
      submitData.append("type", roomFormData.type);
      submitData.append("price", roomFormData.price.toString());
      submitData.append("capacity", roomFormData.capacity.toString());
      submitData.append("inventory", roomFormData.inventory.toString());

      if (roomFormData.amenities && roomFormData.amenities.length > 0) {
        roomFormData.amenities.forEach((amenity) => {
          submitData.append("amenities", amenity);
        });
      }

      roomImages.forEach((image) => {
        submitData.append("images", image);
      });

      await roomApi.createRoom(hotelId, submitData);
      alert("객실이 등록되었습니다.");
      resetRoomForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "객실 등록에 실패했습니다.");
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;

    try {
      const submitData = new FormData();
      submitData.append("name", roomFormData.name);
      submitData.append("type", roomFormData.type);
      submitData.append("price", roomFormData.price.toString());
      submitData.append("capacity", roomFormData.capacity.toString());
      submitData.append("inventory", roomFormData.inventory.toString());

      if (roomFormData.amenities && roomFormData.amenities.length > 0) {
        roomFormData.amenities.forEach((amenity) => {
          submitData.append("amenities", amenity);
        });
      }

      // 기존 이미지 URL 추가
      existingRoomImages.forEach((imageUrl) => {
        submitData.append("images", imageUrl);
      });

      // 새로 업로드할 이미지 파일 추가
      roomImages.forEach((image) => {
        submitData.append("images", image);
      });

      await roomApi.updateRoom(editingRoom.id || editingRoom._id, submitData);
      alert("객실이 수정되었습니다.");
      resetRoomForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "객실 수정에 실패했습니다.");
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
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/owner/hotels/${hotelId}/edit`)}
        >
          호텔 수정
        </button>
      </div>

      {hotel.images && hotel.images.length > 0 && (
        <div className="hotel-images-gallery">
          <h2>호텔 이미지</h2>
          <div className="image-gallery">
            {hotel.images.map((imageUrl, index) => (
              <div key={index} className="gallery-item">
                <img 
                  src={imageUrl} 
                  alt={`${hotel.name} 이미지 ${index + 1}`}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
        {hotel.rating > 0 && (
          <div className="info-item">
            <label>평점:</label>
            <span>{hotel.rating}점</span>
          </div>
        )}
        {hotel.freebies && hotel.freebies.length > 0 && (
          <div className="info-item">
            <label>무료 혜택:</label>
            <span>{hotel.freebies.join(", ")}</span>
          </div>
        )}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="info-item">
            <label>편의시설:</label>
            <span>{hotel.amenities.join(", ")}</span>
          </div>
        )}
      </div>

      <div className="rooms-section">
        <div className="section-header">
          <h2>객실 관리</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              resetRoomForm();
              setShowRoomForm(true);
            }}
          >
            객실 추가
          </button>
        </div>

        {showRoomForm && (
          <div className="room-form">
            <h3>{editingRoom ? "객실 수정" : "객실 등록"}</h3>
            <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom}>
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
              <div className="form-group">
                <label>편의시설 (입력 후 Enter)</label>
                <input
                  type="text"
                  placeholder="예: 와이파이, TV, 에어컨"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !roomFormData.amenities.includes(value)) {
                        setRoomFormData({
                          ...roomFormData,
                          amenities: [...roomFormData.amenities, value],
                        });
                        e.target.value = "";
                      }
                    }
                  }}
                />
                {roomFormData.amenities.length > 0 && (
                  <div className="amenities-list">
                    {roomFormData.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => {
                            setRoomFormData({
                              ...roomFormData,
                              amenities: roomFormData.amenities.filter((_, i) => i !== index),
                            });
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>이미지 (최대 10개)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleRoomImageChange}
                  disabled={roomImagePreviews.length >= 10}
                />
                {roomImagePreviews.length > 0 && (
                  <div className="image-preview-container">
                    {roomImagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeRoomImagePreview(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetRoomForm}
                >
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoom ? "수정" : "등록"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rooms-table">
          <table>
            <thead>
              <tr>
                <th>이미지</th>
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
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                    객실이 없습니다.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id || room._id}>
                    <td>
                      {room.images && room.images.length > 0 ? (
                        <img 
                          src={room.images[0]} 
                          alt={room.name}
                          className="room-thumbnail"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="room-thumbnail-placeholder">이미지 없음</div>
                      )}
                    </td>
                    <td>{room.name}</td>
                    <td>{room.type}</td>
                    <td>{room.price?.toLocaleString()}원</td>
                    <td>{room.capacity}명</td>
                    <td>{room.inventory}개</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditRoom(room)}
                        style={{ marginRight: "8px" }}
                      >
                        수정
                      </button>
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

