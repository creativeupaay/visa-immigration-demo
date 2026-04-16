import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { MultiSelect } from "react-multi-select-component";
// import { useFetchAllLeadsQuery } from "../../leadManagement/leadManagementApi";
import {
  useFetchAllLeadsForTasksQuery,
  useAddNewTaskMutation,
  useFetchAllVisaApplicationsQuery,
  useFetchAssigneeListQuery,
} from "../taskManagementApi";
import { toast } from "react-toastify";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const AddNewTaskDrawer = ({
  open,
  onClose,
  refetchAllTasks,
  attachLead,
  attachVisaApplication,
}: {
  open: boolean;
  onClose: () => void;
  refetchAllTasks?: () => void;
  attachLead?: string;
  attachVisaApplication?: string;
}) => {
  const today = dayjs().format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [attachedLead, setAttachedLead] = useState(attachLead ?? "");
  const [application, setApplication] = useState(attachVisaApplication ?? "");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const { data: allVisaApplication } =
    useFetchAllVisaApplicationsQuery(undefined);
  const { data: allAssignee } = useFetchAssigneeListQuery(undefined);
  const { data: allLeads } = useFetchAllLeadsForTasksQuery(undefined);

  const [addNewTask, { isLoading }] = useAddNewTaskMutation();
  const leadOptions = allLeads?.leads?.map((lead: any) => ({
    label: `${lead.name}`,
    value: lead._id,
  }));
  // console.log(leadOptions)

  const applicationOptions = allVisaApplication?.visaApplications?.map(
    (visa: any) => ({
      label: visa.name + "(" + visa.visaType + ")",
      value: visa.visaApplicationId,
    })
  );
  // console.log(allVisaApplication)
  const assigneeOptions = allAssignee?.data?.map((assignee: any) => ({
    label: assignee.name,
    value: assignee._id,
    role: assignee.role,
  }));

  const handleDelete = (fileNameToDelete: string) => {
    setMediaFiles((prev) =>
      prev.filter((file) => file.name !== fileNameToDelete)
    );
  };

  const handleAddTask = async () => {
    try {
      const body = {
        taskName,
        description,
        priority,
        startDate,
        endDate,
        attachedLead,
        assignedTo: assignedTo.map((id: any) => id.value),
        attachedVisaApplication: application,
      };
      // console.log(body);
      await addNewTask({ files: mediaFiles, body }).unwrap();
      refetchAllTasks?.();
      toast.success("Task Added Sucessfully");
      navigate("/admin/taskmanagement");
    } catch (err) {
      toast.error("Something went wrong ");
    } finally {
      setStartDate(today);
      setEndDate("");
      setPriority("");
      setTaskName("");
      setDescription("");
      setApplication("");
      setAttachedLead("");
      setAssignedTo([]);
      setMediaFiles([]);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 380, md: 550 }, padding: 3 } }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Add New Task
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box component="form" display="flex" flexDirection="column" gap={2}>
        <TextField
          fullWidth
          label="Enter Task Name*"
          variant="outlined"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
        />

        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box sx={{ p: 1, borderRadius: 1 }}>
          <Typography>Priority*</Typography>

          <Box display="flex" gap={1} my={2}>
            {["Low", "Medium", "High"].map((level) => {
              const isSelected = priority === level;

              const getStyles = () => {
                switch (level) {
                  case "Low":
                    return {
                      backgroundColor: isSelected ? "#E4F2E5" : "#FFFEFE",
                      color: isSelected ? "#64AF64" : "black",
                      border: `1px solid ${isSelected ? "#64AF64" : "#ccc"}`,
                    };
                  case "Medium":
                    return {
                      backgroundColor: isSelected ? "#FFF8EC" : "#FFFEFE",
                      color: isSelected ? "#FEC95D" : "black",
                      border: `1px solid ${isSelected ? "#FEC95D" : "#ccc"}`,
                    };
                  case "High":
                    return {
                      backgroundColor: isSelected ? "#FFEAEF" : "#FFFEFE",
                      color: isSelected ? "#F5584D" : "black",
                      border: `1px solid ${isSelected ? "#F5584D" : "#ccc"}`,
                    };
                  default:
                    return {};
                }
              };

              return (
                <Box
                  key={level}
                  onClick={() => setPriority(level)}
                  sx={{
                    px: 4,
                    py: 2,
                    borderRadius: "15px",
                    cursor: "pointer",
                    textAlign: "center",
                    flex: 1,
                    ...getStyles(),
                  }}
                >
                  {level}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            label="Start Date*"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) {
                setEndDate("");
              }
            }}
          />
          <TextField
            fullWidth
            label="End Date*"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            inputProps={{ min: startDate }}
          />
        </Box>

        <Box>
          <Typography mb={1}>Assigned To</Typography>
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
            }) => {
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={onClick}
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
                  {option.label !== "Select All" ? (
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
                  ) : null}
                </div>
              );
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box minWidth={{ xs: "160px", md: "230px" }}>
            <Typography mb={1}>Attach Lead</Typography>
            <Select
              options={leadOptions || []}
              value={(leadOptions || []).find(
                (option: any) => option.value === attachedLead
              )}
              onChange={(selectedOption) =>
                setAttachedLead(selectedOption?.value)
              }
              placeholder="Select Lead..."
              isSearchable
            />
          </Box>

          <Box minWidth={{ xs: "160px", md: "230px" }}>
            <Typography mb={1}>Attach Application</Typography>
            <Select
              options={applicationOptions || []}
              value={(applicationOptions || []).find(
                (option: any) => option.value === application
              )}
              onChange={(selectedOption: any) =>
                setApplication(selectedOption?.value)
              }
              placeholder="Select application..."
            />
          </Box>
        </Box>

        <Box
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

          {/* Display file chips if media is selected */}
          {mediaFiles.length > 0 && (
            <>
              <Typography>Uploaded files</Typography>
              <Box
                mt={1}
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
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) {
                const selected = Array.from(e.target.files);

                // Avoid duplicate file names
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

        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            variant="outlined"
            sx={{
              borderRadius: 8,
              width: "48%",
              textTransform: "none",
              borderColor: "black",
              color: "black",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#FFC107",
              color: "#000",
              borderRadius: 8,
              width: "48%",
              textTransform: "none",
              "&:hover": { backgroundColor: "#e6b800" },
              boxShadow: "none",
            }}
            onClick={handleAddTask}
            disabled={
              !taskName ||
              !priority ||
              !startDate ||
              !endDate ||
              assignedTo.length === 0 ||
              isLoading
            }
          >
            {isLoading ? "Adding Task..." : "Add Task"}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddNewTaskDrawer;
