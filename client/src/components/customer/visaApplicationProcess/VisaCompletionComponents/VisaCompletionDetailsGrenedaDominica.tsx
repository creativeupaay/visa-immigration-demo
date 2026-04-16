import {
  Box,
  Typography,
  Container,
  Paper,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import { useFetchDeliveryDetailsQuery } from "../../../../features/common/commonApi";
import DGDeliveryForm from "../DGDeliveryForm/DGDeliveryForm";
import ProcessComponent from "../ProcessComponent";

const VisaCompletionDetailsGrenadaDominica = ({
  stepStatusId,
  stepData
}: {
  stepStatusId: string;
  stepData: any;
}) => {
  const { data, isLoading, isError, refetch } = useFetchDeliveryDetailsQuery({
    stepStatusId,
  });

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !data?.data) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6" color="error">
          Failed to load shipping details.
        </Typography>
      </Container>
    );
  }

  if (!data.data.delivery && !data.data.shipping) {
    return <DGDeliveryForm stepStatusId={stepStatusId} refetch={refetch} />;
  }

  if (data.data.delivery && !data.data.shipping) {
    return <ProcessComponent label="Processing" date="" status="" message={stepData.inProgressMessage} />;
  }

  const deliveryDetails = data.data.delivery;
  const shippingDetails = data.data.shipping;
  const supportInfo = shippingDetails.supportInfo || {};

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            fontSize: {
              xs: "18px",
              sm: "20px",
              md: "24px",
            },
          }}
        >
          Your Passport is on the Way! 🚀
        </Typography>
        {/* <Button
          variant="outlined"
          sx={{ borderRadius: "20px", textTransform: "none" }}
        >
          View Provided Documents
        </Button> */}
      </Box>

      {/* Main Content Card */}
      <Paper elevation={0} sx={{ bgcolor: "#F7F5F4", p: 4, borderRadius: 4 }}>
        <Stack spacing={4}>
          {/* Delivery Address Section */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "1rem", 
                  md: "1.25rem",
                },
              }}
            >
              Delivery Address
            </Typography>

            <Typography
              variant="body2"
              mb={1}
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  md: "1rem",
                },
              }}
            >
              <strong>Recipient Name:</strong>{" "}
              {deliveryDetails.fullName ?? "N/A"}
            </Typography>

            <Typography
              variant="body2"
              mb={1}
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  md: "1rem",
                },
              }}
            >
              <strong>Delivery Address:</strong>{" "}
              {deliveryDetails.address ?? "N/A"}
            </Typography>

            <Typography
              variant="body2"
              mb={1}
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  md: "1rem",
                },
              }}
            >
              <strong>Contact Number:</strong>{" "}
              {deliveryDetails.phoneNo ?? "N/A"}
            </Typography>
            {/* <Typography variant="body2">
              <strong>Estimated Delivery Date:</strong> {deliveryDetails.estimatedDeliveryDate ?? "N/A"}
            </Typography> */}
          </Box>

          {/* Shipping Provider Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom
            sx={{
              fontSize: {
                xs: "1rem", 
                md: "1.25rem",
              },
            }}
            >
              Shipping Provider & Tracking Info
            </Typography>
            <Typography variant="body2" mb={1}
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
            >
              <strong>Courier Service:</strong>{" "}
              {shippingDetails.courierService || "N/A"}
            </Typography>
            <Typography variant="body2" mb={1}
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
            >
              <strong>Tracking Number:</strong>{" "}
              {shippingDetails.trackingNo || "N/A"}
            </Typography>
            <Typography variant="body2"
            sx={{
              fontSize: {
                xs: "0.8rem",
                md: "1rem",
              },
            }}
            >
              <strong>Tracking URL:</strong>{" "}
              <Link
                href={shippingDetails.trackingUrl}
                target="_blank"
                rel="noopener"
                underline="hover"
              >
                {shippingDetails.trackingUrl}
              </Link>
            </Typography>
          </Box>

          {/* Additional Support Section */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom
            sx={{
              fontSize: {
                xs: "1rem",
                md: "1.25rem",
              },
            }}
            >
              Additional Support
            </Typography>
            <Typography variant="body2" mb={1}
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
            >
              Need help with delivery? Contact our team.
            </Typography>
            <Typography variant="body2" mb={1}
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
            >
              <strong>Email:</strong> {supportInfo.email || "N/A"}
            </Typography>
            <Typography variant="body2"
            sx={{
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
            }}
            >
              <strong>Phone Number:</strong> {supportInfo.phoneNo || "N/A"}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default VisaCompletionDetailsGrenadaDominica;
