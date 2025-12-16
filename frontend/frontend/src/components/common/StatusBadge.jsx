const StatusBadge = ({ status }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { label: "대기 중", className: "status-pending" };
      case "approved":
        return { label: "승인됨", className: "status-approved" };
      case "rejected":
        return { label: "거절됨", className: "status-rejected" };
      case "active":
        return { label: "활성", className: "status-active" };
      case "inactive":
        return { label: "비활성", className: "status-inactive" };
      case "confirmed":
        return { label: "확정", className: "status-confirmed" };
      case "cancelled":
        return { label: "취소됨", className: "status-cancelled" };
      case "completed":
        return { label: "완료", className: "status-completed" };
      default:
        return { label: status, className: "status-default" };
    }
  };

  const { label, className } = getStatusInfo(status);

  return <span className={`status-badge ${className}`}>{label}</span>;
};

export default StatusBadge;
