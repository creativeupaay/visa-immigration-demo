import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { VaultDocsResponse } from "../../../features/customer/documentVault/doumentVaultTypes";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from "@mui/material";
import DocumentVaultAccordion from "../../../components/DocumentVaultAccordion";
import { toast } from "react-toastify";
import { useFetchVaultDocsQuery } from "../../../features/common/commonApi";
import {
  useAddCategoryMutation,
  useDocUploadByAdminMutation,
} from "../../../features/admin/AdminDocumentVault/adminDocumentVaultApi";
import { Icon } from "@iconify/react";
import { getFileSizeInMB } from "../../../components/UploadModal";
import CategoryDocumentsAccordion from "../../../components/CategoryWiseDocumentsAccordion";

const AdminDocumentVault = () => {
  const { visaApplicationId } = useParams();

  const [vaultDocs, setVaultDocs] = useState<
    VaultDocsResponse["result"] | null
  >(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categoryData, setCategoryData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const { data, isLoading, isError, refetch } =
    useFetchVaultDocsQuery(visaApplicationId);

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();

  const [docUploadByAdmin, { isLoading: isUploading }] =
    useDocUploadByAdminMutation();

  useEffect(() => {
    if (data?.result) {
      setVaultDocs(data.result);
      setCategoryData(data.categoryWiseDocs);
    }
  }, [data]);

  // console.log(categoryData);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  //Uplaod file function
  const handleUploadDocument = async () => {
    if (!documentName.trim() || !selectedCategoryId || !selectedFile) {
      toast.error("All fields are required.");
      return;
    }

    try {
      await docUploadByAdmin({
        categoryId: selectedCategoryId,
        documentName,
        file: selectedFile,
      }).unwrap();

      toast.success("Document uploaded successfully!");
      refetch();
      setOpenUploadDialog(false);
      setDocumentName("");
      setSelectedCategoryId("");
      setSelectedFile(null);
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err?.data?.message || "Failed to upload document.");
    }
  };

  //Add new Category and refeth the all docs
  const handleAddCategory = async () => {
    if (newCategory.trim() === "") {
      toast.info("Category name cannot be empty.");
      return;
    }

    try {
      const body = { categoryName: newCategory.trim() };
      await addCategory({ visaApplicationId, body }).unwrap();
      toast.success("Category added successfully!");
      setOpenDialog(false);
      setNewCategory("");
      refetch();
    } catch (error) {
      toast.error("Failed to add category.");
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full mt-[70%] md:mt-0">
        <CircularProgress />
      </div>
    );

  if (isError || !vaultDocs)
    return <Typography sx={{ m: 5 }}>Failed to load documents.</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <div className="flex justify-end gap-2">
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            color: "black",
            borderRadius: "20px",
            boxShadow: "none",
          }}
          onClick={() => setOpenUploadDialog(true)}
        >
          Upload Document
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderColor: "black",
            textTransform: "none",
            color: "black",
            borderRadius: "20px",
            boxShadow: "none",
          }}
          onClick={() => setOpenDialog(true)}
        >
          Add category
        </Button>
      </div>

      <div className="px-2">
        {vaultDocs.adminUploaded && (
          <DocumentVaultAccordion
            title="Admin Uploaded"
            stepsData={vaultDocs.adminUploaded}
            source="Admin"
          />
        )}
        {vaultDocs.userUploaded && (
          <DocumentVaultAccordion
            title="User Uploaded"
            stepsData={vaultDocs.userUploaded}
            source="Admin"
          />
        )}
        {categoryData && (
          <CategoryDocumentsAccordion
            categoryWiseDocs={categoryData}
            source="Admin"
            refetch={refetch}
          />
        )}
      </div>

      {/* Add category Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
        PaperProps={{
        sx: {
          width: "500px", 
          maxWidth: "90%",
        },
      }}
        >
        <DialogTitle  sx={{ fontWeight: "bold", display: "flex", justifyContent: "center" }}>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            sx={{
              borderColor: "black",
              textTransform: "none",
              color: "black",
              borderRadius: "20px",
              boxShadow: "none",
            }}
            onClick={() => setOpenDialog(false)}
          >
            Close
          </Button>
          <Button
            onClick={handleAddCategory}
            variant="contained"
            disabled={isAdding}
            sx={{
              textTransform: "none",
              color: "black",
              borderRadius: "20px",
              boxShadow: "none",
            }}
          >
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add document dialog */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        PaperProps={{
        sx: {
          width: "600px", // Set your desired width
          maxWidth: "90%", // Optional: responsive max width
        },
      }}
      >
        <DialogTitle
          sx={{ fontWeight: "bold", display: "flex", justifyContent: "center" }}
        >
          Upload Document
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{ display: "flex", flexDirection: "row", gap: 1, mt: 1, p: 1 }}
          >
            <TextField
              label="Document Name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              // label="Select Category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
              required
            >
              <option value="" disabled>
                -- Select Category --
              </option>
              {categoryData.map((category: any) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </TextField>
          </Box>
          <div
            className="flex flex-col items-center p-1"
            onClick={(e) => e.stopPropagation()}
          >
            {isUploading ? (
              <div className="md:w-full md:h-full flex flex-col justify-center items-center">
                <div className="rounded-full border-[20px] border-golden-yellow-50 my-5">
                  <div className="rounded-full border-[15px] border-golden-yellow-300">
                    <div className="bg-golden-yellow-400 p-4 rounded-full">
                      <Icon
                        icon="material-symbols:upload"
                        width={32}
                        height={32}
                        className="text-neutrals-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 w-[90%] max-w-xs text-center md:text-start">
                  <p className="text-xs md:text-sm font-semibold text-neutrals-950 break-words truncate">
                    {selectedFile?.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-neutrals-500 mt-1">
                    File Format:{" "}
                    {selectedFile?.type.split("/")[1]?.toUpperCase()}{" "}
                    &nbsp;&nbsp; File Size:{" "}
                    {selectedFile ? getFileSizeInMB(selectedFile.size) : "0"} MB
                  </p>
                  <LinearProgress
                    sx={{
                      mt: 2,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#facc15", 
                      },
                      backgroundColor: "#fef9c3",
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-full my-10 md:mt-16 flex flex-col items-center">
                  <div
                    className="rounded-full border-[20px] border-golden-yellow-50 cursor-pointer w-fit"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="rounded-full border-[15px] border-golden-yellow-300">
                      <div className="text-neutrals-50 bg-golden-yellow-400 p-2 rounded-full">
                        <Icon
                          icon={"icon-park-outline:plus"}
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-neutrals-950 space-y-3 mt-4">
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-golden-yellow-400 py-2 px-4 text-neutrals-950 rounded-xl cursor-pointer"
                      >
                        Click to Browse
                      </button>
                      <p className="text-neutrals-400 text-xs">
                        (PDF, JPG, PNG – Max 12MB)
                      </p>
                      {selectedFile && (
                        <p className="text-sm text-neutrals-950 mt-2">
                          Selected: {selectedFile.name} (
                          {getFileSizeInMB(selectedFile.size)} MB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setOpenUploadDialog(false)}
            sx={{
              borderColor: "black",
              textTransform: "none",
              color: "black",
              borderRadius: "20px",
              boxShadow: "none",
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            disabled={
              isUploading || !documentName.trim() || !selectedCategoryId || !selectedFile
            }
            onClick={handleUploadDocument}
            sx={{
              textTransform: "none",
              color: "black",
              borderRadius: "20px",
              boxShadow: "none",
            }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDocumentVault;
