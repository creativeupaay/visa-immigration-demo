import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import logoMark from "../assets/logomark.png";
import { useLogoutMutation } from "../features/auth/authApi";

export type TAB = {
  label: string;
  route: string;
  icon: string;
  children?: TAB[];
  suffix?: string;
  isPermitted?: boolean;
};

const SidebarTab = ({
  tabInfo,
  isActive,
  setSidebarOpen,
}: {
  tabInfo: TAB;
  isActive: boolean | undefined;
  setSidebarOpen: any;
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = tabInfo.children && tabInfo.children.length > 0;

  return (
    <div className="w-full">
      <div
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          } else {
            navigate("/" + tabInfo.route);
            setSidebarOpen(false);
          }
        }}
        className={`w-full flex items-center justify-between cursor-pointer hover:text-golden-yellow-400 ${
          isActive ? "text-golden-yellow-400" : "text-neutrals-400"
        } `}
      >
        <div className="flex items-center space-x-4">
          <Icon icon={tabInfo.icon} width="20" height="20" />
          <p className="text-sm">{tabInfo.label}</p>
        </div>

        {hasChildren ? (
          <Icon
            icon={
              isOpen
                ? "material-symbols-light:expand-less"
                : "material-symbols-light:chevron-right-rounded"
            }
            width="34"
            height="34"
          />
        ) : (
          <Icon
            icon="material-symbols-light:chevron-right-rounded"
            width="34"
            height="34"
          />
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ml-6 mt-2 space-y-2">
          {tabInfo.children!.map((child, index) => {
            const isChildActive = window.location.pathname.includes(
              child.route
            );

            return (
              <div
                key={index}
                onClick={() => {
                  navigate("/" + child.route);
                  setSidebarOpen(false);
                }}
                className={`cursor-pointer flex items-center space-x-4 hover:text-golden-yellow-400 ${
                  isChildActive ? "text-golden-yellow-400" : "text-neutrals-400"
                }`}
              >
                <Icon icon={child.icon} width="18" height="18" />
                <p className="text-sm">
                  {child.label} {child.suffix ?? ""}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ tabs }: { tabs: TAB[] }) => {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const location = useLocation();
  const [logout] = useLogoutMutation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(undefined).unwrap();
      setShowLogoutDialog(false);
      // window.location.reload();
      // navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean); // removes empty strings from splitting
    const basePath = segments.slice(0, 2).join("/"); // ["admin", "leadmanagement"] => "admin/leadmanagement"
    setCurrentTab(basePath);
    // console.log(currentTab)
  }, [location.pathname]);

  return (
    <>
      {/* Hamburger Button (only mobile) */}
      <div className="lg:hidden p-3">
        <button onClick={() => setSidebarOpen(true)}>
          <Icon
            icon="mdi:menu"
            width="30"
            height="30"
            className="text-[#282827]"
          />
        </button>
      </div>

      {/* Dark Background Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[310px] bg-neutrals-950 z-50 transform overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto`}
      >
        <div className="w-full h-full bg-neutrals-950 py-7 px-3 flex flex-col flex-1">
          {/* Logo */}
          <div className="w-full h-full flex justify-center flex-[0.1]">
            <img
              src={logoMark}
              alt="E360 logo"
              className="w-[73px] object-contain"
            />
          </div>

          {/* Sidebar Tabs */}
          <div className="w-full flex flex-col h-full flex-[0.9] justify-between">
            <div className="w-full space-y-5 mt-10">
              {tabs.map((tab, index) => {
                if (!tab.isPermitted) return;
                return (
                  <SidebarTab
                    key={index}
                    tabInfo={tab}
                    isActive={
                      currentTab === tab.route ||
                      tab.children?.some((child) => currentTab === child.route)
                    }
                    setSidebarOpen={setSidebarOpen}
                  />
                );
              })}
            </div>

            {/* Logout */}
            <div className="w-full mt-5">
              <div
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-between text-red-500 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <Icon
                    icon="icon-park-outline:logout"
                    width="20"
                    height="20"
                  />
                  <p className="text-sm">Logout</p>
                </div>
                <Icon
                  icon="material-symbols-light:chevron-right-rounded"
                  width="34"
                  height="34"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={showLogoutDialog}
        onClose={handleCancelLogout}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to login again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" variant="contained" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Sidebar;
