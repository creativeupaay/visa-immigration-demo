import { baseApi } from "../../app/api";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendTextMessage: build.mutation({
      query: ({ body, visaApplicationId }) => ({
        url: `/visaApplications/chats/${visaApplicationId}/messageSend`,
        method: "POST",
        data: body,
      }),
    }),
    fetchAllMessages: build.query({
      query: (visaApplicationId) => ({
        url: `/visaApplications/chats/${visaApplicationId}/fetchChatMessages`,
        method: "GET",
      }),
    }),
    sendFile: build.mutation({
      query: ({ file, visaApplicationId }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/visaApplications/chats/${visaApplicationId}/sendFile`,
          method: "POST",
          data: formData,
        };
      },
    }),
    moveToDocVault: build.mutation({
      query: ({ body, messageId }) => ({
        url: `/visaApplications/chats/${messageId}/moveToDocVault`,
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useSendTextMessageMutation,
  useFetchAllMessagesQuery,
  useSendFileMutation,
  useMoveToDocVaultMutation,
} = chatApi;
