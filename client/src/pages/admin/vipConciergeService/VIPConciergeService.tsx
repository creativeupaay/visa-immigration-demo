import { toast } from "react-toastify";
import VIPConciergeServiceTable from "./VIPConciergeServiceTable";

export interface VIPConciergeService {
  caseId: string;
  name: string;
  consultationDate: string;
  status: "Cancelled" | "Confirmed" | "Completed";
  requestedDate:string
  }

const dummyData:VIPConciergeService[] = [
  { caseId: "E360-DXB-001", name: "Chijioke Nkem",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 10:00 AM", status: "Cancelled" },
  { caseId: "E360-DXB-002", name: "Gang Chae",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 10:00 AM", status: "Confirmed" },
  { caseId: "E360-DXB-003", name: "Danielle Everett",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 10:00 AM", status: "Confirmed" },
  { caseId: "E360-DXB-004", name: "Rashid Afaf",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 10:00 AM", status: "Confirmed" },
  { caseId: "E360-DXB-005", name: "Jomo Gathoni",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 10:00 AM", status: "Confirmed" },
  { caseId: "E360-DXB-006", name: "Tristan Wesley",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 11:00 AM", status: "Confirmed" },
  { caseId: "E360-DXB-007", name: "Hiroshi Kei",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 11:30 AM", status: "Confirmed" },
  { caseId: "E360-DXB-008", name: "Akili Vitu",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 12:00 PM", status: "Confirmed" },
  { caseId: "E360-DXB-009", name: "Tristan Gavin",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 2:00 PM", status: "Confirmed" },
  { caseId: "E360-DXB-010", name: "Kaylee Adam",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 3:00 PM", status: "Completed" },
  { caseId: "E360-DXB-011", name: "Cooper Noah",requestedDate:"12 Mar 2025, 10:00 AM", consultationDate: "12 Mar 2025, 3:00 PM", status: "Completed" },
];



const VIPConciergeService = () => {

    const handleJoinNow = (consultation: any) => {
      toast.success(`Joining consultation for ${consultation.name}`);
      };
    
      const handleReschedule = (consultation: any) => {
        toast.success(`Rescheduling consultation for ${consultation.name}`);
      };
    
  return (
    <div className="px-4">
      <VIPConciergeServiceTable  data={dummyData} onJoinNow={handleJoinNow} onReschedule={handleReschedule} />
    </div>
  )
}

export default VIPConciergeService