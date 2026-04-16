import { baseApi } from "../../../app/api";
import { downloadFile } from "../../../utils/downloadFile";

export const leadManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllLeads: build.query({
      query: ({ page = 1, limit = 5, search = "", sort = "-createdAt" }) => ({
        url: `/admin/leads/fetchAllLeads?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&sort=${sort}`,
        method: "GET",
      }),
    }),
    fetchParticularLead: build.query({
      query: (leadId) => ({
        url: `/admin/leads/${leadId}/fetchParticularLead`,
        method: "GET",
      }),
    }),
    rejectParticularLead: build.mutation({
      query: ({ leadid, body }) => ({
        url: `/admin/leads/${leadid}/rejectLead`,
        method: "POST",
        data: body,
      }),
    }),
    fetchLeadsStats: build.query({
      query: () => ({
        url: `/admin/leads/fetchLeadsStats`,
        method: "GET",
      }),
    }),
  }),
});

export const downloadLeadsReport = async (startDate: string, endDate: string) => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const url = `${baseURL}/api/v1/admin/leads/downloadLeadsReport?startDate=${startDate}&endDate=${endDate}`;
  return downloadFile(url);
};

export const {
  useFetchAllLeadsQuery,
  useFetchParticularLeadQuery,
  useRejectParticularLeadMutation,
  useFetchLeadsStatsQuery,
} = leadManagementApi;
