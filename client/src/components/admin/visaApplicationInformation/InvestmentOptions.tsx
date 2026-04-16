import { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Chip } from "@mui/material";
import { useAddRealStateOptionsMutation } from "../../../features/admin/visaApplicationInformation/visaApplicationInformationApi";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";

const InvestmentOptionMap: Record<string, string> = {
  EDF: "Economic Diversification Fund",
  NTF: "National Transformation Fund",
  REAL_STATE: "Real Estate Investment",
};

const InvestmentOptions = ({
  stepStatusId,
  stepData,
  refetch,
}: {
  stepStatusId: string;
  stepData: any;
  refetch: () => void;
}) => {
  const [newOption, setNewOption] = useState("");
  const [realStateOptions, setRealStateOptions] = useState<string[]>([]);
  const [addRealStateOptions, { isLoading }] = useAddRealStateOptionsMutation();

  const invoiceUrl = stepData?.dgInvestmentData?.investInfo?.invoiceUrl;
  const investmentOption = stepData?.dgInvestmentData?.investInfo?.investmentOption;
  const isRealEstateOption = investmentOption === "REAL_STATE";
  
  // Get existing real estate options from the correct path in stepData
  const existingOptions = stepData?.dgInvestmentData?.investInfo?.realStateOptions || [];

  // Load existing options when component mounts or when stepData changes
  useEffect(() => {
    if (existingOptions && existingOptions.length > 0) {
      setRealStateOptions(existingOptions);
    }
  }, [stepData]);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    setRealStateOptions([...realStateOptions, newOption.trim()]);
    setNewOption("");
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setRealStateOptions(realStateOptions.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newOption.trim()) {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleSubmit = async () => {
    if (realStateOptions.length === 0) {
      toast.info("Please add at least one real estate option before submitting.");
      return;
    }

    try {
      await addRealStateOptions({
        stepStatusId,
        realStateOptions: realStateOptions,
      }).unwrap();

      refetch(); // Call refetch if needed
      toast.success("Successfully submitted Real Estate Options");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to submit options. Please try again.");
    }
  };

  return (
    <Box display="flex" flexDirection="column" p={2} width="100%">
      <Box width="100%">
        <Typography variant="body2" gutterBottom>
          <strong>Investment Option</strong>:{" "}
          {InvestmentOptionMap[investmentOption] ?? "Not Selected"}
        </Typography>

        {isRealEstateOption && (
          <Box mt={2} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Real Estate Options
            </Typography>
            
            {/* Display existing options if available */}
            {existingOptions.length > 0 && (
              <Box mt={1} mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Existing options:
                </Typography>
                <Box display={"flex"} flexDirection={"column"} gap={1}>
                  {existingOptions.map((option:any, index:number) => (
                    <Chip
                      key={`existing-${index}`}
                      label={option}
                      sx={{
                        bgcolor: "#fff7d7",
                        width: "fit-content",
                        color: "black",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Box display="flex" alignItems="center" mt={1}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Add new option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleAddOption}
                disabled={!newOption.trim() || isLoading}
                sx={{
                  ml: 1,
                  bgcolor: "#F6C328",
                  color: "black",
                  '&:hover': { bgcolor: "#e5b424" },
                  textTransform: "none",
                  borderRadius: "15px",
                }}
              >
                Add
              </Button>
            </Box>

            {/* Display newly added options */}
            {realStateOptions.length > 0 && realStateOptions.some(option => !existingOptions.includes(option)) && (
              <Box mt={2} display="flex" flexDirection={"column"} flexWrap="wrap" gap={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom width="100%">
                  New options to submit:
                </Typography>
                {realStateOptions
                  .filter(option => !existingOptions.includes(option))
                  .map((option, index) => (
                    <Chip
                      key={`new-${index}`}
                      label={option}
                      onDelete={() => handleRemoveOption(realStateOptions.indexOf(option))}
                      sx={{
                        bgcolor: "#f1f1f1",
                        width: "fit-content",
                        '& .MuiChip-deleteIcon': {
                          color: '#F6C328',
                          '&:hover': {
                            color: '#e5b424',
                          },
                        },
                      }}
                    />
                  ))}
              </Box>
            )}

            {realStateOptions.length > 0 && (
              <Box mt={2}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  sx={{
                    bgcolor: "#F6C328",
                    color: "black",
                    '&:hover': { bgcolor: "#e5b424" },
                    textTransform: "none",
                    borderRadius: "8px",
                  }}
                >
                  {isLoading ? "Submitting..." : "Submit Options"}
                </Button>
              </Box>
            )}
          </Box>
        )}

        <div className="flex justify-between mt-4">
          <div className="flex items-center space-x-5">
            <div
              className={`${
                !invoiceUrl
                  ? "bg-neutrals-200 text-white"
                  : "bg-golden-yellow-100 text-neutrals-950"
              } p-3 rounded-xl`}
            >
              <Icon
                icon={`${
                  !invoiceUrl
                    ? "icon-park-outline:upload"
                    : "icon-park-outline:done-all"
                }`}
                width="24"
                height="24"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <h1 className="text-neutrals-950 text-sm font-semibold">
                Payment Invoice
              </h1>
            </div>
          </div>

          {/* Right portion */}
          {invoiceUrl && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open(invoiceUrl)}
                className="bg-neutrals-500 py-1 px-3 text-neutrals-50 text-sm rounded-xl cursor-pointer"
                disabled={isLoading}
              >
                View
              </button>
            </div>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default InvestmentOptions;