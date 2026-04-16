import { Outlet } from "react-router-dom";
import Sidebar, { TAB } from "../../components/Sidebar";
import CustomerHeader from "../../components/CustomerHeader";

const tabs: TAB[] = [
  {
    icon: "icon-park-outline:dashboard",
    label: "Dashboard",
    route: "dashboard",
    isPermitted:true
  },
  // {
  //   icon: "icon-park-outline:folder-block-one",
  //   label: "Previous Applications",
  //   route: "applications",
  // },
  // {
  //   icon: "icon-park-outline:remind",
  //   label: "Notification",
  //   route: "notification",
  // },
  // {
  //   icon: "icon-park-outline:setting",
  //   label: "Settings",
  //   route: "settings",
  // },
];

const CustomerLayout = () => {

  return (
    <div className="h-screen flex flex-1 overflow-hidden">
      {/* Sidebar portion */}
      <div className="w-full md:h-full flex-[0.2]">
        <Sidebar tabs={tabs} />
      </div>

      {/* Main content portion */}
      <div className="w-full h-full md:flex-[0.8] flex flex-col pt-7">
        {/* T5op header portion */}
        <div className="w-full h-full flex-[0.08] md:px-5">
          <CustomerHeader />
        </div>

        <div className="md:w-full h-full md:flex-[0.92] overflow-y-scroll overflow-x-hidden ml-[-60px] md:ml-[0px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
