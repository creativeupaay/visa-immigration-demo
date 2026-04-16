import FileUpload from "./FileUpload";

const UploadComponent = ({ d ,phase , refetch}: { d: any,phase:string,refetch:()=> void }) => {
  const type = d.requirementType;
  // console.log(d);
 
    if(type === "IMAGE" || type === "PDF"){
      return <FileUpload
      reqStatusId={d.reqStatusId}
      fileName={d.question}
      fileSize="12MB"
      fileType={d.requirementType}
      reqStatus={d.reqStatus}
      phase={phase}
      value={d.value}
      refetch={refetch}
    />
    } 
    // ) : type === "SELECT_DROPDOWN" ? (
  //   <DropDownComponent 
  //    label={d.label}
  //    options={d.options}
  //   />
  // ) : (
  //   <IconOptionComponent
  //   optionData = {d.options}
  //   />
  // );
};

export default UploadComponent;
