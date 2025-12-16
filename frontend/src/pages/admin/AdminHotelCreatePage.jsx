import { useNavigate } from "react-router-dom";
import AdminHotelForm from "../../components/admin/hotels/AdminHotelForm";
import { adminHotelApi } from "../../api/adminHotelApi";

const AdminHotelCreatePage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await adminHotelApi.createHotel(formData);
      alert("호텔이 등록되었습니다.");
      navigate("/admin/hotels");
    } catch (err) {
      alert(err.message || "등록에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    navigate("/admin/hotels");
  };

  return (
    <div className="admin-hotel-create-page">
      <div className="page-header">
        <h1>호텔 등록</h1>
      </div>

      <AdminHotelForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
};

export default AdminHotelCreatePage;
