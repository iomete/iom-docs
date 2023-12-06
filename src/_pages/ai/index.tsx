"use client";
import { useEffect, useRef, useState } from "react";
import "./globals.css";

import { PaperPlaneRight, PlusCircle } from "@phosphor-icons/react";
import axios from "axios";
import Conversation from "./conversation";
import React from "react";
import { getHistory, resetHistory, search } from "./api";

function generateUserId() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationData, setConversationData] = useState<any>([]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [conversationData]);

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || generateUserId();
    localStorage.setItem("userId", storedId);
    setUserId(storedId);

    getHistory(storedId)
      .then((response) => setConversationData(response))
      .catch((error) => console.error("There was a problem fetching history:", error));
  }, []);

  const askAi = async () => {
    if (loading || !title.length) return;
    const post = { role: "user", content: title };
    setConversationData([...conversationData, post]);
    setTitle("");
    setLoading(true);

    try {
      const response = await search(userId, post);
      setConversationData(response);
    } catch (error) {
      console.error("There was a problem with the Axios request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (loading) return;
    try {
      const response = await resetHistory(userId);
      setConversationData(response);
    } catch (error) {
      console.error("There was a problem resetting history:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAi();
    }
  };

  return (
    <main className="flex-col items-center justify-center w-screen h-screen px-2 lg:px-24 md:px-24 sm:px-8">
      <div className="w-full p-6 mb-3 text-black h-1/6 md:mb-0">
        <h1 className="mb-4 text-3xl font-bold leading-none text-center text-gray-600 whitespace-pre md:text-4xl lg:text-5xl">
          IOMETE Bot{" "}
          <span className="px-2 py-1 text-lg text-green-600 border-2 border-green-600 border-solid rounded-md" style={{ verticalAlign: "middle" }}>
            Experiment
          </span>
        </h1>
        <p className="text-2xl text-center text-gray-500 sm:text-xl">Tell me what you'd like to learn about employing IOMETE.</p>
      </div>
      <div className="w-full overflow-y-auto text-black h-4/6 chat-content" ref={chatContainerRef}>
        {!conversationData?.length && (
          <div className="flex items-center justify-center h-full">
            <div role="status" className="flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span>Loading chat history...</span>
            </div>
          </div>
        )}
        {conversationData?.length > 0 && <Conversation loading={loading} conversations={conversationData} />}
      </div>
      <div className="flex flex-col w-full text-black h-1/6 justify-evenly">
        <span className="bg-gray-300 h-[2px]"></span>
        <div className="flex items-center justify-center w-full px-4">
          <a className="w-auto text-blue-500 cursor-pointer whitespace-nowrap" onClick={() => handleReset()}>
            <div className="flex items-center gap-2 ">
              <span>New topic</span>
              <PlusCircle size={20} />
            </div>
          </a>

          <form onSubmit={handleSubmit} className="w-full px-4">
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only ">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <textarea
                id="default-search"
                rows={1}
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg resize-none bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search docs..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleSubmit}
                required
              />
              <button
                type="submit"
                onClick={() => askAi()}
                disabled={loading}
                className="text-white absolute right-2.5 bottom-[7px] bg-[#3c82f6] hover:bg-[#3c82f6] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 pt-2 h-10 w-[54px] cursor-pointer border-0"
              >
                {loading ? (
                  <span>
                    <svg
                      aria-hidden="true"
                      className="text-gray-200 animate-spin fill-gray-300"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </span>
                ) : (
                  <PaperPlaneRight size={22} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
