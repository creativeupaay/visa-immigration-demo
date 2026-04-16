import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TaskManagementTable from "../../../features/admin/taskManagement/components/TaskManagementTable";
import AddNewTaskDrawer from "../../../features/admin/taskManagement/components/AddNewTaskDrawer";

import {
  useFetchAllTasksQuery,
  useFetchMyTasksQuery,
  useFetchUpcomingTasksQuery,
  useFetchDueTasksQuery,
  useFetchOverdueTasksQuery,
} from "../../../features/admin/taskManagement/taskManagementApi";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { useSearchPagination } from "../../../features/searchPagination/useSearchPagination";

const TaskManagment = () => {
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const permissions = useSelector((state: RootState) => state.adminPermissions);
  const [tab, setTab] = useState(permissions.Read_AllTasks_Tab ? "alltasks" : "mytasks");
  const [searchInput, setSearchInput] = useState("");

  // Separate pagination state for each tab
  const [allTasksPagination, allTasksPaginationActions] = useSearchPagination({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: ""
  });

  const [myTasksPagination, myTasksPaginationActions] = useSearchPagination({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: ""
  });

  const [upcomingTasksPagination, upcomingTasksPaginationActions] = useSearchPagination({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: ""
  });

  const [dueTasksPagination, dueTasksPaginationActions] = useSearchPagination({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: ""
  });

  const [overdueTasksPagination, overdueTasksPaginationActions] = useSearchPagination({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: ""
  });

  // Get current pagination state based on active tab
  const getCurrentPagination = () => {
    switch (tab) {
      case "alltasks": return { state: allTasksPagination, actions: allTasksPaginationActions };
      case "mytasks": return { state: myTasksPagination, actions: myTasksPaginationActions };
      case "upcomingtasks": return { state: upcomingTasksPagination, actions: upcomingTasksPaginationActions };
      case "duetasks": return { state: dueTasksPagination, actions: dueTasksPaginationActions };
      case "overdue": return { state: overdueTasksPagination, actions: overdueTasksPaginationActions };
      default: return { state: myTasksPagination, actions: myTasksPaginationActions };
    }
  };

  const currentPagination = getCurrentPagination();

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      currentPagination.actions.setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, currentPagination.actions]);

  // Update search input when tab changes
  useEffect(() => {
    setSearchInput(currentPagination.state.search);
  }, [tab]);

  const {
    data: allTasks,
    isLoading: isLoadingAll,
    isError: isErrorAll,
    refetch: refetchAllTasks
  } = useFetchAllTasksQuery(
    {
      search: allTasksPagination.search,
      page: allTasksPagination.page,
      limit: allTasksPagination.limit,
    },
    { skip: tab !== "alltasks" }
  );

  const {
    data: myTasks,
    isLoading: isLoadingMy,
    isError: isErrorMy,
    refetch: refetchMyTasks
  } = useFetchMyTasksQuery(
    {
      search: myTasksPagination.search,
      page: myTasksPagination.page,
      limit: myTasksPagination.limit,
    },
    { skip: tab !== "mytasks" }
  );

  const {
    data: upcomingTasks,
    isLoading: isLoadingUpcoming,
    isError: isErrorUpcoming,
    refetch: refetchUpcomingTasks
  } = useFetchUpcomingTasksQuery(
    {
      search: upcomingTasksPagination.search,
      page: upcomingTasksPagination.page,
      limit: upcomingTasksPagination.limit,
    },
    { skip: tab !== "upcomingtasks" }
  );

  const {
    data: dueTasks,
    isLoading: isLoadingDue,
    isError: isErrorDue,
    refetch: refetchDueTasks
  } = useFetchDueTasksQuery(
    {
      search: dueTasksPagination.search,
      page: dueTasksPagination.page,
      limit: dueTasksPagination.limit,
    },
    { skip: tab !== "duetasks" }
  );

  const {
    data: overdueTasks,
    isLoading: isLoadingOverdue,
    isError: isErrorOverdue,
    refetch: refetchOverdueTasks
  } = useFetchOverdueTasksQuery(
    {
      search: overdueTasksPagination.search,
      page: overdueTasksPagination.page,
      limit: overdueTasksPagination.limit,
    },
    { skip: tab !== "overdue" }
  );

  const taskTabs = [
    {
      label: "All Tasks",
      value: "alltasks",
      component: isLoadingAll ? (
        <div className="ml-[45%] mt-[15%]"><CircularProgress /></div>
      ) : isErrorAll || !allTasks?.tasks ? (
        <Typography color="error">Failed to load tasks.</Typography>
      ) : (
        <TaskManagementTable 
          tasks={allTasks.tasks} 
          pagination={allTasks.pagination}
          paginationState={allTasksPagination}
          paginationActions={allTasksPaginationActions}
          refetchTasks={refetchAllTasks} 
        />
      ),
      visible: permissions.Read_AllTasks_Tab,
    },
    {
      label: "My Tasks",
      value: "mytasks",
      component: isLoadingMy ? (
        <div className="ml-[45%] mt-[15%]"><CircularProgress /></div>
      ) : isErrorMy || !myTasks?.tasks ? (
        <Typography color="error">Failed to load tasks.</Typography>
      ) : (
        <TaskManagementTable 
          tasks={myTasks.tasks} 
          pagination={myTasks.pagination}
          paginationState={myTasksPagination}
          paginationActions={myTasksPaginationActions}
          refetchTasks={refetchMyTasks} 
        />
      ),
      visible: true,
    },
    {
      label: "Upcoming Tasks",
      value: "upcomingtasks",
      component: isLoadingUpcoming ? (
        <div className="ml-[45%] mt-[15%]"><CircularProgress /></div>
      ) : isErrorUpcoming || !upcomingTasks?.tasks ? (
        <Typography color="error">Failed to load tasks.</Typography>
      ) : (
        <TaskManagementTable 
          tasks={upcomingTasks.tasks} 
          pagination={upcomingTasks.pagination}
          paginationState={upcomingTasksPagination}
          paginationActions={upcomingTasksPaginationActions}
          refetchTasks={refetchUpcomingTasks}
        />
      ),
      visible: true,
    },
    {
      label: "Due Tasks",
      value: "duetasks",
      component: isLoadingDue ? (
        <div className="ml-[45%] mt-[15%]"><CircularProgress /></div>
      ) : isErrorDue || !dueTasks?.tasks ? (
        <Typography color="error">Failed to load tasks.</Typography>
      ) : (
        <TaskManagementTable 
          tasks={dueTasks.tasks} 
          pagination={dueTasks.pagination}
          paginationState={dueTasksPagination}
          paginationActions={dueTasksPaginationActions}
          refetchTasks={refetchDueTasks}
        />
      ),
      visible: true,
    },
    {
      label: "Overdue",
      value: "overdue",
      component: isLoadingOverdue ? (
        <div className="ml-[45%] mt-[15%]"><CircularProgress /></div>
      ) : isErrorOverdue || !overdueTasks?.tasks ? (
        <Typography color="error">Failed to load tasks.</Typography>
      ) : (
        <TaskManagementTable 
          tasks={overdueTasks.tasks} 
          pagination={overdueTasks.pagination}
          paginationState={overdueTasksPagination}
          paginationActions={overdueTasksPaginationActions}
          refetchTasks={refetchOverdueTasks}
        />
      ),
      visible: true,
    },
  ];

  const visibleTabs = taskTabs.filter((tab) => tab.visible);

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  const activeTab = taskTabs.find((t) => t.value === tab);

  return (
    <div className="ml-[-30px] md:ml-0 md:px-3">
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          position: "relative",
          overflowX: "auto",
        }}
      >
        <Tabs
          value={tab}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabScrollButtonProps={{
            sx: {
              "&.Mui-disabled": {
                opacity: 0.3,
              },
            },
          }}
          sx={{
            ".MuiTabs-scrollButtons": {
              display: "flex",
              width: "40px",
            },
          }}
        >
          {visibleTabs.map(({ label, value }) => (
            <Tab
              key={value}
              label={label}
              value={value}
              sx={{ textTransform: "none", minWidth: "max-content" }}
            />
          ))}
        </Tabs>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap={"wrap"}>
        <TextField
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={() => setEmployeeDrawerOpen(true)}
          sx={{
            textTransform: "none",
            borderRadius: 20,
            backgroundColor: "#FFC107",
            color: "#000",
            boxShadow: "none",
          }}
        >
          Add New Task
        </Button>
      </Box>

      {activeTab?.component}

      <AddNewTaskDrawer
        refetchAllTasks={refetchAllTasks}
        open={employeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
      />
    </div>
  );
};

export default TaskManagment;