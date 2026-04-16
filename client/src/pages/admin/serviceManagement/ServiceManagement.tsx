import ServiceManagementComponent from "./ServiceManagementComponent";


export interface Service {
  name: string;
  enabled: boolean;
}

export interface ServiceCategory {
  category: string;
  services: Service[];
}

const serviceData = [
  {
    category: "Dominica Passport",
    services: [
      { name: "Document Verification", enabled: true },
      { name: "Due Diligence & Application Submission", enabled: true },
      { name: "Investment & Government Processing", enabled: true },
      { name: "Approval & Passport Issuance", enabled: true },
      { name: "Passport Delivery", enabled: true },
    ],
  },
  {
    category: "Portugal D7",
    services: [
      { name: "Document Verification", enabled: true },
      { name: "NIF Request & Confirmation", enabled: true },
      { name: "Bank Account Opening & Confirmation", enabled: true },
      { name: "Visa Submission & Processing", enabled: true },
      { name: "Visa Approval", enabled: true },
      { name: "Passport Delivery", enabled: false },
    ],
  },
];
const ServiceManagement = () => {

    const handleToggle = (category: string, serviceName: string, enabled: boolean) => {
        console.log(`Toggled ${serviceName} in ${category} to ${enabled}`);
      };
    
  return (
    <div className="px-6">
        <ServiceManagementComponent data={serviceData} onToggle={handleToggle} />
    </div>
  )
}

export default ServiceManagement