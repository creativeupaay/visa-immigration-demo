import { baseApi } from "../../../app/api";


export const clientInformationApi = baseApi.injectEndpoints({
    endpoints:(build) => ({
    sendPaymentLink: build.mutation({
        query:({leadid,body })=>({
            url:`/admin/payment/${leadid}/sendPaymentLink`,
            method:"POST",
            data:body 
        })
    }),
    proceedToPayment: build.mutation({
        query:({leadid })=>({
            url:`/admin/payment/${leadid}/proceedToPayment`,
            method:"POST", 
        })
    })
    })

})

export const { useSendPaymentLinkMutation,useProceedToPaymentMutation } = clientInformationApi