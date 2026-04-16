import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@mui/material";
import { useState, useRef, ChangeEvent } from "react";
import { useUploadInvoiceMutation } from "../../../../features/admin/visaApplication/additional/dominicaApis";

type UploadStatus = "NOT_UPLOADED" | "SELECTED" | "UPLOADED";

interface UploadInvoiceProps {
  stepStatusId: string;
  refetch:()=>void;
}

const UploadInvoice: React.FC<UploadInvoiceProps> = ({ stepStatusId ,refetch}) => {
  const [invoiceUploadStatus, setInvoiceUploadStatus] =
    useState<UploadStatus>("NOT_UPLOADED");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadInvoice, { isLoading }] = useUploadInvoiceMutation();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setInvoiceUploadStatus("SELECTED");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleProceed = async () => {
    if (selectedFile && invoiceUploadStatus === "SELECTED") {
      try {
        await uploadInvoice({ stepStatusId, file: selectedFile }).unwrap();
        await refetch();
        setInvoiceUploadStatus("UPLOADED");
      } catch (error) {
        console.error("Failed to upload invoice:", error);
        // Optional: Add error handling UI here
      }
    }
  };

  return (
    <div className="md:mt-20 py-16 md:mx-10">
      <div className="flex justify-between">
        <div className="flex items-center space-x-5">
          <div
            className={`${
              invoiceUploadStatus === "NOT_UPLOADED"
                ? "bg-neutrals-200 text-white"
                : "bg-golden-yellow-100 text-neutrals-950"
            } p-3 rounded-xl`}
          >
            <Icon
              icon={`${
                invoiceUploadStatus === "NOT_UPLOADED"
                  ? "icon-park-outline:upload"
                  : "icon-park-outline:done-all"
              }`}
              width="24"
              height="24"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <h1 className="text-neutrals-950 text-[14px] md:text-sm font-semibold">
              Payment Invoice
            </h1>
            {fileName && invoiceUploadStatus !== "NOT_UPLOADED" ? (
              <p className="text-neutrals-600 text-xs truncate overflow-hidden whitespace-nowrap max-w-[150px] sm:max-w-none">
  {fileName}
</p>            ) : (
              <div className="flex space-x-2 md:space-x-3 text-neutrals-400 text-[9px] md:text-xs">
                <p>File Format: PDF</p>
                <p>Max. File Size: 12 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Right portion */}
        <div className="flex items-center md:space-x-4">
          <input
            type="file"
            accept="image/png, application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <button
            onClick={handleUploadClick}
            className="bg-neutrals-500 py-1.5 md:py-1 px-1.5 md:px-3 text-neutrals-50 text-sm rounded-xl cursor-pointer"
            disabled={isLoading}
          >
            {invoiceUploadStatus === "UPLOADED" ? "Change File" : "Upload File"}
          </button>
        </div>
      </div>

      <Button
        variant="contained"
        sx={{ borderRadius: "20px", mt: 4, textTransform: "none" }}
        onClick={handleProceed}
        disabled={invoiceUploadStatus !== "SELECTED" || isLoading}
      >
        {isLoading ? "Uploading..." : "Proceed"}
      </Button>
    </div>
  );
};

export default UploadInvoice;
