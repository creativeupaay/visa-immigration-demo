import { useState } from "react";
import { Icon } from "@iconify/react";
import UploadModal from "../../UploadModal";

interface DocumentsSubmittedMobileTypes {
  fileName: string;
  fileType?: string;
  fileSize?: string;
  reqStatus?: string;
  phase?: string;
  value: string;
  reqStatusId: string;
  refetch: () => void;
  reason: string;
}

const DocumentsSubmittedMobile = ({
  fileName,
  fileType,
  fileSize,
  reqStatus,
  //   phase,
  value,
  reqStatusId,
  refetch,
  reason,
}: DocumentsSubmittedMobileTypes) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // console.log(reqStatus)
  const getIconStyles = () => {
    if (reqStatus === "NOT_UPLOADED" || reqStatus === "RE_UPLOAD") {
      return {
        bg: "bg-neutrals-200",
        text: "text-white",
        icon: "icon-park-outline:upload",
      };
    } else if (reqStatus === "UPLOADED") {
      return {
        bg: "bg-[#FFEAC0]",
        text: "text-neutrals-950",
        icon: "icon-park-outline:done-all",
      };
    } else{
      return {
        bg: "bg-[#CAE6CB]",
        text: "text-neutrals-950",
        icon: "icon-park-outline:done-all",
      };
    }
  };

  const iconStyles = getIconStyles();

  return (
    <div className="w-full p-4 flex flex-col gap-4 bg-white border-b border-neutrals-100 mb-2">
      <UploadModal
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        reqStatusId={reqStatusId}
        refetch={refetch}
      />

      <div className="flex items-center gap-4">
        {/* Icon box */}
        <div className={`${iconStyles.bg} ${iconStyles.text} p-3 rounded-xl`}>
          <Icon icon={iconStyles.icon} width={18} height={18} />
        </div>

        {/* File Details */}
        <div className="flex flex-col">
          <div className="relative inline-block w-fit">
            <h1 className="text-neutrals-950 text-[14px] font-semibold pr-4">
              {fileName}
            </h1>
            <span
              className={`absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 rounded-full ${
                reqStatus === "VERIFIED" ? "bg-[#64AF64]" : "bg-neutrals-400"
              }`}
            />
          </div>
          <p className="text-[12px] text-neutrals-400">
            File Format: {fileType} &nbsp;&nbsp; Max. File Size: {fileSize}
          </p>
          <p className="text-[13px] text-black mt-2">{reason}</p>
        </div>
      </div>

      {/* Button Section */}
      <div className="w-full flex gap-2">
        {(reqStatus === "RE_UPLOAD" || reqStatus === "NOT_UPLOADED") && (
          <button
            className={`py-2 text-sm rounded-xl w-full border ${
              reqStatus === "RE_UPLOAD"
                ? "bg-transparent border-neutrals-400 text-neutrals-400"
                : "bg-[#F6C328] text-neutrals-950 border-none"
            }`}
            onClick={() => setIsUploadModalOpen(true)}
          >
            {reqStatus === "RE_UPLOAD" ? "Re-Upload" : "Upload File"}
          </button>
        )}

        {reqStatus !== "NOT_UPLOADED" && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <button className="bg-[#F6C328] text-sm text-neutrals-950 w-full py-2 rounded-xl font-medium">
              Preview
            </button>
          </a>
        )}
      </div>
    </div>
  );
};

export default DocumentsSubmittedMobile;
