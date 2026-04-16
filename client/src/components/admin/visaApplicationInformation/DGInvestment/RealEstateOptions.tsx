import { Button, Paper, Stack, Typography } from "@mui/material";

const RealEstateOptions = ({
  realEstateOptions,
  uploadInvoice,
}: {
  realEstateOptions: any;
  uploadInvoice: () => void;
}) => {
  return (
    <Stack alignItems={"center"} py={8}>
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
        {realEstateOptions?.map((item: any, index: number) => (
          <Stack direction={"row"} gap={"6px"}>
            <Typography>{index + 1}. </Typography>
            <Typography key={index}>{item}</Typography>
          </Stack>
        ))}
      </Paper>

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
        onClick={uploadInvoice}
      >
        Upload Invoice
      </Button>
    </Stack>
  );
};

export default RealEstateOptions;
