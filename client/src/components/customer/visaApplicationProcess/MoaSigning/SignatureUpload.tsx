import DocumentUpload from "../../../DocumentUpload";

const SignatureUpload = ({
  moaDocument,
  isLoading,
  signatureDocument,
  uploadSignature,
  
}: {
  moaDocument: string;
  isLoading: boolean;
  signatureDocument: string;
  uploadSignature: (file: File) => Promise<void>;
}) => {
  return (
    <div className="mt-4">
      <div className="flex gap-1 p-4">
        <p>Your MOA is ready for signing.</p>
        <a href={moaDocument} className="text-golden-yellow-400" target="_blank">
          View Document
        </a>
      </div>
      <div>
        <DocumentUpload
          fileName="Signature"
          fileSize="12 MB"
          fileType="PDF"
          value={signatureDocument}
          uploadFunction={uploadSignature}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default SignatureUpload;
