import { baseApi } from "../../../../app/api";

export const dominicaApis = baseApi.injectEndpoints({
  endpoints: (build) => ({
    selectInvestmentoption: build.mutation({
      query: ({stepStatusId, investmentOption}) => ({
        url: `/visaApplications/client-side/${stepStatusId}/selectOption`,
        method: "POST",
        data: {investmentOption},
      }),
    }),
    uploadInvoice: build.mutation({
      query: ({stepStatusId, file}) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return {
          url: `/visaApplications/client-side/${stepStatusId}/uploadInvoice`,
          method: "POST",
          data: formData,
          formData: true,
        };
      },
    }),
  }),
});

export const { 
  useSelectInvestmentoptionMutation,
  useUploadInvoiceMutation 
} = dominicaApis;