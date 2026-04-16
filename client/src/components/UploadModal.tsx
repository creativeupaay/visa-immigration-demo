import { LinearProgress, Modal } from "@mui/material";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useUploadDocumentMutation } from "../features/common/commonApi";
import { toast } from "react-toastify";

// utility to get readable size
export const getFileSizeInMB = (size: number) => {
  return (size / (1024 * 1024)).toFixed(2);
};

interface UploadModalProps {
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reqStatusId: string;
  refetch: () => void;
}

const UploadModal = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  reqStatusId,
  refetch,
}: UploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file); // save whole file object

    try {
      // console.log(file, reqStatusId);
      await uploadDocument({ reqStatusId, file }).unwrap();
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.error || "Upload failed, try again");
    } finally {
      setSelectedFile(null);
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
          className="md:w-[65%] md:h-[80%] bg-neutrals-50 rounded-xl flex flex-col items-center p-7"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="md:w-full md:h-full flex flex-col justify-center items-center">
              <p className="text-[#282827] text-xl md:text-2xl font-bold md:mb-5">
                Uploading your Document
              </p>

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
                  File Format: {selectedFile?.type.split("/")[1]?.toUpperCase()}{" "}
                  &nbsp;&nbsp; File Size:{" "}
                  {selectedFile ? getFileSizeInMB(selectedFile.size) : "0"} MB
                </p>
                <LinearProgress
                  sx={{
                    mt: 2,
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#facc15", // Tailwind's yellow-400
                    },
                    backgroundColor: "#fef9c3", // Tailwind's yellow-100 (optional, for track color)
                  }}
                />
                {/* <div className="mt-4 w-full h-1 bg-[#F6C328] rounded-full overflow-hidden md:h-1.5">
                  <div className="bg-[#FEF6D7] h-full w-full animate-pulse my-10" />
                </div> */}
              </div>
            </div>
          ) : (
            <>
              <p className="text-[#282827] text-2xl font-bold mt-12 md:mt-20">
                Upload your Document
              </p>
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
      </div>
    </Modal>
  );
};

export default UploadModal;
