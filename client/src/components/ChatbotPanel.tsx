import React, { useRef, useEffect, useState } from "react";
import { IconButton, Drawer } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Icon } from "@iconify/react";
import {
  useFetchAllMessagesQuery,
  useMoveToDocVaultMutation,
  useSendFileMutation,
  useSendTextMessageMutation,
} from "../features/chat/chatApi";
import { formatDate } from "../utils/FormateDate";
import ChatMessage from "./ChatMessage";
import { toast } from "react-toastify";

interface ChatbotPanelProps {
  chatVisible: boolean;
  setChatVisible: React.Dispatch<React.SetStateAction<boolean>>;
  visaApplicationId: string | undefined;
  source: string;
}

interface Message {
  _id: string;
  textMsg: string;
  senderType: "User" | "Admin";
  createdAt: string;
  fileName: string;
  fileUrl: string;
}

const ChatbotPanel = ({
  chatVisible,
  setChatVisible,
  visaApplicationId,
  source,
}: ChatbotPanelProps) => {

  const [chatData, setChatData] = useState<Record<string, Message[]> | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [isPendingMessage, setIsPendingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: fetchedChatData,
    isLoading,
    refetch,
  } = useFetchAllMessagesQuery(visaApplicationId, { skip: !visaApplicationId });

  const [sendTextMessage, { isLoading: isSending }] =
    useSendTextMessageMutation();

  const [sendFile] = useSendFileMutation();

  const [moveToDocVault] = useMoveToDocVaultMutation();

  useEffect(() => {
    if (chatVisible && fetchedChatData?.success && fetchedChatData.data) {
      setChatData(fetchedChatData.data);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [chatVisible, fetchedChatData]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && visaApplicationId) {
      setIsPendingMessage(true);
      try {
        await sendFile({ file, visaApplicationId }).unwrap();
        await refetch();
      } catch (error) {
        console.error("Failed to upload file:", error);
      } finally {
        setIsPendingMessage(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !visaApplicationId) return;

    setIsPendingMessage(true);
    try {
      await sendTextMessage({
        visaApplicationId,
        body: { textMsg: message },
      }).unwrap();

      setMessage("");
      await refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsPendingMessage(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleMoveToVault = async (
    messageId: string,
    fileName: string | undefined,
    categoryName: string
  ) => {
    try {
      const body = {
        docName: fileName,
        categoryName,
      };
      await moveToDocVault({ body, messageId });
      toast.success(`File moved to Document Vault ${categoryName}.`);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong. Try again.");
    }
  };

  const panelContent = (
    <div className="flex flex-col h-full w-full md:w-[400px] rounded-3xl bg-white shadow-lg">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-golden-yellow-200 rounded-t-3xl">
        <p className="flex font-semibold text-neutrals-950 gap-2">
          <Icon icon="icon-park-outline:wechat" width="24px" height="24px" />
          Chat Support
        </p>
        <button
          onClick={() => setChatVisible(false)}
          className="text-xl cursor-pointer hover:scale-105 duration-100 hover:font-extrabold"
        >
          ✖
        </button>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="p-4 overflow-y-auto flex flex-col space-y-2 bg-white">
            {[...Array(11)].map((_, i) => (
              <div
                key={i}
                className={`flex ${
                  i % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div className="h-10 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : !chatData || Object.keys(chatData).length === 0 ? (
          <div className="text-center mt-[70%]">
            <p className="text-gray-500">No messages yet.</p>
          </div>
        ) : (
          Object.entries(chatData)
            .sort(
              ([dateA], [dateB]) =>
                new Date(dateA).getTime() - new Date(dateB).getTime()
            )
            .map(([date, messages]) => (
              <div key={date}>
                <p className="text-center text-xs text-gray-500 mb-2">
                  {formatDate(date)}
                </p>
                {messages
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                  .map((msg, index) => (
                    <ChatMessage
                      visaApplicationId={visaApplicationId || ""}
                      messageId={msg._id}
                      key={index}
                      sender={msg.senderType.toLowerCase()}
                      message={msg.textMsg}
                      timeOfMsg={new Date(msg.createdAt)
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toUpperCase()}
                      fileName={msg.fileName}
                      fileUrl={msg.fileUrl}
                      handleMoveToVault={handleMoveToVault}
                      source={source}
                    />
                  ))}
              </div>  
          ))   
        )}
        {isPendingMessage && (
    <div className="flex justify-end mt-2">
      <div className="h-14 bg-gray-300 rounded-xl w-[60%] animate-pulse" />
    </div>
  )}
        <div ref={messagesEndRef} />
      </div>

      {/* input */}
      <div className="p-4 border-t border-gray-300 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-gray-400 rounded-2xl focus:outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <IconButton onClick={handleSendMessage} disabled={isSending}>
          <SendIcon sx={{ color: "black" }} />
        </IconButton>
        <IconButton onClick={handleFileUploadClick}>
          <FileUploadIcon sx={{ color: "black" }} />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpeg,.jpg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );

  return (
    <Drawer
      anchor="right"
      open={chatVisible}
      onClose={() => setChatVisible(false)}
      PaperProps={{
        sx: {
          transition: "transform 0.4s ease-in-out !important",
          width: {
            xs: "100%",
            sm: "100%",
            md: "400px",
          },
          borderTopLeftRadius: "24px",
          borderBottomLeftRadius: "24px",
        },
      }}
    >
      {panelContent}
    </Drawer>
  );
};

export default ChatbotPanel;
