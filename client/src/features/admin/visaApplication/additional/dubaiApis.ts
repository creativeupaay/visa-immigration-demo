import { baseApi } from "../../../../app/api";

export const dubaiApis = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ___ Trade Name Apis ___

    fetchTradeInfo: build.query({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/common/${stepStatusId}/dubai/trade-name/fetchTradeNameInfo`,
        method: "GET",
      }),
    }),
    submitTradeNameOptions: build.mutation({
      query: ({ stepStatusId, options }) => ({
        url: `/visaApplications/client-side/${stepStatusId}/dubai/trade-name/uploadTradeNameOptions`,
        method: "POST",
        data: { options },
      }),
    }),
    assignOneTradename: build.mutation({
      query: ({ stepStatusId, assignedName }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/trade-name/assignOneTradeName`,
        method: "POST",
        data: { assignedName },
      }),
    }),
    requestTradenameChange: build.mutation({
      query: ({ stepStatusId, options, reasonOfChange }) => ({
        url: `/visaApplications/client-side/${stepStatusId}/dubai/trade-name/sendChangeRequest`,
        method: "POST",
        data: { options, reasonOfChange },
      }),
    }),
    approveChangeRequest: build.mutation({
      query: ({ stepStatusId, assignedName }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/trade-name/approveChangeReq`,
        method: "POST",
        data: { assignedName },
      }),
    }),
    rejectChangeRequest: build.mutation({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/trade-name/rejectChangeReq`,
        method: "POST",
      }),
    }),

    // ______ MOA Apis _______

    fetchMoaInfo: build.query({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/common/${stepStatusId}/dubai/moa/fetchSigAndMOA`,
        method: "GET",
      }),
    }),
    uploadMoa: build.mutation({
      query: ({ stepStatusId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/visaApplications/admin-side/${stepStatusId}/dubai/MOA/moaUpload`,
          method: "POST",
          data: formData,
          formData: true,
        };
      },
    }),
    uploadSignature: build.mutation({
      query: ({ stepStatusId, file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: `/visaApplications/client-side/${stepStatusId}/dubai/MOA/uploadSignature`,
          method: "POST",
          data: formData,
          formData: true,
        };
      },
    }),

    // Medical Appointment Apis

    fetchMedicalTestInfo: build.query({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/common/${stepStatusId}/dubai/medical/fetchMedicalTestInfo`,
        method: "GET",
      }),
    }),
    submitMedicalDetails: build.mutation({
      query: ({ stepStatusId, medicalInfo }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/medical/uploadMedicalTestDetails`,
        method: "POST",
        data: medicalInfo,
      }),
    }),
    sendReschedulingReq: build.mutation({
      query: ({ stepStatusId, reason }) => ({
        url: `/visaApplications/client-side/${stepStatusId}/dubai/medical/sendReschedulingReq`,
        method: "POST",
        data: { reason },
      }),
    }),
    approveReschedulingReq: build.mutation({
      query: ({ stepStatusId, medicalInfo }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/medical/approveReschedulingReq`,
        method: "POST",
        data: medicalInfo,
      }),
    }),
    markTestAsCompleted: build.mutation({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/medical/markTestAsCompleted`,
        method: "POST",
      }),
    }),

    // Payment Apis
    fetchPaymentInfo: build.query({
      query: ({ stepStatusId }) => ({
        url: `/visaApplications/common/${stepStatusId}/dubai/payment/fetchPaymentInfo`,
        method: "GET",
      }),
    }),
    sendDubaiPaymentLink: build.mutation({
      query: ({ stepStatusId, paymentInfo }) => ({
        url: `/visaApplications/admin-side/${stepStatusId}/dubai/payment/sendPaymentLink`,
        method: "POST",
        data: paymentInfo,
      }),
    }),
    dubaiProceedToPayment: build.mutation({
      query: ({stepStatusId}) => ({
        url: `/visaApplications/client-side/${stepStatusId}/dubai/payment/proceedToPayment`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  // Trade Name
  useFetchTradeInfoQuery,
  useSubmitTradeNameOptionsMutation,
  useAssignOneTradenameMutation,
  useRequestTradenameChangeMutation,
  useApproveChangeRequestMutation,
  useRejectChangeRequestMutation,

  //   Moa
  useFetchMoaInfoQuery,
  useUploadMoaMutation,
  useUploadSignatureMutation,

  // Medical
  useFetchMedicalTestInfoQuery,
  useSubmitMedicalDetailsMutation,
  useSendReschedulingReqMutation,
  useApproveReschedulingReqMutation,
  useMarkTestAsCompletedMutation,

  // Payments
  useFetchPaymentInfoQuery,
  useSendDubaiPaymentLinkMutation,
  useDubaiProceedToPaymentMutation,
} = dubaiApis;
