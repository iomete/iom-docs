"use client";
import { useEffect, useRef, useState } from "react";
import "./globals.css";

import { PaperPlaneRight } from "@phosphor-icons/react";
import axios from "axios";
import Conversation from "../ai/conversation";
import React from "react";

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

  // Function to fetch the list
  useEffect(() => {
    let storedId = localStorage.getItem("userId");

    if (storedId) {
      setUserId(storedId);
    } else {
      const newUserId = generateUserId();
      localStorage.setItem("userId", newUserId);
      storedId = newUserId;
      setUserId(newUserId);
    }

    const apiUrl = `http://127.0.0.1:8000/get_history/${storedId}`;

    axios
      .get(apiUrl) // Replace with your actual API endpoint
      .then((response) => {
        console.log("hostory-->", history);
        setConversationData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching list:", error);
      });
  }, []);

  const askAi = async () => {
    const post = { role: "user", content: title };
    let newData = [...conversationData, post];
    setConversationData(newData);
    setTitle("");
    console.log("stroe id", userId);
    const apiUrl = `http://127.0.0.1:8000/search/${userId}`;
    setLoading(true);
    axios
      .post(apiUrl, post, {
        headers: {
          "Content-Type": "application/json",
          // You may need to include additional headers like authentication tokens if required
        },
      })
      .then((response) => {
        console.log("response-->", response.data);

        setConversationData(response.data.history);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was a problem with the Axios request:", error);
        setLoading(false);
      });
  };

  const handleSubmit = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (loading) {
        return;
      }

      askAi();
    }
  };

  const handleReset = async () => {
    const apiUrl = `http://localhost:8000/reset_history/${userId}`;

    axios
      .get(apiUrl)
      .then((response) => {
        console.log("log-->", response);
        setConversationData(response.data);
      })
      .catch((error) => {
        // setError(error.response?.data || "An error occurred");
      });
  };

  // Function to scroll to the bottom of the chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Use the useEffect hook to scroll to the bottom whenever conversationData changes
  useEffect(() => {
    scrollToBottom();
  }, [conversationData]);

  return (
    <main className="h-screen w-screen flex-col justify-center items-center lg:px-24 md:px-24 sm:px-8 px-2">
      <div className="text-black w-full h-1/6 p-6 mb-3 md:mb-0">
        <h1 className=" text-3xl mb-4 text-center font-bold leading-none text-gray-600   md:text-4xl lg:text-5xl whitespace-pre">
          IOMETE AI Search Engine{" "}
          <span className="text-lg  border-2 rounded-md px-2 py-1 border-green-600 text-green-600" style={{ verticalAlign: "middle" }}>
            Experiment
          </span>
        </h1>
        <p className="text-gray-500 sm:text-xl text-2xl  text-center">Feel free to ask me any questions you have about using IOMETE</p>
      </div>
      <div className="text-black w-full h-4/6 overflow-y-auto chat-content" ref={chatContainerRef}>
        {!conversationData?.length && (
          <div className="flex justify-center items-center h-full">
            <div role="status" className="flex justify-center items-center">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin  fill-blue-600"
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
      <div className="text-black w-full h-1/6  flex flex-col justify-evenly">
        <span className="bg-gray-300 h-[2px]"></span>
        <div className="flex justify-center items-center w-full px-4">
          <a className="w-auto text-blue-500 cursor-pointer whitespace-nowrap" onClick={() => handleReset()}>
            New topic
          </a>

          <form onSubmit={handleSubmit} className="px-4 w-full">
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
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 "
                placeholder="Search docs..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleSubmit}
                required
              />
              <button
                type="submit"
                onClick={() => askAi()}
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 "
              >
                {loading ? (
                  <>
                    <svg
                      aria-hidden="true"
                      className=" h-5  text-gray-200 animate-spin  fill-blue-600"
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
                  </>
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
