import axios from "axios";

const baseURL = "http://127.0.0.1:8000"; // Replace with your actual base URL

export const getHistory = async (userId: string) => {
  const apiUrl = `${baseURL}/get_history/${userId}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error;
  }
};

export const search = async (userId: string, post: { role: string; content: string }) => {
  const apiUrl = `${baseURL}/search/${userId}`;
  try {
    const response = await axios.post(apiUrl, post, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.history;
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
};

export const resetHistory = async (userId: string) => {
  const apiUrl = `${baseURL}/reset_history/${userId}`;
  try {
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error("Error resetting history:", error);
    throw error;
  }
};
