import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Robot, UserCircle } from "@phosphor-icons/react";
import "./globals.css";

interface Message {
  role: string;
  content: string;
}

interface ConversationProps {
  conversations: Message[];
  loading: boolean;
}

function Conversation({ conversations, loading }: ConversationProps) {
  return (
    <div className="p-4 rounded-lg shadow-md min-h-full">
      {conversations.map((message, index) => (
        <div key={index} className={`${message?.role === "user" ? "text-right" : "text-left"} mb-8`}>
          {message.role === "user" && (
            <div className="flex items-center justify-end">
              <MarkdownPreview
                style={{ borderRadius: "14px 14px 2px 14px", backgroundColor: "#3c82f6", color: "white" }}
                className="border py-2.5 px-4 max-w-[90%] "
                source={message?.content}
              />
              <UserCircle size={38} className="text-emerald-500" weight="duotone" />
            </div>
          )}

          {message.role !== "user" && (
            <div className="flex items-center ">
              <Robot size={38} weight="duotone" className="text-emerald-500" />
              <MarkdownPreview
                wrapperElement={{
                  "data-color-mode": "light",
                }}
                style={{ borderRadius: "14px 14px 14px 2px", color: "#4b5563" }}
                className="border py-2.5 px-4 max-w-[90%]"
                source={message?.content}
              />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex items-center ">
          <Robot size={38} weight="duotone" className="text-emerald-500" />

          <div className="loading-dots px-4 py-5 bg-[#e2e7ff] border" style={{ borderRadius: "14px 14px 14px 2px" }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {!conversations?.length && <>No data</>}
    </div>
  );
}

export default Conversation;
