// import { Icon } from "@iconify/react";
// import { useNavigate } from "react-router-dom";

const CustomerHeader = () => {
  // const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between text-neutrals-950 pb-10">
      <p className="hidden md:block font-bold  text-2xl">Welcome</p>

      <div className="relative">
        {/* Notification dot */}
        {/* <div className="w-3 h-3 rounded-full bg-golden-yellow-400 absolute right-0 -top-1"></div> */}
        {/* <Icon
          onClick={() => navigate("/notification")}
          className="cursor-pointer"
          icon={"icon-park-outline:remind"}
          width={"24px"}
          height={"24px"}
        /> */}
      </div>
    </div>
  );
};

export default CustomerHeader;
