import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useLazyGetCurrentStepInfoQuery, useSubmitRequirementsMutation } from "../../../../features/common/commonApi";
import { toast } from "react-toastify";

const BankAccountOpening = ({ requirements, visaApplicationId }: { requirements: any[], visaApplicationId: string }) => {

   const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [submitRequirements, { isLoading }] = useSubmitRequirementsMutation();
  const [getCurrentStepInfo] = useLazyGetCurrentStepInfoQuery();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialData: Record<string, string> = {};

    requirements.forEach((req) => {
      initialData[req.reqStatusId] = req.value || "";
    });

    setFormData(initialData);
  }, [requirements]);

  const handleChange = (
    reqStatusId: string,
    value: string,
    requirementType: string
  ) => {
    if (requirementType === "NUMBER") {
      const numericValue = value.replace(/[^0-9.-]/g, "");

      setFormData((prev) => ({ ...prev, [reqStatusId]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [reqStatusId]: value }));
    }

    if (errors[reqStatusId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[reqStatusId];
        return newErrors;
      });
    }
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLDivElement>,
    requirementType: string
  ) => {
    if (requirementType === "NUMBER") {
      const isValidKey =
        /^[0-9.-]$/.test(event.key) ||
        ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
          event.key
        );

      if (!isValidKey) {
        event.preventDefault();
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requirements.forEach((req) => {
      if (req.required) {
        const value = formData[req.reqStatusId] || "";

        if (!value.trim()) {
          newErrors[req.reqStatusId] = "This field is required";
          isValid = false;
        } else if (req.requirementType === "NUMBER" && isNaN(Number(value))) {
          newErrors[req.reqStatusId] = "Please enter a valid number";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const requirementsToSubmit = requirements.map((req) => ({
        reqStatusId: req.reqStatusId,
        value: formData[req.reqStatusId] || "",
      }));

      await submitRequirements(requirementsToSubmit).unwrap();

      // Call getCurrentStepInfo with visaApplicationId after successful submission
      getCurrentStepInfo(visaApplicationId );
      toast.success("All requirements submitted successfully");
    } catch (error) {
      toast.error("Failed to submit requirements:");
    }
  };

  const chunkedRequirements = [];
  for (let i = 0; i < requirements.length; i += 2) {
    chunkedRequirements.push(requirements.slice(i, i + 2));
  }

  return (
    <Box p={{ md: 4, xs: 2 }}>
      <Typography gutterBottom sx={{ fontSize: "16px", mb: 3 }}>
        Add Bank Account Details
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        mb={2}
      >
        {chunkedRequirements.map((chunk, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            display="flex"
            flexDirection={isMobile ? "column" : "row"}
            gap={2}
          >
            {chunk.map((req) => (
              <Box
                key={req.reqStatusId}
                flex={1}
                minWidth={isMobile ? "100%" : "250px"}
              >
                <TextField
                  label={req.question}
                  fullWidth
                  value={formData[req.reqStatusId] || ""}
                  onChange={(e) =>
                    handleChange(req.reqStatusId, e.target.value, req.requirementType)
                  }
                  onKeyDown={(e) => handleKeyPress(e, req.requirementType)}
                  inputProps={{
                    inputMode: req.requirementType === "NUMBER" ? "numeric" : "text",
                  }}
                  type="text"
                  required={req.required}
                  error={!!errors[req.reqStatusId]}
                  helperText={errors[req.reqStatusId]}
                />
              </Box>
            ))}
            {/* Add empty box if odd number of fields in last row on larger screens only */}
            {!isMobile && chunk.length === 1 && (
              <Box flex={1} minWidth="250px" />
            )}
          </Box>
        ))}
      </Box>

      <Box>
        <Button
          variant="outlined"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            borderColor: "black",
            color: "black",
            textTransform: "none",
            borderRadius: "20px",
          }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} color="inherit" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default BankAccountOpening;
