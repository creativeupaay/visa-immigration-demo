import { baseApi } from "../../../app/api";
import { downloadFile } from "../../../utils/downloadFile";

export const visaApplicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchParticularVisaApplication: build.query({
      query: ({
        visaType,
        page = 1,
        limit = 5,
        search = "",
        statusFilter = "",
      }) => ({
        url: `/admin/visaapplication/fetchApplicationsOfParticularType?visaType=${visaType}&page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&statusFilter=${encodeURIComponent(statusFilter)}`,
        method: "GET",
      }),
    }),
    fetchAllStepsOfParticularVisaType: build.query({
      query: (visaType) => ({
        url: `/admin/visaapplication/fetchAllStepsOfParticularVisaType?visaType=${visaType}`,
        method: "GET",
      }),
    }),
    getVisaApplicationInfo: build.query({
      query: (visaApplicationId) => ({
        url: `/admin/visaapplication/getVisaApplicationInfo/${visaApplicationId}`,
        method: "GET",
      }),
    }),
  }),
});

export const downloadVisaApplicationsReport = async (
  startDate: string,
  endDate: string,
  visaType: string
) => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const url = `${baseURL}/api/v1/admin/visaapplication/downloadVisaApplicationsReport?startDate=${startDate}&endDate=${endDate}&visaType=${visaType}`;
  return downloadFile(url);
};

export const {
  useFetchParticularVisaApplicationQuery,
  useFetchAllStepsOfParticularVisaTypeQuery,
  useGetVisaApplicationInfoQuery,
} = visaApplicationApi;
