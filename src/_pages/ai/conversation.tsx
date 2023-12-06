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
    <div className="min-h-full p-4 rounded-lg shadow-md chat">
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
            <div className="flex items-center gap-2">
              <div className="flex p-1 border border-gray-300 border-solid rounded-full">
                {/* <Robot size={38} weight="duotone" className="text-emerald-500" /> */}
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309.96 309.96" height={28}>
                  <title>Artboard 1</title>
                  <path
                    className="cls-1"
                    d="M40.21,275.44V82a6,6,0,0,1,2.68-5L153.3,2.43c4.16-2.81,9.87.07,9.87,5V200.86a6,6,0,0,1-2.69,5L50.08,280.42C45.92,283.24,40.21,280.35,40.21,275.44ZM61.49,92.74v143.2c0,4.91,5.71,7.79,9.87,5L139.2,195.1a6,6,0,0,0,2.69-5V46.92c0-4.91-5.71-7.8-9.88-5L64.18,87.75A6,6,0,0,0,61.49,92.74Z"
                  />
                  <path
                    className="cls-2"
                    d="M92.23,289.18V95.73a6,6,0,0,1,2.68-5L205.32,16.17c4.16-2.81,9.87.07,9.87,5V214.6a6,6,0,0,1-2.69,5L102.1,294.16C97.94,297,92.23,294.09,92.23,289.18Zm21.28-182.71v143.2c0,4.92,5.71,7.8,9.87,5l67.84-45.82a6,6,0,0,0,2.69-5V60.65c0-4.91-5.71-7.79-9.87-5L116.2,101.49A6,6,0,0,0,113.51,106.47Z"
                  />
                  <path d="M149,302.91V109.46a6,6,0,0,1,2.69-5L262.07,29.9c4.16-2.81,9.87.07,9.87,5V228.33a6,6,0,0,1-2.69,5L158.85,307.9C154.69,310.71,149,307.82,149,302.91Zm21.28-182.7v143.2c0,4.91,5.71,7.79,9.87,5L248,222.57a6,6,0,0,0,2.69-5V74.39c0-4.91-5.71-7.8-9.87-5L173,115.22A6,6,0,0,0,170.26,120.21Z" />
                </svg>
              </div>

              <MarkdownPreview
                wrapperElement={{
                  "data-color-mode": "light",
                }}
                style={{ borderRadius: "14px 14px 14px 2px", color: "#4b5563" }}
                className="border border-solid border-gray-200 py-2.5 px-4 max-w-[90%] chat"
                source={message?.content}
              />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="flex items-center gap-2">
          {/* <Robot size={38} weight="duotone" className="text-emerald-500" /> */}
          <div className="flex p-1 border border-gray-300 border-solid rounded-full">
            {/* <Robot size={38} weight="duotone" className="text-emerald-500" /> */}
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 309.96 309.96" height={28}>
              <title>Artboard 1</title>
              <path
                className="cls-1"
                d="M40.21,275.44V82a6,6,0,0,1,2.68-5L153.3,2.43c4.16-2.81,9.87.07,9.87,5V200.86a6,6,0,0,1-2.69,5L50.08,280.42C45.92,283.24,40.21,280.35,40.21,275.44ZM61.49,92.74v143.2c0,4.91,5.71,7.79,9.87,5L139.2,195.1a6,6,0,0,0,2.69-5V46.92c0-4.91-5.71-7.8-9.88-5L64.18,87.75A6,6,0,0,0,61.49,92.74Z"
              />
              <path
                className="cls-2"
                d="M92.23,289.18V95.73a6,6,0,0,1,2.68-5L205.32,16.17c4.16-2.81,9.87.07,9.87,5V214.6a6,6,0,0,1-2.69,5L102.1,294.16C97.94,297,92.23,294.09,92.23,289.18Zm21.28-182.71v143.2c0,4.92,5.71,7.8,9.87,5l67.84-45.82a6,6,0,0,0,2.69-5V60.65c0-4.91-5.71-7.79-9.87-5L116.2,101.49A6,6,0,0,0,113.51,106.47Z"
              />
              <path d="M149,302.91V109.46a6,6,0,0,1,2.69-5L262.07,29.9c4.16-2.81,9.87.07,9.87,5V228.33a6,6,0,0,1-2.69,5L158.85,307.9C154.69,310.71,149,307.82,149,302.91Zm21.28-182.7v143.2c0,4.91,5.71,7.79,9.87,5L248,222.57a6,6,0,0,0,2.69-5V74.39c0-4.91-5.71-7.8-9.87-5L173,115.22A6,6,0,0,0,170.26,120.21Z" />
            </svg>
          </div>

          <div className="px-4 py-5 border border-gray-200 border-solid loading-dots" style={{ borderRadius: "14px 14px 14px 2px" }}>
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
