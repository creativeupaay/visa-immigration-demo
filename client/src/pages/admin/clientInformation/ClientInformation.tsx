import {
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Button,
  Tooltip,
} from "@mui/material";
import ClientConsultation from "./ClientConsultation";
import { useParams } from "react-router-dom";
import { useFetchParticularLeadQuery } from "../../../features/admin/leadManagement/leadManagementApi";
import { useEffect, useState } from "react";
import {
  ClientInfoType,
  leadStatus,
} from "../../../features/admin/leadManagement/leadManagementTypes";
import AddNewTaskDrawer from "../../../features/admin/taskManagement/components/AddNewTaskDrawer";

const ClientInformation = () => {
  const { leadid } = useParams();
  const { data, isLoading, isError, refetch } =
    useFetchParticularLeadQuery(leadid);
  const [clientInfo, setClientInfo] = useState<ClientInfoType>();
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);

  useEffect(() => {
    if (data && !isLoading && !isError) {
      // console.log(data.data)
      setClientInfo(data.data);
    }
  }, [data, isLoading, isError]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { md: "100vh" },
          mt: { xs: 30, md: 0 },
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">Failed to load client data.</Typography>
      </Box>
    );
  }

  return (
    <div className="ml-[-15px] md:ml-0">
      <Card
        sx={{
          mx: { md: 5 },
          pl: { md: 3 },
          pr: { md: 5 },
          boxShadow: "none",
          bgcolor: "#F6F5F5",
          borderRadius: "15px",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Client Information
            </Typography>
            <Typography sx={{ fontSize: "14px" }}>
              <span style={{ color: "#F6C328" }}> ● </span>
              {clientInfo?.leadStatus === leadStatus.INITIATED
                ? "Eligibility Form Under Review"
                : clientInfo?.leadStatus === leadStatus.CONSULTATIONLINKSENT ||
                  clientInfo?.leadStatus === leadStatus.CONSULTATIONSCHEDULED
                ? "Consultation Pending"
                : clientInfo?.leadStatus === leadStatus.CONSULTATIONDONE ||
                  clientInfo?.leadStatus === leadStatus.PAYMENTLINKSENT
                ? "Payment Pending"
                : clientInfo?.leadStatus === leadStatus.PAYMENTDONE
                ? "Payment Completed"
                : clientInfo?.leadStatus === leadStatus.REJECTED
                ? "Rejected"
                : ""}
            </Typography>
          </Box>

          {/* Client Info */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: {xs:1,md:2},
            }}
          >
            {/* Left Info */}
            <Box>
              <Typography sx={{ fontSize: { xs: "14px", md: "16px"},mb:{xs:1,md:0} }}>
                Name: {clientInfo?.leadInfo?.name}
              </Typography>

              <Typography sx={{ fontSize: { xs: "14px", md: "16px" },mb:{xs:1,md:0} }}>
                Applied for: <strong>{clientInfo?.leadInfo?.appliedFor}</strong>
              </Typography>

              <Tooltip title={clientInfo?.leadInfo?.email || ""} arrow>
                <Typography
                  sx={{
                    fontSize: { xs: "14px", md: "16px" },
                    maxWidth: { xs: "350px", md: "500px" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  Email: {clientInfo?.leadInfo?.email}
                </Typography>
              </Tooltip>
            </Box>

            {/* Right Info */}
            <Box>
              <Typography sx={{ fontSize: { xs: "14px", md: "16px" },mb:{xs:1,md:0} }}>
                Case ID: {clientInfo?.leadInfo?.caseId}
              </Typography>

              <Typography sx={{ fontSize: { xs: "14px", md: "16px" },mb:{xs:1,md:0} }}>
                Number: {clientInfo?.leadInfo?.phone}
              </Typography>

              {clientInfo?.paymentInfo?.status === "PAID" && (
                <Typography sx={{ fontSize: { xs: "14px", md: "16px" },mb:{xs:1,md:0} }}>
                  Payment Status:{" "}
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Completed
                  </span>
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: {xs:"start", md:"end"},
          mx: {md:5},
          pl: {md:3},
          pr: {md:5},
          mt: { xs:2,md:3},
        }}
      >
        <Button
          variant="contained"
          sx={{
            boxShadow: "none",
            textTransform: "none",
            borderRadius: "20px",
          }}
          onClick={() => setEmployeeDrawerOpen(true)}
        >
          + Add this as task
        </Button>
      </Box>
      <ClientConsultation
        onRefreshLead={refetch}
        leadStatus={clientInfo?.leadStatus || ""}
        consultationInfo={clientInfo?.consultationInfo || null}
        paymentInfo={clientInfo?.paymentInfo || null}
        visaType={clientInfo?.leadInfo?.appliedFor ?? ""}
        eligibilityForm={clientInfo?.eligibilityForm || null}
        formSubmisionDate={clientInfo?.leadInfo?.createdAt || ""}
        showExtraTabs={false}
        isParticularVisaApplication={false}
      />
      <AddNewTaskDrawer
        attachLead={leadid}
        open={employeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
      />
    </div>
  );
};

export default ClientInformation;
