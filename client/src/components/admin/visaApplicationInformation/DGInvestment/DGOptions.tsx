import React, { useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  Radio,
  RadioGroup,
  Stack,
  styled,
} from "@mui/material";
import ETFnNTF from "../../../../assets/customer/InvestmentOptionsIcons/ETFnNTF.webp";
import RealEstate from "../../../../assets/customer/InvestmentOptionsIcons/ReadEstate.webp";

// Define types
type InvestmentOption = "EDF" | "NTF" | "REAL_STATE";

interface OptionItem {
  id: InvestmentOption;
  name: string;
  icon: string;
}

interface DGOptionsProps {
  visaType: string;
  isLoading: boolean;
  onOptionSelected?: (option: InvestmentOption) => void;
}

// Styled components with TypeScript
const OptionCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "20px",
  opacity: selected ? 1 : 0.8,
  border: selected
    ? `2px solid ${theme.palette.warning.main}`
    : "1px solid #B4B0AC",
  transition: "all 0.3s ease",
  height: "100%",
  width: "100%",
  flexGrow: 1,
}));

const ImageContainer = styled(Box)({
  width: "80px",
  height: "80px",
  marginBottom: "16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const ProceedButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.warning.main,
  padding: "10px 32px",
  marginTop: "40px",
}));

const DGOptions: React.FC<DGOptionsProps> = ({
  isLoading,
  visaType,
  onOptionSelected = () => {},
}) => {
  const [selectedOption, setSelectedOption] = useState<InvestmentOption | "">(
    ""
  );

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value as InvestmentOption);
  };

  const handleProceed = () => {
    if (selectedOption) {
      onOptionSelected(selectedOption);
    }
  };

  const options: OptionItem[] =
    visaType === "Dominica"
      ? [
          {
            id: "EDF",
            name: "Economic Diversification Fund (EDF) Donation",
            icon: ETFnNTF,
          },
          {
            id: "REAL_STATE",
            name: "Real Estate Investment",
            icon: RealEstate,
          },
        ]
      : [
          {
            id: "NTF",
            name: "National Transformation Fund (NTF) Donation",
            icon: ETFnNTF,
          },
          {
            id: "REAL_STATE",
            name: "Real Estate Investment",
            icon: RealEstate,
          },
        ];

  return (
    <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
      <Typography fontWeight={"700"}>
        Select Your Preferred Investment Option
      </Typography>

      <RadioGroup
        value={selectedOption}
        onChange={handleOptionChange}
        sx={{ mt: 3, mb: 2, width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 3,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {options.map((option) => (
            <Box
              key={option.id}
              sx={{
                flex: { xs: "1 1 100%", sm: "0 1 45%", md: "0 1 40%" },
                maxWidth: { sm: "45%", md: "40%" },
              }}
            >
              <OptionCard
                elevation={0}
                selected={selectedOption === option.id}
                onClick={() => setSelectedOption(option.id)}
              >
                <Box sx={{ alignSelf: "flex-start" }}>
                  <Radio
                    checked={selectedOption === option.id}
                    onChange={handleOptionChange}
                    value={option.id}
                    name="investment-option"
                  />
                </Box>
                <ImageContainer>
                  <img
                    src={option.icon}
                    alt={option.name}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                  />
                </ImageContainer>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ fontWeight: "medium" }}
                >
                  {option.name}
                </Typography>
              </OptionCard>
            </Box>
          ))}
        </Box>
      </RadioGroup>

      <Stack direction="row" justifyContent="center">
        <ProceedButton
          sx={{
            color: "black",
            bgcolor: "#F6C328",
            textTransform: "none",
            borderRadius: "20px",
            boxShadow: "none",
            "&.Mui-disabled": {
              bgcolor: "#e0e0e0", // light gray background when disabled
              color: "#9e9e9e", // optional: change text color when disabled
            },
          }}
          disabled={!selectedOption || isLoading}
          onClick={handleProceed}
        >
          {isLoading ? "Proceeding" : "Proceed"}
        </ProceedButton>
      </Stack>
    </Box>
  );
};

export default DGOptions;
