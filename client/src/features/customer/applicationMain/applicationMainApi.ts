import { baseApi } from "../../../app/api";

export const applicationMainApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadDeliveryDetails: build.mutation({
        query: ({ stepStatusId, body }) => ({
          url: `visaApplications/client-side/${stepStatusId}/uploadDeliveryDetails`,
          method: 'POST',
          data:body,
        }),
      }),      
  }),
});

export const { useUploadDeliveryDetailsMutation } = applicationMainApi;
