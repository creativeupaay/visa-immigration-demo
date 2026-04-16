import { baseApi } from "../../../app/api";

export const AdminDocumentVaultApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addCategory: build.mutation({
      query: ({ visaApplicationId, body }) => ({
        url: `/visaApplications/docVault/${visaApplicationId}/addCategory`,
        method: "POST",
        data: body,
      }),
    }),
    docUploadByAdmin: build.mutation({
      query: ({ categoryId, documentName, file }) => {
        // console.log(categoryId, documentName, file)
        const formData = new FormData();
        formData.append("documentName", documentName);
        formData.append("file", file);
        return {
          url: `/visaApplications/docVault/${categoryId}/docUploadByAdmin`,
          method: "POST",
          data: formData,
        };
      },
    }),
    moveToAnotherCategory: build.mutation({
      query: ({ documentId, body }) => ({
        url: `/visaApplications/docVault/${documentId}/moveToAnotherCategory`,
        method: "POST",
        data: body,
      }),
    }),
    fetchAllExtraCategories: build.query({
      query: (visaApplicationId) => ({
        url: `/visaApplications/docVault/${visaApplicationId}/fetchAllExtraCategories`,
        method: "GET",
      }),
    }),
  }),
});

export const { useAddCategoryMutation,useDocUploadByAdminMutation,useMoveToAnotherCategoryMutation,useFetchAllExtraCategoriesQuery } = AdminDocumentVaultApi;
