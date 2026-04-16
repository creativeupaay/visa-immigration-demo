import { baseApi } from "../../app/api";

export const adminUIPermisions = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchUIPermissions: build.query({
      query: () => ({
        url: `/admin/uipermissions/fetchUIPermissions`,
        method: "GET",
      }),
    }),
  }),
});

export const { useFetchUIPermissionsQuery } = adminUIPermisions;
