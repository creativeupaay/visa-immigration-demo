import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  // Checkbox,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  useDeleteTaskMutation,
  useEditTaskMutation,
} from "../taskManagementApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

interface PaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

interface TaskManagementTableProps {
  tasks: any[];
  pagination: PaginationData;
  paginationState: PaginationState;
  paginationActions: PaginationActions;
  refetchTasks: () => void;
}

const TaskManagementTable = ({
  tasks,
  pagination,
  paginationState,
  paginationActions,
  refetchTasks,
}: TaskManagementTableProps) => {
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [deleteTask] = useDeleteTaskMutation();
  const [editTask] = useEditTaskMutation();

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTaskId(taskId);
      await deleteTask(taskId).unwrap();
      toast.success("Task deleted successfully");
      refetchTasks();
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleTaskComplete = async (taskid: string) => {
    try {
      const body = {
        status: "Completed",
      };
      await editTask({ taskId: taskid, body }).unwrap();
      toast.success("Marked as completed");
      refetchTasks();
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleparticularTaskNavigation = (taskId: string) => {
    navigate(`/admin/taskmanagement/${taskId}`);
  };

  // const handleCheckboxChange = (id: string) => {
  //   const updatedSelected = selectedIds.includes(id)
  //     ? selectedIds.filter((selectedId) => selectedId !== id)
  //     : [...selectedIds, id];

  //   setSelectedIds(updatedSelected);
  //   const selectedRows = tasks.filter((task) =>
  //     updatedSelected.includes(task._id)
  //   );
  //   console.log("Selected Rows:", selectedRows);
  // };

  const handleChangePage = (_: unknown, newPage: number) => {
    // Convert from 0-based to 1-based page numbering
    paginationActions.setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    paginationActions.setLimit(newLimit);
    paginationActions.setPage(1); // Reset to first page when changing page size
  };

  if (isMobile) {
    return (
      <Box p={2}>
        {tasks.length === 0 ? (
          <Typography align="center">
            {paginationState.search
              ? "No tasks found matching your search."
              : "No tasks available."}
          </Typography>
        ) : (
          tasks.map((task) => (
            <Card
              key={task._id}
              variant="outlined"
              sx={{
                borderColor: "black",
                borderRadius: "15px",
                mb: 2,
                opacity: deletingTaskId === task._id ? 0.5 : 1,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                  mb={1}
                >
                  <Typography fontWeight="bold">{task.taskName}</Typography>
                  {/* <Checkbox
                    checked={selectedIds.includes(task._id)}
                    onChange={() => handleCheckboxChange(task._id)}
                  /> */}
                </Stack>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Assigned To:</b>{" "}
                  {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                    ? task.assignedTo.map((user: any) => user.name).join(", ")
                    : "Unassigned"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Assigned By:</b> {task.assignedBy?.name || "Unassigned"}
                </Typography>
                <Box display={"flex"} alignItems={"center"} gap={1} mb={1}>
                  <Typography sx={{ fontWeight: 650 }}>Status:</Typography>
                  <Typography
                    variant="body2"
                    color={
                      task.status === "Completed"
                        ? "green"
                        : task.status === "Due"
                        ? "orange"
                        : "red"
                    }
                    sx={{ fontWeight: 650 }}
                  >
                    {task.status}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  <b>Due Date:</b> {new Date(task.endDate).toLocaleDateString()}
                </Typography>
                <Box display={"flex"} alignItems={"center"} gap={1} mb={1}>
                  <Typography sx={{ fontWeight: 650 }}>Priority:</Typography>
                  <Typography
                    variant="body2"
                    color={
                      task.priority === "High"
                        ? "red"
                        : task.priority === "Medium"
                        ? "orange"
                        : "green"
                    }
                    sx={{ fontWeight: 650 }}
                  >
                    {" "}
                    {task.priority}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions
                sx={{ display: "flex", justifyContent: "space-evenly" }}
              >
                <IconButton
                  disabled={task.status === "Completed"}
                  onClick={() => handleTaskComplete(task._id)}
                >
                  <AssignmentTurnedInIcon
                    sx={{
                      color: task.status === "Completed" ? "green" : "gray",
                    }}
                  />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  <DeleteOutlinedIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    color: "black",
                    borderColor: "black",
                  }}
                  onClick={() => handleparticularTaskNavigation(task._id)}
                >
                  View &gt;
                </Button>
              </CardActions>
            </Card>
          ))
        )}

        {/* Backend Pagination */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={paginationState.page - 1} // Convert from 1-based to 0-based
          onPageChange={handleChangePage}
          rowsPerPage={paginationState.limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#8D8883" }}>Task Name</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Assigned To</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Assigned By</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Status</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Due Date</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Priority</TableCell>
              <TableCell sx={{ color: "#8D8883" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography>
                    {paginationState.search
                      ? "No tasks found matching your search."
                      : "No tasks available."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow
                  key={task._id}
                  sx={{
                    opacity: deletingTaskId === task._id ? 0.5 : 1,
                    transition: "opacity 0.3s ease",
                  }}
                >
                  <TableCell
                    sx={{
                      borderBottom: "none",
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Tooltip title={task.taskName}>
                      <span
                        style={{
                          display: "inline-block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "100%",
                        }}
                        className="hover:cursor-pointer"
                      >
                        {task.taskName}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {Array.isArray(task.assignedTo) &&
                    task.assignedTo.length > 0 ? (
                      <Stack direction="column" spacing={1} flexWrap="wrap">
                        {task.assignedTo.map((user: any) => (
                          <Tooltip title={user.email} key={user._id}>
                            <Chip
                              label={user.name}
                              size="small"
                              sx={{
                                maxWidth: 150,
                                overflow: "hidden",
                                width:"max-content",
                                textOverflow: "ellipsis",
                              }}
                            />
                          </Tooltip>
                        ))}
                      </Stack>
                    ) : (
                      "Unassigned"
                    )}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "none" }}>
                    <Tooltip title={task.assignedBy?.email || "Unassigned"}>
                      {task.assignedBy?.name || "Unassigned"}
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: "none",
                      color:
                        task.status === "Completed"
                          ? "green"
                          : task.status === "Due"
                          ? "orange"
                          : "red",
                    }}
                  >
                    {task.status}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {new Date(task.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography
                      sx={{
                        color:
                          task.priority === "High"
                            ? "red"
                            : task.priority === "Medium"
                            ? "orange"
                            : "green",
                      }}
                    >
                      {task.priority}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <IconButton
                      disabled={task.status === "Completed"}
                      onClick={() => handleTaskComplete(task._id)}
                    >
                      <AssignmentTurnedInIcon
                        sx={{
                          color: task.status === "Completed" ? "green" : "gray",
                        }}
                      />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                    <Button
                      sx={{
                        color: "black",
                        textTransform: "none",
                      }}
                      onClick={() => handleparticularTaskNavigation(task._id)}
                    >
                      View &gt;
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Backend Pagination */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={paginationState.page - 1} // Convert from 1-based to 0-based
        onPageChange={handleChangePage}
        rowsPerPage={paginationState.limit}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />
    </Box>
  );
};

export default TaskManagementTable;
