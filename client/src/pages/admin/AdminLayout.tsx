import { Outlet } from "react-router-dom";
import Sidebar, { TAB } from "../../components/Sidebar";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFetchUIPermissionsQuery } from "../../features/admin/adminUIPermissionApi";
import { setPermissions } from "../../features/admin/adminUIPermissionSlice";
// import AdminHeader from "../../components/AdminHeader";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store"; // Adjust path to your store


const useTabsWithPermissions = () => {
  const permissions = useSelector((state: RootState) => state.adminPermissions);

  const mappedTabs: TAB[] = [
    {
      icon: "icon-park-outline:dashboard",
      label: "Dashboard",
      route: "admin/dashboard",
      isPermitted: permissions.Read_Dashboard_Tab,
    },
    {
      icon: "iconoir:multiple-pages",
      label: "Applications",
      route: "admin/applications",
      isPermitted: permissions.Read_Application_Tab,
      children: [
        {
          label: "Dominica Passport",
          route: "admin/applications/dominica",
          icon: "",
        },
        {
          label: "Grenada Passport",
          route: "admin/applications/grenada",
          icon: "",
        },
        {
          label: "Portugal D7 Visa",
          route: "admin/applications/portugal",
          icon: "",
        },
        {
          label: "Dubai Residency",
          route: "admin/applications/dubai",
          icon: "",
        },
      ],
    },
    {
      icon: "solar:user-speak-bold",
      label: "Consultations",
      route: "admin/consultations",
      isPermitted: permissions.Read_Consultation_Tab,
    },
    {
      icon: "lsicon:user-crowd-outline",
      label: "Lead Management",
      route: "admin/leadmanagement",
      isPermitted: permissions.Read_LeadManagement_Tab,
    },
    {
      icon: "ic:sharp-payments",
      label: "Invoices Management",
      route: "admin/invoicesmanagement",
      isPermitted:true,
      // isPermitted: permissions.Read_LeadManagement_Tab,
    },
    {
      icon: "mingcute:idcard-fill",
      label: "Role and Permission",
      route: "admin/roleandpermission",
      isPermitted: permissions.Read_RoleAndPermission_Tab,
      children: [
        {
          label: "All Employee",
          route: "admin/roleandpermission/allemployee",
          icon: "",
        },
        {
          icon: "",
          label: "Manage Roles",
          route: "admin/roleandpermission/manageroles",
        },
      ],
    },
    {
      icon: "fa-solid:tasks",
      label: "Task Managment",
      route: "admin/taskmanagement",
      isPermitted: permissions.Read_TaskManagement_Tab,
    },
    {
      icon: "icon-park-outline:bank",
      label: "Manage Bank Details",
      route: "admin/bankdetails",
      isPermitted: permissions.Read_ManageBankDetails_Tab,
    },
    {
      icon: "meteor-icons:user",
      label: "My Clients",
      route: "admin/myclient",
      isPermitted: permissions.Read_MyClients_Tab,
    },
    {
      icon: "clarity:list-solid",
      label: "Logs",
      route: "admin/logs",
      isPermitted: true,
    },
    {
      icon: "ix:user-profile-filled",
      label: "Profile",
      route: "admin/profile",
      isPermitted: true,
    },
  ];

  return mappedTabs;
};


const AdminLayout = () => {

const dispatch = useDispatch();
  const { data, isSuccess } = useFetchUIPermissionsQuery(undefined);
  const tabs = useTabsWithPermissions(); 

  useEffect(() => {
    if (isSuccess && data?.permissions) {
      dispatch(setPermissions(data.permissions));
    }
  }, [isSuccess, data, dispatch]);


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-[20px] lg:w-[310px] shrink-0">
        <Sidebar tabs={tabs} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto relative mt-10 md:mt-4">
        {/* Sticky Header */}
        {/* <div className="sticky top-0 z-40 bg-white">
          <AdminHeader />
        </div> */}

        {/* Outlet content */}
        <div className="p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
