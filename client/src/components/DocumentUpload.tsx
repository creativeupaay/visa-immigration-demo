import { useState, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { LinearProgress, Modal, useMediaQuery, useTheme } from "@mui/material";

interface FileDataType {
  fileName: string;
  fileType?: string;
  fileSize?: string;
  value: string;
  isLoading: boolean;
  uploadFunction: (file: File) => Promise<void>;
}

const DocumentUpload = ({
  fileName,
  fileType,
  fileSize,
  value,
  isLoading,
  uploadFunction,
}: FileDataType) => {

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

 return (
  <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutrals-50 p-3 gap-2">
    <UploadModal
      isLoading={isLoading}
      isUploadModalOpen={isUploadModalOpen}
      setIsUploadModalOpen={setIsUploadModalOpen}
      uploadFunction={uploadFunction}
    />

    {/* Left portion */}
    <div className="flex items-start md:items-center justify-between w-full md:w-auto space-x-3 md:space-x-5">
      <div
        className={`${
          !value
            ? "bg-neutrals-200 text-white"
            : "bg-golden-yellow-100 text-neutrals-950"
        }   p-3 rounded-xl`}
      >
        <Icon
          icon={`${
            !value
              ? "icon-park-outline:upload"
              : "icon-park-outline:done-all"
          }`}
          width="24"
          height="24"
        />
      </div>

      <div className="flex flex-col space-y-1 w-full">
        <h1 className="text-neutrals-950 text-sm font-semibold">
          {fileName}
        </h1>
        <div className="flex flex-wrap gap-3 text-neutrals-400 text-xs">
          <p>File Format: {fileType}</p>
          <p>Max. File Size: {fileSize}</p>
        </div>

        {/* Mobile-only buttons below filename */}
        {isMobile && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {!value ? (
              <button
                onClick={() => {
                  setIsUploadModalOpen(true);
                }}
                className="bg-neutrals-500 py-1 px-3 text-neutrals-50 text-sm rounded-xl cursor-pointer"
              >
                Upload File
              </button>
            ) : (
              <>
                <button
                  className="bg-transparent border border-neutrals-400 py-1 px-3 text-neutrals-400 text-sm rounded-xl cursor-pointer"
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  Re-Upload
                </button>

                <a href={value} target="_blank" rel="noopener noreferrer">
                  <button className="bg-golden-yellow-400 py-1 px-3 text-neutrals-950 text-sm rounded-xl cursor-pointer">
                    Preview
                  </button>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Desktop buttons (shown only on md and above) */}
    {!isMobile && (
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/png, application/pdf"
          className="hidden"
        />

        {!value ? (
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
            }}
            className="bg-neutrals-500 py-1 px-3 text-neutrals-50 text-sm rounded-xl cursor-pointer"
          >
            Upload File
          </button>
        ) : (
          <>
            <button
              className="bg-transparent border border-neutrals-400 py-1 px-3 text-neutrals-400 text-sm rounded-xl cursor-pointer"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Re-Upload
            </button>

            <a href={value} target="_blank" rel="noopener noreferrer">
              <button className="bg-golden-yellow-400 py-1 px-3 text-neutrals-950 text-sm rounded-xl cursor-pointer">
                Preview
              </button>
            </a>
          </>
        )}
      </div>
    )}
  </div>
);

};

export default DocumentUpload;

interface UploadModalProps {
  isLoading: boolean;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  uploadFunction: (file: File) => Promise<void>;
}

const UploadModal = ({
  isLoading,
  isUploadModalOpen,
  setIsUploadModalOpen,
  uploadFunction,
}: UploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  // const test = true;
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    try {
      // console.log(file)
      await uploadFunction(file);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <Modal open={isUploadModalOpen}>
      <div
        className="w-full h-full flex justify-center items-center"
        onClick={() => {
          setIsUploadModalOpen(false);
        }}
      >
        <div
          className="w-[65%] h-[80%] bg-neutrals-50 rounded-xl flex flex-col items-center p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="w-full h-full flex flex-col justify-center items-center">
              <p className="text-neutrals-950 text-2xl font-bold mb-10">
                Uploading your Document
              </p>

              <div className="rounded-full border-[20px] border-golden-yellow-50">
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

              <div className="mt-10 text-start">
                <p className="text-sm font-semibold text-neutrals-950">
                  {selectedFileName}
                </p>
                <p className="text-xs text-neutrals-500">
                  File Format: PNG &nbsp;&nbsp; File Size: 12MB
                </p>
                <LinearProgress
                                  sx={{
                                    mt:2,
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: "#facc15", // Tailwind's yellow-400
                                    },
                                    backgroundColor: "#fef9c3", // Tailwind's yellow-100 (optional, for track color)
                                  }}
                                />
                {/* <div className="mt-4 w-96 h-1.5 bg-[#F6C328] rounded-full overflow-hidden">
                  <div className="bg-[#FEF6D7] h-full w-full animate-pulse" />
                </div> */}
              </div>
            </div>
          ) : (
            // Default UI (browse and drag-drop)
            <>
              <p className="text-neutrals-950 text-2xl font-bold mt-20">
                Upload your Document
              </p>
              <div className="w-full mt-20 flex flex-col items-center">
                <div className="rounded-full border-[20px] border-golden-yellow-50 cursor-pointer w-fit">
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
                  {/* <p>Drag & Drop your file here</p> */}
                  {/* <p>or</p> */}
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
                    {selectedFileName && (
                      <p className="text-sm text-neutrals-950 mt-2">
                        Selected: {selectedFileName}
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
      </div>
    </Modal>
  );
};
