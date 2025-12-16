import { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import "./OwnerMyProfilePage.scss";

const OwnerMyProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await userApi.updateMe(formData);
      await refreshUser();
      alert("프로필이 업데이트되었습니다.");
    } catch (err) {
      setError(err.response?.data?.message || "업데이트에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await userApi.changePassword({
        currentPassword,
        newPassword,
      });
      alert("비밀번호가 변경되었습니다.");
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="owner-my-profile-page">
      <h1>내 정보</h1>

      <div className="profile-section">
        <h2>기본 정보</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input type="email" value={user?.email || ""} disabled />
          </div>

          <div className="form-group">
            <label>사업자 번호</label>
            <input type="text" value={user?.businessNumber || ""} disabled />
          </div>

          <div className="form-group">
            <label>연락처</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </form>
      </div>

      <div className="password-section">
        <h2>비밀번호 변경</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>현재 비밀번호</label>
            <input type="password" name="currentPassword" required />
          </div>

          <div className="form-group">
            <label>새 비밀번호</label>
            <input type="password" name="newPassword" required />
          </div>

          <div className="form-group">
            <label>새 비밀번호 확인</label>
            <input type="password" name="confirmPassword" required />
          </div>

          <button type="submit" className="btn btn-primary">
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerMyProfilePage;

