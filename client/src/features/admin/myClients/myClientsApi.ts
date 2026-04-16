import { baseApi } from "../../../app/api";
import { downloadFile } from "../../../utils/downloadFile";

export const myClientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAllClients: build.query({
      query: (params = {}) => ({
        url: `/admin/clientsInfo/fetchAllClients`,
        method: "GET",
        params: params,
      }),
    }),
    fetchClientVisaApplications: build.query({
      query: (userid) => ({
        url: `/admin/clientsInfo/fetchClientVisaApplications/${userid}`,
        method: "GET",
      }),
    }),
    addNewClient: build.mutation({
      query: ({ file, data }) => {
        // console.log(file,data);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("nationality", data.nationality);
        formData.append("serviceType", data.serviceType);
        formData.append("amount", data.amount);
        formData.append("currency", data.currency);
        formData.append("file", file);
        return {
          url: `/admin/adminControl/addNewClient`,
          method: "POST",
          data: formData,
        };
      },
    }),
  }),
});

export const downloadClientsReport = async (startDate: string, endDate: string) => {
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
  const url = `${baseURL}/api/v1/admin/clientsInfo/downloadClientsReport?startDate=${startDate}&endDate=${endDate}`;
  return downloadFile(url);
}

export const {
  useFetchAllClientsQuery,
  useAddNewClientMutation,
  useFetchClientVisaApplicationsQuery,
} = myClientsApi;
