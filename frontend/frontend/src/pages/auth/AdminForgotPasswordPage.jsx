import { useState } from "react";
import adminAuthApi from "../../api/adminAuthApi";

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await adminAuthApi.forgotPassword(email);
      setMessage("비밀번호 재설정 이메일이 전송되었습니다.");
    } catch (err) {
      setError(err.message || "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>비밀번호 찾기</h2>
        <form onSubmit={handleSubmit}>
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "전송 중..." : "비밀번호 재설정 메일 전송"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminForgotPasswordPage;
