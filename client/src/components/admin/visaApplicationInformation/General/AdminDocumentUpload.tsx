import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import UploadModal from "../../../UploadModal";
import { useRemoveDocumentMutation } from "../../../../features/common/commonApi";

interface FileDataType {
  fileName: string;
  fileType?: string;
  fileSize?: string;
  reqStatus?: string;
  value: string;
  reqStatusId: string;
  refetch: () => void;
}

const AdminDocumentUpload = ({
  fileName,
  fileType,
  fileSize,
  reqStatus,
  value,
  reqStatusId,
  refetch,
}: FileDataType) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [removeDocument, { isLoading: isRemoving }] =
    useRemoveDocumentMutation();

  const handleDeleteDocument = async () => {
    try {
      await removeDocument(reqStatusId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between border-b border-neutrals-50 p-3 md:gap-3">
      <UploadModal
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        reqStatusId={reqStatusId}
        refetch={refetch}
      />

      {/* Left Section */}
      <div className="flex items-start md:items-center gap-3 md:gap-5 w-full md:w-auto">
        <div
          className={`${
            reqStatus === "UPLOADED" || reqStatus === "VERIFIED"
              ? "bg-golden-yellow-100 text-neutrals-950"
              : "bg-neutrals-200 text-white"
          } p-3 rounded-xl`}
        >
          <Icon
            icon={
              reqStatus === "UPLOADED"
                ? "icon-park-outline:done-all"
                : "icon-park-outline:upload"
            }
            width="24"
            height="24"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <h1 className="text-neutrals-950 text-sm font-semibold">
            {fileName}
          </h1>
          <div className="flex flex-wrap gap-1 md:gap-2 text-neutrals-400 text-xs">
            <p>File Format: {fileType}</p>
            <p>Max. File Size: {fileSize}</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-wrap gap-1 md:gap-4 items-start md:items-center justify-start md:justify-end w-full md:w-auto mt-5 md:mt-0">
        <input type="file" accept="image/png, application/pdf" className="hidden" />

        {reqStatus === "UPLOADED" || reqStatus === "VERIFIED" ? (
          <>
            <button
              className="bg-transparent border border-neutrals-400 py-1 px-3 text-neutrals-400 text-sm rounded-xl cursor-pointer"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Re-Upload
            </button>

            <button
              onClick={handleDeleteDocument}
              disabled={isRemoving}
              className="border border-red-500 disabled:bg-red-300 py-1 px-3 text-red-500 text-sm rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
            >
              {isRemoving ? (
                <>
                  <Icon icon="eos-icons:loading" width="16" height="16" />
                  Deleting...
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:delete-outline" width="16" height="16" />
                  Delete
                </>
              )}
            </button>

            <a href={value} target="_blank" rel="noopener noreferrer">
              <button className="bg-golden-yellow-400 py-1 px-3 text-neutrals-950 text-sm rounded-xl cursor-pointer">
                Preview
              </button>
            </a>
          </>
        ) : (
          <div className="flex justify-end md:block">
             <button
            onClick={() => {
              setIsUploadModalOpen(true);
            }}
            className="bg-neutrals-500 py-1 px-3 text-neutrals-50 text-sm rounded-xl cursor-pointer mt-5 md:mt-0"
          >
            Upload File
          </button>
          </div>
         
        )}
      </div>
    </div>
  );
};

export default AdminDocumentUpload;
