import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  ListItemIcon
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { useMoveToAnotherCategoryMutation } from "../features/admin/AdminDocumentVault/adminDocumentVaultApi";

interface Document {
  _id: string;
  url: string;
  docName:string
}

interface Category {
  _id: string;
  name: string;
  documents: Document[];
}

interface Props {
  categoryWiseDocs: Category[];
  source?: string;
  refetch?: () => void;
}

const CategoryDocumentsAccordion: React.FC<Props> = ({
  categoryWiseDocs,
  source,
  refetch,
}) => {
  const [selectOpenForDoc, setSelectOpenForDoc] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");

  if (!Array.isArray(categoryWiseDocs) || categoryWiseDocs.length === 0) {
    return;
  }

  const [moveToAnotherCategory] = useMoveToAnotherCategoryMutation();

  const handleMoveClick = async () => {
    console.log(selectOpenForDoc, selectedOption);
    try {
      const documentId = selectOpenForDoc;
      const body = {
        newCategoryId: selectedOption,
      };
      await moveToAnotherCategory({ documentId, body }).unwrap();
      refetch?.();
      toast.success("Succesfully moved the document!");
    } catch (err) {
      toast.error("Something went wrong try again");
    }

    setSelectOpenForDoc(null);
    setSelectedOption("");
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Additional Documents
      </Typography>
      {categoryWiseDocs.map((category) => (
        <Accordion key={category._id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{category.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {category.documents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No documents available for this category.
              </Typography>
            ) : (
              <List>
                {category.documents.map((doc) => {

                  return (
                    <ListItem
                      key={doc._id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ListItemIcon>
                        <div className="bg-neutrals-200 text-white p-3 rounded-xl">
                          <Icon
                            icon={"carbon:document"}
                            width="24"
                            height="24"
                          />
                        </div>
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <ListItemText
                          primary={
                            <span
                              style={{
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                                cursor: "default",
                              }}
                              title={doc.docName}
                            >
                              {doc.docName}
                            </span>
                          }
                        />
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => window.open(doc.url, "_blank")}
                          sx={{ textTransform: "none", borderRadius: "20px" }}
                        >
                          Preview
                        </Button>

                        {source === "Admin" && (
                          <>
                            {selectOpenForDoc === doc._id ? (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    setSelectOpenForDoc(null);
                                    setSelectedOption("");
                                  }}
                                  sx={{
                                    color: "black",
                                    borderColor: "black",
                                    textTransform: "none",
                                    borderRadius: "20px",
                                    minWidth: "36px",
                                    padding: "6px 8px",
                                  }}
                                  aria-label="Toggle select options"
                                >
                                  <KeyboardDoubleArrowRightIcon />
                                </Button>
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 120 }}
                                >
                                  <InputLabel id={`select-label-${doc._id}`}>
                                    Select
                                  </InputLabel>
                                  <Select
                                    labelId={`select-label-${doc._id}`}
                                    value={selectedOption}
                                    label="Select"
                                    onChange={(e) =>
                                      setSelectedOption(e.target.value)
                                    }
                                  >
                                    {categoryWiseDocs.map((c: any) => {
                                      if (category.name === c.name) return null;
                                      return (
                                        <MenuItem key={c._id} value={c._id}>
                                          {c.name}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </FormControl>
                                <Button
                                  variant="outlined"
                                  onClick={handleMoveClick}
                                  sx={{
                                    color: "black",
                                    textTransform: "none",
                                    borderColor: "black",
                                    borderRadius: "20px",
                                  }}
                                  disabled={!selectedOption}
                                >
                                  Move
                                </Button>
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setSelectOpenForDoc(doc._id)}
                                sx={{
                                  color: "black",
                                  borderColor: "black",
                                  textTransform: "none",
                                  borderRadius: "20px",
                                  minWidth: "36px",
                                  padding: "6px 8px",
                                }}
                                aria-label="Toggle select options"
                              >
                                <KeyboardDoubleArrowLeftIcon />
                              </Button>
                            )}
                          </>
                        )}
                      </Stack>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default CategoryDocumentsAccordion;
