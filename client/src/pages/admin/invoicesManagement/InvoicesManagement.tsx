import { Box } from "@mui/material";
import InvoicesStats from "../../../features/admin/InvoicesManagement/InvoicesStats";
import InvoicesManagementTable from "../../../features/admin/InvoicesManagement/InvoicesManagementTable";

const InvoicesManagement = () => {
  return (
    <Box>
      <InvoicesStats />
      <InvoicesManagementTable />
    </Box>
  );
};

export default InvoicesManagement;
