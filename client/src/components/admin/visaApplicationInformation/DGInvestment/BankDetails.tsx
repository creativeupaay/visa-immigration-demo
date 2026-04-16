import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { keyToName } from "../../../../utils/keyToName";

const BankDetails = ({
  bankDetails,
  uploadInvoice,
}: {
  bankDetails: any;
  uploadInvoice: () => void;
}) => {
  const getFundName = (visaType: string) => {
    if (visaType === "DOMINICA") {
      return (
        <>
          Dominica <b>Economic Diversification Fund (EDF) Donation</b>
        </>
      );
    }
    if (visaType === "GRENADA") {
      return (
        <>
          Grenada <b>National Transformation Fund (NTF) Donation</b>
        </>
      );
    } else {
      return <></>;
    }
  };
  return (
    <Stack alignItems={"center"} py={8}>
         <Typography
          textAlign={"center"}
          variant="subtitle1"
          fontWeight="bold"
          mb={2}
        >
          Real Estate Investment Options
        </Typography>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 500,
          backgroundColor: "#f9f7f7",
          boxShadow: "none",
        }}
      >
        <Typography
          textAlign={"center"}
          variant="subtitle1"
          fontWeight="bold"
          mb={2}
        >
          Bank Account Details
        </Typography>

        {Object.entries(bankDetails)
          .filter((item) => !["_id", "visaTypeName"].includes(item[0]))
          .map((item: any, index: number) => (
            <Box
              key={index}
              mb={1}
              display="flex"
              justifyContent="space-between"
            >
              <Typography fontWeight="bold">{keyToName(item[0])}</Typography>
              <Typography>{item[1]}</Typography>
            </Box>
          ))}
      </Paper>

      <Typography mt={3} textAlign={"center"}>
        We have provided you with the necessary bank account details for your{" "}
        {getFundName(bankDetails?.visaTypeName)} investment. Kindly proceed with
        the payment at your earliest convenience to move forward with the
        process.
      </Typography>

      <Button
        onClick={uploadInvoice}
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
        Upload Payment Invoice
      </Button>
    </Stack>
  );
};

export default BankDetails;
