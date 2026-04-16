import { useNavigate, useParams } from "react-router-dom";
import AllEmployeeTable from "./AllEmployeeTable";
import { Box, Tab, Tabs } from "@mui/material";
import { useFetchAllAdminUsersQuery } from "../../../features/admin/RoleandPermission/roleAndPermissionApi";
import ManageRoles from "./ManageRoles";
import { useSearchPagination } from "../../../features/searchPagination/useSearchPagination";

const RoleAndPermission = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [searchPagination, { setPage, setLimit, setSearch }] =
    useSearchPagination({
      initialPage: 1,
      initialLimit: 10,
      initialSearch: "",
    });

  const handleChange = (_event: React.SyntheticEvent, newValue: any) => {
    navigate(`/admin/roleandpermission/${newValue}`);
  };

  const {
    data: allAdminUsers,
    refetch: refetchAllAdminUsers,
    isLoading: isLoadingAdminUsers,
  } = useFetchAllAdminUsersQuery(searchPagination);

  return (
    <div className="md:px-5">
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={type}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label="All Employees"
            value="allemployee"
            sx={{ textTransform: "none" }}
          />
          <Tab
            label="Manage Roles"
            value="manageroles"
            sx={{ textTransform: "none" }}
          />
        </Tabs>
      </Box>
      {type === "allemployee" ? (
        <AllEmployeeTable
          admins={allAdminUsers?.admins || []}
          refetchAllAdminUsers={refetchAllAdminUsers}
          isLoadingAdminUsers={isLoadingAdminUsers}
          pagination={allAdminUsers?.pagination}
          searchPagination={searchPagination}
          setPage={setPage}
          setLimit={setLimit}
          setSearch={setSearch}
        />
      ) : (
        <ManageRoles />
      )}
    </div>
  );
};

export default RoleAndPermission;
