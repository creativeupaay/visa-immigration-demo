import { Button } from "@mui/material";
import LoadingGif from "../../../../assets/customer/Rightt.gif"

const MedicalApproved = ({onContinue}:{onContinue:()=> void}) => {
    return (
        <div className="flex flex-col items-center justify-center text-center mt-24">
          {/* Verified Icon Container */}
          <div className="rounded-full border-[20px] border-golden-yellow-50 w-fit">
            <div className="rounded-full border-[15px] border-[#FEFCEA]">
              <div className="text-neutrals-50 bg-[#FAE081] p-8 rounded-full">
              <img
              src={LoadingGif}
              />
              </div>
            </div>
          </div>
    
          {/* Verified Message */}
          <p className="mt-4 text-lg">Medical Test Completed.</p>
          <p className="mt-2 text-lg"><span className="font-bold">Download Medical Certificate</span>, we will proceed with your visa application.</p>
    
        <div>
            <Button
            variant="contained"
           sx={{
            py: 1,
            px: 4,
            minWidth: 270,
            bgcolor: "#F6C328",
            textTransform: "none",
            borderRadius: "15px",
            color:"black"
          }}
          >
            Download Medical Certificate
          </Button>
         
         {/* Continue Button */}
          <Button
          onClick={onContinue}
            variant="outlined"
            sx={{
              borderColor:"black", 
              my: 5,
              color:"black",
              borderRadius:"15px",
              textTransform:"none",
              px:6,
              py:1
             }}
          >
            Continue
          </Button>

        </div>
          
        </div>
      );
}

export default MedicalApproved