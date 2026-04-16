import { Box, Typography, Button, Card, Chip } from "@mui/material";
import { ConsultationInfoTypes } from "../../../features/admin/clientInformation/clientInformationTypes";
// import { useParams } from "react-router-dom";
import { useMarkConsultationAsCompletedMutation } from "../../../features/admin/consultations/consultationApi";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { toast } from "react-toastify";

function parseDateString(dateTimeStr: string) {
  const [datePart] = dateTimeStr.split(" at ");

  const [month, dayWithComma, year] = datePart.split(" ");
  const day = dayWithComma.replace(",", "");

  return `${day} ${month} ${year}`;
}
function parseTimeString(dateTimeStr: string) {
  const [, timePart] = dateTimeStr.split(" at ");

  return `${timePart}`;
}

const Consultations = ({
  consultationInfo,
  onRefreshLead,
}: {
  consultationInfo: ConsultationInfoTypes;
  onRefreshLead: () => void;
}) => {
  // const {leadid} = useParams();
  const [markConsultationAsCompleted] =
    useMarkConsultationAsCompletedMutation();
  const consultationId = consultationInfo?.consultationId;

  const handleMarkComplete = async () => {
    try {
      await markConsultationAsCompleted(consultationId).unwrap();
      toast.success("Mark consultation as completed");
      onRefreshLead();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card
      sx={{
        mt:{xs:3,md:0},
        p: {xs:3,md:3},
        borderRadius: 4,
        bgcolor: "#FAF9F8",
        boxShadow: "none",
        maxWidth: {md:350},
        minWidth:{xs:280}
      }}
    >
      {/* Title & Status */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight="bold" fontSize={18}>
          Consultation
        </Typography>
        <Chip
          label={consultationInfo?.status}
          sx={{
            bgcolor:
              consultationInfo?.status === "COMPLETED" ? "#CAE6CB" : "#FFF9E6",
            color: "#3D3D3D",
            fontWeight: "thin",
            fontSize: 13,
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Date & Time */}
      <Box mt={2}>
        <Typography fontWeight="bold">Date</Typography>
        <Typography>
          {parseDateString(consultationInfo?.meetTime || "")}
        </Typography>
        <Typography fontWeight="bold" mt={1}>
          Time
        </Typography>
        <Typography>
          {parseTimeString(consultationInfo?.meetTime || "")}
        </Typography>
      </Box>

      {/* Buttons */}
      {consultationInfo?.status === "SCHEDULED" ? (
        <Box
          sx={{
            display: "block",
            gap: 2,
            alignItems: "center",
          }}
        >
         <Box
         sx={{
          display:"flex",
          gap:2,
          alignItems:"center"
         }}
         >
         <a href={consultationInfo?.joinUrl} target="_blank">
            <Button
              sx={{
                bgcolor: "#F6C328",
                color: "black",
                borderRadius: "15px",
                mt: 3,
                px: 1.3,
                py: 1,
                textTransform: "none",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#E5B120" },
              }}
            >
              Join Consultation
            </Button>
          </a>
          <a href={consultationInfo?.rescheduleUrl || ""} target="_blank">
            <Button
              variant="outlined"
              sx={{
                mt: 3,
                px: 3,
                py: 1,
                textTransform: "none",
                borderColor: "black",
                borderRadius: "15px",
                color: "black",
              }}
            >
              Reschedule
            </Button>
          </a>
         </Box>
          <Button
            fullWidth
            onClick={handleMarkComplete}
            sx={{
              bgcolor: "#E0E0E0",
              color: "black",
              borderRadius: "15px",
              mt: 3,
              px: 1.3,
              py: 1,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#D5D5D5" },
            }}
          >
            Mark Complete
          </Button>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" mt={2}>
          <CheckCircleOutlineIcon sx={{ color: "green", mr: 1 }} />
          <Typography fontWeight="bold">Consultation Completed</Typography>
        </Box>
      )}
    </Card>
  );
};

export default Consultations;
