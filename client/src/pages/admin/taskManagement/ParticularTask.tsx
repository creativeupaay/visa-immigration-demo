import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Chip,
  Button,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddRemarkToTaskMutation,
  useEditRemarkToTaskMutation,
  useEditTaskMutation,
  useFetchAssigneeListQuery,
  useFetchParticularTaskQuery,
  useUpdateTaskAttachmentsMutation,
} from "../../../features/admin/taskManagement/taskManagementApi";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { formatDate } from "../../../utils/FormateDate";

const ParticularTask = () => {
  const { taskid } = useParams();
  const navigate = useNavigate();

  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [assignedTo, setAssignedTo] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [assignees, setAssignees] = useState<{ name: string; email: string }[]>(
    []
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [remark, setRemark] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [priority, setPriority] = useState("");
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");


  const [editRemarkToTask] = useEditRemarkToTaskMutation();

  const [addRemarkToTask, { isLoading }] = useAddRemarkToTaskMutation();

  const { data, refetch } = useFetchParticularTaskQuery(taskid);
  const task = data?.data;
  // console.log(task)
  const { data: allUsersData } = useFetchAssigneeListQuery(undefined);

  const [editTask] = useEditTaskMutation();
  const [updateTaskAttachments, { isLoading: isEditing }] =
    useUpdateTaskAttachmentsMutation();

  const assigneeOptions =
    allUsersData?.data?.map((user: any) => ({
      label: user.email,
      value: user._id,
      role: user.role,
    })) || [];

  useEffect(() => {
    if (task && allUsersData?.data) {
      setStatus(task.status || "");
      const selectedAssignees =
        task.assignedTo?.map((user: any) => ({
          email: user.email,
          name: user.name,
        })) || [];
      setAssignees(selectedAssignees);

      const selectedOptions = allUsersData.data
        .filter((user: any) =>
          selectedAssignees.map((u: any) => u.email).includes(user.email)
        )
        .map((user: any) => ({
          label: user.email,
          value: user._id,
          role: user.role,
        }));

      setAssignedTo(selectedOptions);
      setDescription(task.description || "");
    }
  }, [task, allUsersData]);

  const handleNavigation = () => {
    navigate("/admin/taskmanagement");
  };

  const handleUploadFiles = async () => {
    try {
      await updateTaskAttachments({
        taskId: taskid,
        files: mediaFiles,
      }).unwrap();
      toast.success("Files uploaded successfully");
      setMediaFiles([]);
      refetch();
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim()) return;

    try {
      await addRemarkToTask({
        taskId: taskid,
        body: { remarkMsg: remark },
      }).unwrap();
      toast.success("Remark added successfully");
      setRemark("");
      refetch();
    } catch (err) {
      toast.error("Failed to add remark");
    }
  };

  const handleEditClick = (index: any, currentMessage: string) => {
    setEditIndex(index);
    setEditText(currentMessage);
  };

  const handleSave = async (taskId: string, remarkId: string) => {
    try {
      await editRemarkToTask({
        taskId,
        remarkId,
        body: { remarkMsg: editText },
      }).unwrap();
      setEditIndex(null);
      setEditText("");
      toast.success("Remark edited successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to edit remark");
    }
  };

  const handleDelete = (fileNameToDelete: string) => {
    setMediaFiles((prev) =>
      prev.filter((file) => file.name !== fileNameToDelete)
    );
  };

  const handleToggleStatus = async () => {
    const newStatus = status === "Completed" ? "Due" : "Completed";
    setStatus(newStatus);

    try {
      await editTask({
        taskId: taskid,
        body: { status: newStatus },
      });
      toast.success(`Status updated to ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handlePriorityChange = async (event:any) => {
    const newPriority = event.target.value;
    setPriority(newPriority);

    try {
      await editTask({
        taskId: task?._id,
        body: {
          priority: newPriority, 
        },
      }).unwrap();
      toast.success("Edited priority successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to update priority:");
    }
  };

 const handleDateChange = async (field:any, value:any) => {
    if (!value) return;

    try {
      await editTask({
        taskId: task._id,
        body: { [field]: new Date(value).toISOString() },
      });
      toast.success(`${field === "startDate" ? "Start" : "End"} date updated`);
      refetch();
    } catch (err) {
      toast.error(`Failed to update ${field}`);
    }
  };

  return (
    <Box px={{ md: 4 }} width="100%" maxWidth="900px" mx="auto">
      <div className="flex justify-end">
        <IconButton onClick={handleNavigation}>
          <CloseIcon sx={{ color: "black" }} />
        </IconButton>
      </div>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={2}
      >
        <Typography variant="h5" fontWeight="bold">
          {task?.taskName || "Task Name"}
        </Typography>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" mb={3}>
        Assigned by - {task?.assignedBy?.name || "Admin/Manager"}
      </Typography>

      {/* <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={async (e) => {
            const newStatus = e.target.value;
            setStatus(newStatus);
            try {
              await editTask({ taskId: taskid, body: { status: newStatus } });
              toast.success("Status updated!");
              refetch();
            } catch (err) {
              toast.error("Failed to update status.");
            }
          }}
        >
          <MenuItem value="Overdue">Over Due</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Due">Due</MenuItem>
        </Select>
      </FormControl> */}

      <Box mt={2} display={"flex"} alignItems={"center"} gap={1}>
        <Typography fontWeight={600}>Status :</Typography>
      <Tooltip title={`Mark as ${status === "Completed" ? "Due" : "Completed"}`}>
        <IconButton onClick={handleToggleStatus}>
          <AssignmentTurnedInIcon
            sx={{
              color: status === "Completed" ? "green" : "inherit",
              transition: "color 0.3s",
            }}
          />
        </IconButton>
      </Tooltip>
    </Box>

      <TextField
        fullWidth
        label="Description"
        placeholder="Description of the task"
        multiline
        rows={3}
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={async () => {
          try {
            await editTask({ taskId: taskid, body: { description } });
            toast.success("Task description updated");
            refetch();
          } catch (err) {
            toast.error("Failed to update description.");
          }
        }}
      />

      <Box display="flex" gap={4} mt={2}>
        <Box>
          <Typography fontWeight={600}>Lead</Typography>
          <Typography color="text.secondary">
            {task?.attachedLead.name || "N/A"}
          </Typography>
        </Box>
        <Box>
          <Typography fontWeight={600}>Application</Typography>
          <Typography color="text.secondary">
            {task?.attachedVisaApplication.visaType || "N/A"}
          </Typography>
        </Box>
      </Box>

      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Priority
        </Typography>
        <Box
          px={2}
          py={1}
          mb={3}
          bgcolor={
            task?.priority === "High"
              ? "#FFEAEF"
              : task?.priority === "Medium"
              ? "#FEF8ED"
              : "#E5F2E4"
          }
          border="1px solid"
          borderColor={
            task?.priority === "High"
              ? "#F44336"
              : task?.priority === "Medium"
              ? "#FECF6F"
              : "#65AE64"
          }
          color={
            task?.priority === "High"
              ? "#F44336"
              : task?.priority === "Medium"
              ? "#FECF6F"
              : "#65AE64"
          }
          width="fit-content"
          borderRadius="8px"
        >
          {task?.priority || "N/A"}
        </Box>
        <FormControl size="small" fullWidth>
        <InputLabel id="priority-select-label">Edit Priority</InputLabel>
        <Select
          labelId="priority-select-label"
          value={priority}
          label="Edit Priority"
          onChange={handlePriorityChange}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>
      </FormControl>
      </Box>

     <Box mt={3}>
        <Typography fontWeight={600}>Start Date</Typography>
        <Typography color="text.secondary" mb={1}>
          {task?.startDate ? formatDate(task?.startDate) : "N/A"}
        </Typography>
        <TextField
          fullWidth
          type="date"
          size="small"
          value={task?.startDate ? new Date(task?.startDate).toISOString().slice(0, 10) : ""}
          onChange={(e) => {
            const value = e.target.value;
            // setStartDate(value);
            handleDateChange("startDate", value);
          }}
        />
      </Box>

      <Box mt={3}>
        <Typography fontWeight={600}>End Date</Typography>
        <Typography color="text.secondary" mb={1}>
          {task?.endDate ? formatDate(task?.endDate) : "N/A"}
        </Typography>
        <TextField
          fullWidth
          type="date"
          size="small"
          value={task?.endDate ? new Date(task?.endDate).toISOString().slice(0, 10) : ""}
          onChange={(e) => {
            const value = e.target.value;
            // setEndDate(value);
            handleDateChange("endDate", value);
          }}
        />
      </Box>

      <Box mt={3}>
        <Typography fontWeight={600} mb={1}>
          Assignee
        </Typography>

        {/* Assignee Chips */}
        <Box display="flex" gap={1} flexWrap="wrap" mb={1} maxWidth={"800px"}>
          {assignees.map((assignee, idx) => (
            <Tooltip key={idx} title={assignee.email}>
              <Chip
                label={assignee.name}
                onDelete={async () => {
                  const updatedAssignees = assignees.filter((_, i) => i !== idx);
                  setAssignees(updatedAssignees);

                  const updatedIds =
                    allUsersData?.data
                      .filter((user: any) => updatedAssignees.map((u)=>u.email).includes(user.email))
                      .map((user: any) => user._id) || [];

                  try {
                    await editTask({
                      taskId: taskid,
                      body: { assignedTo: updatedIds },
                    });
                    toast.success("Assignee removed successfully.");
                    refetch();
                  } catch (err) {
                    toast.error("Failed to update assignees.");
                  }
                }}
                sx={{ borderRadius: 2 }}
              />
            </Tooltip>
          ))}

          {/* Add or Save Changes Button */}
          <Button
            variant={showMultiSelect ? "contained" : "outlined"}
            startIcon={showMultiSelect ? null : <AddIcon />}
            sx={{
              borderRadius: "15px",
              textTransform: "none",
              borderColor: "#D2D1CF",
              color: "black",
              bgcolor: showMultiSelect ? "" : "white",
              boxShadow: "none",
              ml: 1,
            }}
            onClick={async () => {
              if (!showMultiSelect) {
                // Opening MultiSelect, preload current selection
                const selectedOptions =
                  allUsersData?.data
                    ?.filter((user: any) => assignees.map((u)=>u.email).includes(user.email))
                    .map((user: any) => ({
                      label: user.email,
                      value: user._id,
                      role: user.role,
                    })) || [];

                setAssignedTo(selectedOptions);
                setShowMultiSelect(true);
              } else {
                // Saving changes
                const selectedIds = assignedTo.map((a: any) => a.value);
                const selectedEmails = assignedTo.map((a: any) => a.label);
                setAssignees(selectedEmails);

                try {
                  await editTask({
                    taskId: taskid,
                    body: { assignedTo: selectedIds },
                  });
                  toast.success("Assignees updated!");
                  refetch();
                } catch (err) {
                  toast.error("Failed to update assignees.");
                }

                setShowMultiSelect(false);
              }
            }}
          >
            {showMultiSelect ? "Save Changes" : "Add Assignee"}
          </Button>
        </Box>

        {/* MultiSelect UI */}
        {showMultiSelect && (
          <Box mt={1}>
            <MultiSelect
              options={assigneeOptions}
              value={assignedTo}
              onChange={setAssignedTo}
              labelledBy="Select Assignees"
              overrideStrings={{
                selectSomeItems: "Select Assignees...",
              }}
              ItemRenderer={({
                checked,
                option,
                onClick,
              }: {
                checked: any;
                option: any;
                onClick: any;
              }) => (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={onClick}
                      style={{ marginRight: "12px" }}
                    />
                    <span>{option.label}</span>
                  </div>
                  {option.label !== "Select All" && (
                    <Box
                      sx={{
                        ml: 1,
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        color:
                          option.role === "Manager"
                            ? "#017BFF"
                            : option.role === "Staff"
                            ? "#31B0C6"
                            : "#8e24aa",
                        backgroundColor:
                          option.role === "Manager"
                            ? "#EFF7FF"
                            : option.role === "Staff"
                            ? "#ECF6F8"
                            : "#f3e5f5",
                        marginRight: "8px",
                      }}
                    >
                      {"• " + option.role}
                    </Box>
                  )}
                </div>
              )}
            />
          </Box>
        )}
      </Box>

      <Box mt={4}>
        <Typography fontWeight={600} mb={1}>
          Attachments
        </Typography>

        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {task?.files?.map((file: any, idx: number) => (
            <Chip
              key={idx}
              label={file.name}
              component="a"
              href={file.url}
              target="_blank"
              clickable
              sx={{
                borderRadius: 2,
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            />
          ))}
        </Box>

        <Box
          mt={3}
          p={2}
          border="1px dashed #ccc"
          borderRadius="12px"
          textAlign="center"
          sx={{ cursor: "pointer" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Typography mb={1}>Attach Media</Typography>
          <Typography color="text.secondary" fontSize="14px">
            Upload media/Documents
          </Typography>
          <IconButton>
            <CloudUploadIcon />
          </IconButton>

          {/* Display selected file names */}
          {mediaFiles.length > 0 && (
            <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
              <Typography>Uploaded files</Typography>
              <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                gap={1}
              >
                {mediaFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => handleDelete(file.name)}
                    sx={{ borderRadius: 2 }}
                    variant="outlined"
                  />
                ))}
              </Box>

              {/* Upload Button */}
              <Button
                variant="contained"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening file picker
                  handleUploadFiles();
                }}
                sx={{
                  mt: 1,
                  alignSelf: "center",
                  width: "fit-content",
                  textTransform: "none",
                  borderRadius: "15px",
                }}
                disabled={isEditing}
              >
                {isEditing ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) {
                const selected = Array.from(e.target.files);
                const existingNames = new Set(
                  mediaFiles.map((file) => file.name)
                );
                const uniqueNewFiles = selected.filter(
                  (file) => !existingNames.has(file.name)
                );
                setMediaFiles((prev) => [...prev, ...uniqueNewFiles]);
              }
            }}
            multiple
            style={{ display: "none" }}
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography fontWeight={600} mb={1}>
          Remarks:
        </Typography>

        {task?.remarks?.length > 0 ? (
          task?.remarks.map((remark: any, index: any) => (
            <Box
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                mb: 2,
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
                position: "relative",
              }}
            >
              {/* Avatar */}
              <Avatar>
                {remark.doneBy?.name
                  ? remark.doneBy.name.charAt(0).toUpperCase()
                  : "U"}
              </Avatar>

              {/* Content */}
              <Box flex={1}>
                <Typography fontWeight={500}>
                  {remark.doneBy?.name || "Unknown"}:
                </Typography>

                {editIndex === index ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      sx={{ mt: 1 }}
                    />
                    <Box mt={1} display="flex" gap={1}>
                      <Tooltip title="Cancel">
                        <Button
                          variant="outlined"
                          onClick={() => setEditIndex(null)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "15px",
                            boxShadow: "none",
                            borderColor: "red",
                            color: "red",
                            bgcolor: "#f5f5f5",
                          }}
                        >
                          Cancel
                        </Button>
                      </Tooltip>
                      <Tooltip title="Save">
                        <Button
                          variant="contained"
                          onClick={() => handleSave(task._id, remark._id)}
                          sx={{
                            textTransform: "none",
                            borderRadius: "15px",
                            boxShadow: "none",
                          }}
                        >
                          Save
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : (
                  <Typography sx={{ mt: 0.5 }}>{remark.message}</Typography>
                )}
              </Box>

              {/* Edit button on hover */}
              {hoveredIndex === index && editIndex !== index && (
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(index, remark.message)}
                    >
                      <EditIcon fontSize="small" sx={{ color: "black" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
          ))
        ) : (
          <Typography color="text.secondary" mb={2}>
            No remarks yet.
          </Typography>
        )}
      </Box>

      {/* Input field for new remarks */}
      <Box my={5}>
        <Typography fontWeight={600}>Add remark</Typography>
        <TextField
          fullWidth
          placeholder="Enter remarks of the task"
          multiline
          rows={3}
          margin="normal"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleAddRemark}
          disabled={isLoading || !remark.trim()}
          sx={{
            textTransform: "none",
            borderRadius: "15px",
            boxShadow: "none",
            mb: 5,
          }}
        >
          {isLoading ? "Adding..." : "Add Remark"}
        </Button>
      </Box>
    </Box>
  );
};

export default ParticularTask;
