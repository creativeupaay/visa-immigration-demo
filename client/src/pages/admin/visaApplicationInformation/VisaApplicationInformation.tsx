import {  useParams } from "react-router-dom";
// import { useFetchParticularLeadQuery } from "../../../features/admin/leadManagement/leadManagementApi";
// import { ClientInfoType } from "../../../features/admin/leadManagement/leadManagementTypes";
import {  useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ClientConsultation from "../clientInformation/ClientConsultation";
import ClientInfoCard from "../../../components/admin/ClientInfoCard";
import Chatbot from "../../../components/Chatbot";
import ChatbotPanel from "../../../components/ChatbotPanel";
import AddNewTaskDrawer from "../../../features/admin/taskManagement/components/AddNewTaskDrawer";
import { useGetVisaApplicationInfoQuery } from "../../../features/admin/visaApplication/visApplicationApi";

const VisaApplicationInformation = () => {
  // const location = useLocation();
  // const row = location.state?.row;
  // const leadid = row?.leadId;
  const { visaApplicationId } = useParams();
  // const { data, isLoading, isError, refetch } =
  //   useFetchParticularLeadQuery(leadid);
  // const [clientInfo, setClientInfo] = useState<ClientInfoType>();
  const [chatVisible, setChatVisible] = useState(false);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const {data:basicClientInfo,isLoading,isError} = useGetVisaApplicationInfoQuery(visaApplicationId)
  // console.log(basicClientInfo.data.basicInfo)
  // useEffect(() => {
  //   if (data && !isLoading && !isError) {
  //     setClientInfo(data.data);
  //   }
  // }, [data, isLoading, isError]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !basicClientInfo) {
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
    <Box sx={{ position: "relative", mt: { md: 2 } }}>
      <ClientInfoCard clientInfo={basicClientInfo.data} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "start", md: "end" },
          mx: { md: 5 },
          pl: { md: 3 },
          pr: { md: 5 },
          mt: { xs: 2, md: 3 },
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
        onRefreshLead={()=> {}}
        leadStatus={""}
        consultationInfo={null}
        paymentInfo={basicClientInfo.data.paymentInfo}
        eligibilityForm={null}
        visaType={basicClientInfo.data.basicInfo.appliedFor || ""}
        formSubmisionDate={""}
        showExtraTabs={true}
        isParticularVisaApplication={true}
      />

      <AddNewTaskDrawer
        attachVisaApplication={visaApplicationId}
        open={employeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
      />

      {!chatVisible && (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 10 }}>
          <Chatbot onToggle={() => setChatVisible((prev) => !prev)} />
        </Box>
      )}

      {chatVisible && (
        <ChatbotPanel
          chatVisible={chatVisible}
          setChatVisible={setChatVisible}
          visaApplicationId={visaApplicationId}
          source={"Admin"}
        />
      )}
    </Box>
  );
};

export default VisaApplicationInformation;
