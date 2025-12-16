import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./LoginPage.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    setLoading(true);

    try {
      const response = await login(formData);
      const userRole = response?.user?.role || response?.role;

      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "owner") {
        navigate("/owner/dashboard");
      } else {
        setError("접근 권한이 없습니다.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "로그인에 실패했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>로그인</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <div className="register-link">
            <Link to="/owner/register" className="btn btn-secondary">
              사업자 회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

