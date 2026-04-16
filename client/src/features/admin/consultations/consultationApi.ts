import { baseApi } from "../../../app/api";

export const consultationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllConsultations: build.query({
      query: ({
        page = 1,
        limit = 5,
        search = "",
        statusFilter = "",
        dateFilter = "",
      }) => ({
        url: `/admin/consultations/fetchAllConsultations?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&statusFilter=${encodeURIComponent(
          statusFilter
        )}&dateFilter=${encodeURIComponent(dateFilter)}`,
        method: "GET",
      }),
    }),
    sendConsultationLink: build.mutation({
      query: (leadId) => ({
        url: `/admin/consultations/${leadId}/sendConsultationLink`,
        method: "POST",
      }),
    }),
    canlendlyWebhook: build.mutation({
      query: () => ({
        url: `/admin/consultations/webhook/calendly`,
        method: "POST",
      }),
    }),
    markConsultationAsCompleted: build.mutation({
      query: (consultationId) => ({
        url: `/admin/consultations/${consultationId}/markConsultationAsCompleted`,
        method: "POST",
      }),
    }),
    fetchConsultationsStats: build.query({
      query: () => ({
        url: `/admin/consultations/fetchConsultationStats`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useFetchAllConsultationsQuery,
  useMarkConsultationAsCompletedMutation,
  useSendConsultationLinkMutation,
  useCanlendlyWebhookMutation,
  useFetchConsultationsStatsQuery,
} = consultationApi;
