import { baseApi } from "../../../../app/api";

export const portugalApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateAimaStatus: build.mutation({
      query: ({aimaId,aimaNumber}) => ({
        url: `/visaApplications/admin-side/${aimaId}/updateStatus`,
        method: "POST",
        data:{aimaNumber},
      }),
    }),
  }),
});

export const { useUpdateAimaStatusMutation } = portugalApi;
