import {
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
} from "@mui/material";
import LeadTable from "./LeadTable";
import { AllLeads } from "../../../features/admin/leadManagement/leadManagementTypes";
import { useFetchAllLeadsQuery } from "../../../features/admin/leadManagement/leadManagementApi";
import { useEffect, useState } from "react";
import { useSearchPagination } from "../../../features/searchPagination/useSearchPagination";
import { Search } from "@mui/icons-material";
import LeadsStats from "./LeadsStats";

const LeadManagement: React.FC = () => {
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [leadData, setLeadData] = useState<AllLeads[]>([]);
  const [searchPaginationState, searchPaginationActions] =
    useSearchPagination();
  const [sort, setSort] = useState("-createdAt");

  const { data, isLoading, isError } = useFetchAllLeadsQuery({
    ...searchPaginationState,
    sort,
  });

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setLeadData(data.leads ?? []);
      setPagination(data.pagination);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPaginationActions.setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchPaginationActions]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    searchPaginationActions.setPage(1); // Reset to first page
  };

  const paginationProps = pagination
    ? {
        pagination,
        sort, // Add this
        onSortChange: handleSortChange, // Add this
        onPageChange: (page: number) => {
          searchPaginationActions.setPage(page);
        },
        onRowsPerPageChange: (limit: number) => {
          searchPaginationActions.setLimit(limit);
          searchPaginationActions.setPage(1);
        },
      }
    : { sort, onSortChange: handleSortChange };

  return (
    <Box
      sx={{
        ml: { xs: "-25px", md: 0 },
        px: { md: 4 },
        // display: "flex",
        // justifyContent: isLoading ? "center" : "flex-start",
        // alignItems: isLoading ? "center" : "stretch",
      }}
    >

      <LeadsStats/>
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Search leads..."
          value={searchInput}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {isLoading ? (
        <Box
          sx={{ mt: { xs: "70%", md: "25%" }, ml: { xs: "40%", md: "45%" } }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <LeadTable data={leadData} {...paginationProps} />
      )}
    </Box>
  );
};

export default LeadManagement;
