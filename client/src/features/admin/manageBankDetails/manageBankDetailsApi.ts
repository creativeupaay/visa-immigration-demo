import { baseApi } from "../../../app/api";

export const manageBankDetails = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchBankDetails: build.query({
      query: (visaType) => ({
        url: `/admin/bankdetails/fetchBankDetails?visaTypeName=${visaType}`,
        method: "GET",
      }),
    }),
    editBankDetails: build.mutation({
      query: ({visaTypeName,data}) => ({
        url: `/admin/bankdetails/editBankDetails/${visaTypeName}`,
        method: "PUT",
        data:data
      }),
    }),
  }),
});

export const { useFetchBankDetailsQuery,useEditBankDetailsMutation } = manageBankDetails;
