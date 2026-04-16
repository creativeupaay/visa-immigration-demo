import { Box, Typography } from "@mui/material";
import DocumentComponent from "../../../../components/admin/visaApplicationInformation/General/DocumentComponent";
import { RequirementTypes } from "../visaAppicationInformationTypes";
import BankAccountOpening from "../../../../components/admin/visaApplicationInformation/BankAccountOpening/BankAccountOpening";
import AIMAStatusComponent from "../../../../components/admin/visaApplicationInformation/AIMA Appointment/AIMAStatusComponent";
import AdminDocumentUpload from "../../../../components/admin/visaApplicationInformation/General/AdminDocumentUpload";
import MedicalAppointment from "../../../../components/admin/visaApplicationInformation/Medical/MedicalAppointment";
import InvestmentOptions from "../../../../components/admin/visaApplicationInformation/InvestmentOptions";
import PassportDeliveryDetails from "../../../../components/admin/visaApplicationInformation/PassportDeliveryDetails";
import TradeDetailsComponent from "../../../../components/admin/visaApplicationInformation/Trade/TradeDetailsComponent";
import MoaSigningComponent from "../../../../components/admin/visaApplicationInformation/MoaSigning/MoaSigningComponent";
import PaymentComponent from "../../../../components/admin/visaApplicationInformation/Payment/PaymentComponent";

type RequirementListProps = {
  requirements: RequirementTypes[];
  onMarkAsVerified: any;
  onNeedsReUpload: any;
  stepSource: string;
  stepData: any;
  visaApplicationId: string;
  stepType: string;
  refetch: () => void;
  stepStatusId: string;
};

const RequirementList = ({
  requirements,
  onMarkAsVerified,
  onNeedsReUpload,
  stepSource,
  stepData,
  stepType,
  visaApplicationId,
  refetch,
  stepStatusId,
}: RequirementListProps) => {
  // Separate dropdown requirements from other types
  const renderDocuments = () => {
    if (stepSource === "ADMIN") {
      if (stepType === "GENERAL") {
        return (
          <>
            {requirements.map((req) => (
              <AdminDocumentUpload
                key={req.reqStatusId}
                fileName={req.question}
                fileType={req.requirementType}
                fileSize={"12MB"}
                reqStatus={req.reqStatus}
                value={req.value || ""}
                reqStatusId={req.reqStatusId}
                refetch={refetch}
              />
            ))}
          </>
        );
      } else if (stepType === "BANK") {
        return (
          <>
            <BankAccountOpening
              visaApplicationId={visaApplicationId}
              requirements={requirements}
            />
          </>
        );
      } else if (stepType === "AIMA") {
        return (
          <>
            <AIMAStatusComponent stepData={stepData} />
          </>
        );
      } else if (stepType === "EMPTY") {
        return <></>;
      }
    } else if (stepSource === "USER") {
      if (stepType === "GENERAL") {
        // Filter requirements by type
        const fileRequirements = requirements.filter(
          (req) => req.requirementType !== "DROPDOWN"
        );
        const dropdownRequirements = requirements.filter(
          (req) => req.requirementType === "DROPDOWN"
        );

        return (
          <>
            {/* Render file requirements */}
            {fileRequirements.map((req) => (
              <DocumentComponent
                key={req.reqStatusId}
                reqStatusId={req.reqStatusId}
                fileName={req.question}
                fileType={req.requirementType}
                fileSize={"12MB"}
                status={req.reqStatus}
                value={req.value || ""}
                onNeedsReUpload={onNeedsReUpload}
                onMarkAsVerified={onMarkAsVerified}
              />
            ))}

            {/* Render dropdown requirements */}
            {dropdownRequirements.length > 0 && (
              <Box mt={2} px={3}>
                {dropdownRequirements.map((req) => (
                  <Box 
                    key={req.reqStatusId} 
                    sx={{ 
                      display: "flex", 
                      alignItems: "baseline",
                      mb: 1.5
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        mr: 1,
                      }}
                    >
                      {req.question}:
                    </Typography>
                    <Typography variant="body2">
                      {req.value || "Not selected"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        );
      } else if (stepType === "BANK") {
        return;
      } else if (stepType === "TRADE_NAME") {
        return;
      } else if (stepType === "MEDICAL") {
        return;
      }
    } else {
      if (stepType === "DGINVESTMENT") {
        return (
          <>
            <InvestmentOptions
              stepStatusId={stepStatusId}
              stepData={stepData}
              refetch={refetch}
            />
          </>
        );
      } else if (stepType === "DGDELIVERY") {
        return (
          <>
            <PassportDeliveryDetails
              stepStatusId={stepStatusId}
              refetch={refetch}
            />
          </>
        );
      } else if (stepType === "TRADE_NAME") {
        return (
          <>
            <TradeDetailsComponent stepStatusId={stepStatusId} />
          </>
        );
      } else if (stepType === "MOA_SIGNING") {
        return (
          <>
            <MoaSigningComponent stepStatusId={stepStatusId} />
          </>
        );
      } else if (stepType === "MEDICAL_TEST") {
        return (
          <>
            <MedicalAppointment stepStatusId={stepStatusId} />
          </>
        );
      }
       else if (stepType === "DUBAI_PAYMENT") {
        return (
          <>
            <PaymentComponent stepStatusId={stepStatusId} />
          </>
        );
      }
    }
    return null;
  };

  return <Box>{renderDocuments()}</Box>;
};

export default RequirementList;