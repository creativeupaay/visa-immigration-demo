import { baseApi } from "../../../app/api";

export const LogsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllLogs: build.query({
      query: () => ({
        url: `/admin/logs/fetchAllLogs`,
        method: "GET",
      }),
    }),
    fetchVisaApplicationLogs: build.query({
      query: (visaApplicationId) => ({
        url: `/admin/logs/getParticularApplicationLogs/${visaApplicationId}`,
        method: "GET",
      }),
    }),
    fetchParticularLeadLogs: build.query({
      query: (leadId) => ({
        url: `/admin/logs/getParticularLeadLogs/${leadId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useFetchAllLogsQuery,useFetchParticularLeadLogsQuery,useFetchVisaApplicationLogsQuery } = LogsApi;
