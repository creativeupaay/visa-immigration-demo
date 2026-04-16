import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import TableComponent from "./TableComponent";
import {
  useFetchAllStepsOfParticularVisaTypeQuery,
  useFetchParticularVisaApplicationQuery,
} from "../../../features/admin/visaApplication/visApplicationApi";
import { useParams } from "react-router-dom";
import { useSearchPagination } from "../../../features/searchPagination/useSearchPagination";

const VisaService = () => {
  const [applications, setApplications] = useState([]);
  const [steps, setSteps] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const { type } = useParams();
  const [statusFilter, setStatusFilter] = useState("All");

  const visaType = type
    ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    : "";

  const [searchPaginationState, searchPaginationActions] =
    useSearchPagination();

  const { data, isLoading, isError } = useFetchParticularVisaApplicationQuery({
    visaType,
    statusFilter: statusFilter === "All" ? "" : statusFilter, // Pass status filter
    ...searchPaginationState,
  });

  const {
    data: stepsData,
    isLoading: stepsLoading,
    isError: stepsError,
  } = useFetchAllStepsOfParticularVisaTypeQuery(visaType);

  useEffect(() => {
    if (data && !isLoading && !isError) {
      setApplications(data.visaApplications);
      setPagination(data.pagination);
    }
  }, [data, isLoading, isError]);

  useEffect(() => {
    if (stepsData && !stepsLoading && !stepsError) {
      setSteps(stepsData.stepNames);
    }
  }, [stepsData, stepsLoading, stepsError]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPaginationActions.setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchPaginationActions]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };
  const handleStatusFilterChange = (newStatusFilter: string) => {
    setStatusFilter(newStatusFilter);
  };

  const paginationProps = pagination
    ? {
        pagination,
        statusFilter,
        onStatusFilterChange: handleStatusFilterChange,
        onPageChange: (page: number) => {
          searchPaginationActions.setPage(page);
        },
        onRowsPerPageChange: (limit: number) => {
          searchPaginationActions.setLimit(limit);
          searchPaginationActions.setPage(1);
        },
      }
    : {
        statusFilter,
        onStatusFilterChange: handleStatusFilterChange,
      };

  const isAnyLoading = isLoading || stepsLoading;
  const isAnyError = isError || stepsError;

  return (
    <Box sx={{ ml: { xs: "-30px", md: 0 }, px: { md: 4 }, py: { md: 2 } }}>
      {!isAnyLoading && !isAnyError && (
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="Search applications..."
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
      )}

      {isAnyLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: "70%", md: "25%" },
          }}
        >
          <CircularProgress />
        </Box>
      ) : isAnyError ? (
        <Typography color="error" align="center" mt={4}>
          Something went wrong while fetching data.
        </Typography>
      ) : (
        <TableComponent
          data={applications}
          stepsData={steps}
          visaType={visaType}
          {...paginationProps}
        />
      )}
    </Box>
  );
};

export default VisaService;
