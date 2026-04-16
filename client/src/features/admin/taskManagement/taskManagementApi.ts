import { baseApi } from "../../../app/api";

export const taskManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllTasks: build.query({
      query: ({ search, page, limit }) => ({
        url: `/admin/task-management/fetchAllTasks?search=${search}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Tasks"],
    }),
    fetchMyTasks: build.query({
      query: ({ search, page, limit }) => ({
        url: `/admin/task-management/fetchMyTasks?search=${search}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    fetchUpcomingTasks: build.query({
      query: ({ search, page, limit }) => ({
        url: `/admin/task-management/fetchUpcomingTasks?search=${search}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    fetchDueTasks: build.query({
      query: ({ search, page, limit }) => ({
        url: `/admin/task-management/fetchDueTasks?search=${search}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    fetchOverdueTasks: build.query({
      query: ({ search, page, limit }) => ({
        url: `/admin/task-management/fetchOverdueTasks?search=${search}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    addNewTask: build.mutation({
      query: ({ files, body }) => {
        const formData = new FormData();
        formData.append("taskName", body.taskName);
        formData.append("description", body.description);
        formData.append("priority", body.priority);
        formData.append("startDate", body.startDate);
        formData.append("endDate", body.endDate);

        if (body.attachedLead)
          formData.append("attachedLead", body.attachedLead);

        if (body.attachedVisaApplication)
          formData.append(
            "attachedVisaApplication",
            body.attachedVisaApplication
          );

        body.assignedTo.forEach((userId: string) => {
          formData.append("assignedTo", userId);
        });
        files.forEach((file: any) => formData.append("files", file));

        return {
          url: "/admin/task-management/addNewTask",
          method: "POST",
          data: formData,
        };
      },
      invalidatesTags: ["Tasks"],
    }),
    fetchAssigneeList: build.query({
      query: () => ({
        url: "/admin/task-management/fetchAssigneeList",
        method: "GET",
      }),
    }),

    fetchAllLeadsForTasks: build.query({
      query: () => ({
        url: "/admin/task-management/fetchAllLeads",
        method: "GET",
      }),
    }),
    fetchAllVisaApplications: build.query({
      query: () => ({
        url: "/admin/task-management/fetchAllVisaApplications",
        method: "GET",
      }),
    }),
    fetchParticularTask: build.query({
      query: (taskId) => ({
        url: `/admin/task-management/fetchParticularTask/${taskId}`,
        method: "GET",
      }),
    }),
    deleteTask: build.mutation({
      query: (taskId) => ({
        url: `/admin/task-management/deleteTask/${taskId}`,
        method: "DELETE",
      }),
    }),
    editTask: build.mutation({
      query: ({ taskId, body }) => ({
        url: `/admin/task-management/editTask/${taskId}`,
        method: "PATCH",
        data: body,
      }),
    }),
    updateTaskAttachments: build.mutation({
      query: ({ taskId, files }) => {
        const formData = new FormData();
        files.forEach((file: any) => formData.append("files", file));
        return {
          url: `/admin/task-management/editTask/${taskId}`,
          method: "PATCH",
          data: formData,
        };
      },
    }),
    addRemarkToTask: build.mutation({
      query: ({ taskId, body }) => {
        return {
          url: `/admin/task-management/addRemark/${taskId}`,
          method: "POST",
          data: body,
        };
      },
    }),
    editRemarkToTask: build.mutation({
      query: ({ taskId, remarkId, body }) => {
        return {
          url: `/admin/task-management/editRemark/${taskId}/${remarkId}`,
          method: "PATCH",
          data: body,
        };
      },
    }),
  }),
});

export const {
  useFetchAllTasksQuery,
  useFetchDueTasksQuery,
  useFetchMyTasksQuery,
  useFetchOverdueTasksQuery,
  useFetchUpcomingTasksQuery,
  useFetchAllLeadsForTasksQuery,
  useFetchAllVisaApplicationsQuery,
  useFetchAssigneeListQuery,
  useAddNewTaskMutation,
  useFetchParticularTaskQuery,
  useDeleteTaskMutation,
  useEditTaskMutation,
  useUpdateTaskAttachmentsMutation,
  useAddRemarkToTaskMutation,
  useEditRemarkToTaskMutation,
} = taskManagementApi;
