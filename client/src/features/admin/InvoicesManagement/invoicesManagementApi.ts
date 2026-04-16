import { baseApi } from "../../../app/api";
import { downloadFile } from "../../../utils/downloadFile";

export const invoicesManagementApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllInvoices: build.query({
      query: ({ page = 1, limit = 5, search = "", statusFilter = "" }) => ({
        url: `/admin/invoices/fetchAllInvoices`,
        params: {
          page,
          limit,
          search: encodeURIComponent(search),
          statusFilter: encodeURIComponent(statusFilter),
        },
        method: "GET",
      }),
    }),
    fetchInvoicesStats: build.query({
      query: () => ({
        url: `/admin/invoices/fetchInvoicesStats`,
        method: "GET",
      }),  
    }), 
  }),
});

export const downloadInvoicesReport = async (startDate: string, endDate: string) => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const url = `${baseURL}/api/v1/admin/invoices/downloadInvoicesReport?startDate=${startDate}&endDate=${endDate}`;
  return downloadFile(url);
};

export const { useFetchAllInvoicesQuery,useFetchInvoicesStatsQuery } = invoicesManagementApi;
