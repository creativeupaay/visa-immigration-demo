import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="h-screen flex flex-1">
      {/* Sidebar portion */}
      <div className="w-full h-full flex-[0.3]"></div>

      {/* Main content portion */}
      <div className="w-full h-full flex-[0.7]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
