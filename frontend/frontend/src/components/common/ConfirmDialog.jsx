const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-outline">
            취소
          </button>
          <button onClick={onConfirm} className="btn btn-danger">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
