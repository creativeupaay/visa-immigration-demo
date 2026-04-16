import { baseApi } from "../../app/api";

export const commonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //Fetch customers current visa application step  informationa and  requirements
    getCurrentStepInfo: build.query({
      query: (visaApplicationId) => ({
        url: `visaApplications/common/${visaApplicationId}/getCurrentStepInfo`,
        method: "GET",
      }),
    }),

    submitRequirements: build.mutation({
      query: (requirements) => {
        return {
          url: `/visaApplications/common/submitRequirements`,
          method: "POST",
          data: { requirements },
        };
      },
    }),

    //lots of changes here
    uploadDocument: build.mutation({
      // Use queryFn instead of query for complete control
      queryFn: async ({ reqStatusId, file }, _extraOptions) => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
          const response = await fetch(
            `${baseUrl}/api/v1/visaApplications/common/${reqStatusId}/uploadDocument`,
            {
              method: "POST",
              body: formData,
              credentials: "include",
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return {
              error: {
                status: response.status,
                data: errorData || "Upload failed",
              },
            };
          }

          const result = await response.json();
          return { data: result };
        } catch (error) {
          console.error("Upload error:", error);
          return {
            error: {
              status: 500,
              data: error,
            },
          };
        }
      },
    }),

    removeDocument: build.mutation({
      query: (reqStatusId) => {
        return {
          url: `/visaApplications/common/${reqStatusId}/removeDocument`,
          method: "POST",
        };
      },
    }),

    stepSubmit: build.mutation({
      query: (visaApplicationId) => {
        return {
          url: `/visaApplications/common/${visaApplicationId}/stepSubmit`,
          method: "POST",
        };
      },
    }),
    moveToNextStep: build.mutation({
      query: (visaApplicationId) => {
        return {
          url: `/visaApplications/client-side/${visaApplicationId}/moveToNextStep`,
          method: "POST",
        };
      },
    }),

    fetchDeliveryDetails: build.query({
      query: ({ stepStatusId }) => {
        return {
          url: `visaApplications/common/${stepStatusId}/fetchBothDetails`,
          method: "GET",
        };
      },
    }),

    fetchVaultDocs: build.query({
      query: (visaApplicationId) => ({
        url: `/visaApplications/docVault/${visaApplicationId}/fetchVaultDocS`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useFetchDeliveryDetailsQuery,
  useGetCurrentStepInfoQuery,
  useLazyGetCurrentStepInfoQuery,
  useRemoveDocumentMutation,
  useUploadDocumentMutation,
  useSubmitRequirementsMutation,
  useStepSubmitMutation,
  useMoveToNextStepMutation,
  useFetchVaultDocsQuery,
} = commonApi;
