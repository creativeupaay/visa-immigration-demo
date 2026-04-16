// import { Icon } from "@iconify/react";
// import { InputAdornment, TextField } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import SearchIcon from '@mui/icons-material/Search';

const AdminHeader = () => {
  // const navigate = useNavigate();

  return (
    <div className="px-10 my-6 flex items-center justify-between text-neutrals-950">
      <div>
      {/* <TextField        
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      /> */}
      </div>
      <div className="relative">
        {/* Notification dot */}
        {/* <div className="w-3 h-3 rounded-full bg-golden-yellow-400 absolute right-0 -top-1">
        </div> */}
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

export default AdminHeader;
