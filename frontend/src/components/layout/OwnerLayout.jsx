import { Outlet } from "react-router-dom";
import OwnerHeader from "./OwnerHeader";
import OwnerSidebar from "./OwnerSidebar";
import "../../styles/index.scss";

const OwnerLayout = () => {
  return (
    <div className="admin-layout">
      <OwnerSidebar />
      <div className="admin-main">
        <OwnerHeader />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;

