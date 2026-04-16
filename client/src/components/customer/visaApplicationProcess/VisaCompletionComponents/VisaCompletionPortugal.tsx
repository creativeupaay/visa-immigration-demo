import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import LoadingGif from "../../../../assets/customer/Rightt.gif";

const VisaCompletionPortugal = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center mt-24">
        <div className="rounded-full border-[20px] border-golden-yellow-50 w-fit">
          <div className="rounded-full border-[15px] border-[#FEFCEA]">
            <div className="text-neutrals-50 bg-[#FAE081] p-8 rounded-full">
              <img className="w-[50px] h-[50px]" src={LoadingGif} />
            </div>
          </div>
        </div>

        <p className="mt-4 text-lg">
          Congratulations! Your D7 visa has been approved.
        </p>
        <p className="mt-4 text-lg">
          {" "}
          Download your visa and check the next steps below.
        </p>

        {/* Continue Button */}
        <Button
          variant="outlined"
          sx={{
            borderColor: "black",
            my: 5,
            color: "black",
            borderRadius: "15px",
            textTransform: "none",
            px: 6,
            py: 1,
          }}
        >
          Download VISA PDF
        </Button>
      </div>
      <Box
        sx={{
          backgroundColor: "#f9f8f8",
          borderRadius: "20px",
          padding: "24px",
          width: "80vw",
          maxWidth: 512,
          boxSizing: "border-box",
        }}
      >
        <Typography sx={{ fontSize: 14, color: "#333", mb: 1 }}>
          Here’s what to do next:
        </Typography>
        <List dense disablePadding>
          <ListItem sx={{ pl: 1, py: 0.5 }}>
            <ListItemText
              primary="Plan your travel to Portugal."
              primaryTypographyProps={{ fontSize: 14, color: "#444" }}
            />
          </ListItem>
          <ListItem sx={{ pl: 1, py: 0.5 }}>
            <ListItemText
              primary="SEF appointment booking for residency card."
              primaryTypographyProps={{ fontSize: 14, color: "#444" }}
            />
          </ListItem>
          <ListItem sx={{ pl: 1, py: 0.5 }}>
            <ListItemText
              primary="Residency card processing & compliance."
              primaryTypographyProps={{ fontSize: 14, color: "#444" }}
            />
          </ListItem>
        </List>
      </Box>
    </>
  );
};

export default VisaCompletionPortugal;
