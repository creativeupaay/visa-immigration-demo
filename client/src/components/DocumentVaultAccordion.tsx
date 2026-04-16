import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StepData } from "../features/customer/documentVault/doumentVaultTypes";

const DocumentVaultAccordion = ({
  title,
  stepsData,
}: // source,
{
  title: string;
  stepsData: StepData;
  source?: string;
}) => {
  // console.log(stepsData)
  const sortedSteps = Object.entries(stepsData).sort(
    ([, a], [, b]) => a.stepNumber - b.stepNumber
  );

  return (
    <Box sx={{ mb: 5 }}>
      <Typography sx={{ fontSize: { xs: "18px", md: "24px" }, mb: 2 }}>
        {title}
      </Typography>
      {sortedSteps.map(([stepName, stepDetails]) => (
        <Accordion key={stepName}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontSize: { xs: "14px", md: "16px" } }}>
              Step {stepDetails.stepNumber}: {stepName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {stepDetails.documents.length > 0 ? (
              <List>
                {stepDetails.documents.map((doc, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <a
                        href={doc.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            color: "black",
                            textTransform: "none",
                            borderRadius: "20px",
                            minWidth: { xs: "60px", md: "100px" },
                            px: { xs: 1, md: 2 },
                            fontSize: { xs: "10px", md: "14px" },
                          }}
                        >
                          Preview
                        </Button>
                      </a>
                    }
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: "32px", md: "56px" },
                        mr: { xs: 1, md: 2 },
                      }}
                    >
                      <div
                        className="
        p-2 rounded-xl text-white bg-neutrals-200
        flex items-center justify-center
        w-8 h-8 
        md:w-12 md:h-12 md:mb-2
      "
                      >
                        <Icon
                          icon="carbon:document"
                          width="16"
                          height="16"
                          className="md:w-8 md:h-8"
                        />
                      </div>
                    </ListItemIcon>
                    <Tooltip title={doc.question} arrow>
                      <ListItemText
                        primaryTypographyProps={{
                          noWrap: true,
                          sx: {
                            fontSize: { xs: "12px", md: "16px" },
                            maxWidth: { xs: "120px", md: "400px" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        }}
                        primary={doc.question}
                      />
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded for this step.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default DocumentVaultAccordion;
