const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-icon">⚠️</div>
      <p>{message || "오류가 발생했습니다."}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          다시 시도
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
