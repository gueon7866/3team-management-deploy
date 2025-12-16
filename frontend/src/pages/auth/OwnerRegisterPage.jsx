import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../../api/authApi";
import "./LoginPage.scss";

const OwnerRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessNumber: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.ownerRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        businessNumber: formData.businessNumber,
        phone: formData.phone,
      });

      // axiosClient 인터셉터에서 이미 response.data를 반환하므로
      // response 자체가 { success, message, data: { user, token } } 형태
      if (response?.success && response?.data) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        navigate("/owner/dashboard");
      } else {
        setError("회원가입에 실패했습니다.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "회원가입에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>사업자 회원가입</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>사업자 번호</label>
            <input
              type="text"
              name="businessNumber"
              value={formData.businessNumber}
              onChange={handleChange}
              placeholder="사업자 번호를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>연락처</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="연락처를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label>비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <div className="register-link">
            <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OwnerRegisterPage;

