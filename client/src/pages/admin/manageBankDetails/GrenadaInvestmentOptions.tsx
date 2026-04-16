import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
} from "@mui/material";
import EditIconOutlined from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";
import TextInput from "../../../components/TextInput";
import {
  useEditBankDetailsMutation,
  useFetchBankDetailsQuery,
} from "../../../features/admin/manageBankDetails/manageBankDetailsApi";
import { toast } from "react-toastify";

interface BankDetailsSection {
  id: string;
  title: string;
  fields: { id: string; label: string; value: string }[];
  isEditing: boolean;
}

const GrenadaInvestmentOptions: React.FC = () => {
  const isTablet = useMediaQuery("(max-width:900px)");
  const { data, isLoading, isError, refetch } =
    useFetchBankDetailsQuery("GRENADA");

  const [sections, setSections] = useState<BankDetailsSection[]>([]);
  const [editBankDetails] = useEditBankDetailsMutation();

  // On API data load, initialize state
  useEffect(() => {
    if (data) {
      // Sample mapping: change based on actual API structure
      setSections([
        {
          id: "grenada-ntf",
          title: "Economical Transformation Fund (ETF) Donation",
          isEditing: false,
          fields: [
            {
              id: "grenada-ntf-bank1",
              label: "Bank Name",
              value: data?.bankName || "",
            },
            {
              id: "grenada-ntf-bank2",
              label: "Account Number",
              value: data?.accountNumber || "",
            },
            {
              id: "grenada-ntf-bank3",
              label: "Account Holder Name",
              value: data?.accountHolderName || "",
            },
            {
              id: "grenada-re-bank1",
              label: "SWIFT/BIC Code",
              value: data?.swiftOrBicCode || "",
            },
            {
              id: "grenada-re-bank2",
              label: "IBAN Number (if applicable)",
              value: data.ibanNumber || "",
            },
            {
              id: "grenada-re-bank3",
              label: "IFSC Code",
              value: data?.ifscCode || "",
            },
          ],
        },
      ]);
    }
  }, [data]);

  const handleBankDetailsChange = (
    sectionId: string,
    fieldId: string,
    value: string
  ) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            fields: section.fields.map((field) =>
              field.id === fieldId ? { ...field, value } : field
            ),
          };
        }
        return section;
      })
    );
  };

  const toggleEditMode = async (sectionId: string) => {
    const sectionToUpdate = sections.find((s) => s.id === sectionId);

    if (sectionToUpdate?.isEditing) {
      const payload: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
        swiftOrBicCode: string;
        ibanNumber: string;
        ifscCode: string;
        visaTypeName: string;
      } = {
        visaTypeName: "GRENADA",
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        swiftOrBicCode: "",
        ibanNumber: "",
        ifscCode: "",
      };

      // Map field labels to payload keys
      sectionToUpdate.fields.forEach((field) => {
        switch (field.label) {
          case "Bank Name":
            payload.bankName = field.value;
            break;
          case "Account Holder Name":
            payload.accountHolderName = field.value;
            break;
          case "Account Number":
            payload.accountNumber = field.value;
            break;
          case "SWIFT/BIC Code":
            payload.swiftOrBicCode = field.value;
            break;
          case "IBAN Number (if applicable)":
            payload.ibanNumber = field.value;
            break;
          case "IFSC Code":
            payload.ifscCode = field.value;
            break;
          default:
            break;
        }
      });

      // console.log(payload);

      try {
        await editBankDetails({
          visaTypeName: "GRENADA",
          data: payload,
        }).unwrap();

        // Show success alert
        toast.success("Bank details updated successfully!");
        refetch();
      } catch (error) {
        toast.error("Failed to update bank details. Please try again.");
        console.error("Update error:", error);
      }
    }
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, isEditing: !section.isEditing }
          : section
      )
    );
  };

  if (isLoading)
    return (
      <div className="ml-[45%] md:ml-[45%] mt-[55%] md:mt-[25%]">
        <CircularProgress />
      </div>
    );
  if (isError) return <Typography>Error fetching bank details.</Typography>;

  return (
    <>
      {sections.map((section) => (
        <Box
          key={section.id}
          sx={{
            mb: 0,
            p: 2,
            backgroundColor: "white",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display:  {xs:"block", md:"flex"},
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
              mt: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: 600 }}>
              {section.title}
            </Typography>
            <Box
              onClick={() => toggleEditMode(section.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:{xs:"start",md:"center"},
                cursor: "pointer",
                my:{xs:2,md:0}
              }}
            >
              {section.isEditing ? (
                <SaveIcon />
              ) : (
                <EditIconOutlined sx={{ color: "#000" }} />
              )}
              <Typography>
                {section.isEditing ? "Save" : "Edit Details"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              margin: "-12px",
            }}
          >
            {section.fields.map((field) => (
              <Box
                key={field.id}
                sx={{
                  width: {
                    xs: "100%",
                    sm: isTablet ? "50%" : "33.33%",
                  },
                  padding: "12px",
                  boxSizing: "border-box",
                }}
              >
                <TextInput
                  label={field.label}
                  value={field.value}
                  onChange={(e) =>
                    handleBankDetailsChange(
                      section.id,
                      field.id,
                      e.target.value
                    )
                  }
                  required={true}
                  placeholder="Enter Bank Details"
                  disabled={!section.isEditing}
                />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default GrenadaInvestmentOptions;
