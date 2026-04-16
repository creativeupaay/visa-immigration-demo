export type Document = {
  name: string;
  [key: string]: any;
};

export type StepDetails = {
  stepNumber: number;
  documents: Document[];
};

export  type StepData = {
  [stepName: string]: StepDetails;
};

export  type VaultDocsResponse = {
  result: {
    adminUploaded: StepData;
    userUploaded: StepData;
  };
};