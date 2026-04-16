import { baseApi } from "../../../app/api";

export const AdminProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAdminProfile: build.query({
      query: () => ({
        url: `/admin/admin-profile/fetchAdminProfile`,
        method: "GET",
      }),
    }),
  }),
});

export const {useFetchAdminProfileQuery } = AdminProfileApi;
