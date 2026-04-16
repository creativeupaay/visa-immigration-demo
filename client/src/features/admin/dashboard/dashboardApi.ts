import { baseApi } from "../../../app/api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchRecentLeads:build.query({
        query:() => ({
            url:"/admin/dashboard/fetchRecentLeads",
            method:"GET"
        }),
    }),
    fetchRecentConsultation: build.query({
      query: () => (
        {
        url: `/admin/dashboard/fetchRecentConsultions`,
        method: 'GET',
      }),
    }),
    fetchRevenue: build.query({
      query: () => (
         { url: `/admin/dashboard/fetchAllRevenue`,
          method: "GET",
          }
      )
    }),
    fetchRecentUpdates: build.query({
      query: () => (
         { url: `/admin/dashboard/fetchRecentUpdates`,
          method: "GET",
          }
      )
    }),
    fetchAnalytics: build.query({
      query: () => (
         { url: `/admin/dashboard/fetchAnalytics`,
          method: "GET",
          }
      )
    }),
  })
})

export const { useFetchRecentConsultationQuery,useFetchRecentLeadsQuery,useFetchRevenueQuery,useFetchRecentUpdatesQuery,useFetchAnalyticsQuery} = dashboardApi;