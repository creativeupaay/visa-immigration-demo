import { baseApi } from "../../../app/api";



export const dashboardApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
      getApplications: build.query({
        query: () => ({
          url: "/user/visaapplication/allVisaApplications",
          method: "GET",
        }),
      }), 
      getPreviousApplications: build.query({
        query: () => ({
          url: "/user/visaapplication/previousapplication",
          method: "GET",
        }),
      }) 
    })
})

export const { useGetApplicationsQuery,useGetPreviousApplicationsQuery} =  dashboardApi;