/** @format */
import axios from "axios";
import Cookies from "js-cookie";
import io from "socket.io-client";

const API_URL =
  `${import.meta.env.VITE_API_URL}/chat` || "http://localhost:7000/api/chat";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:7000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${Cookies.get("auth_token")}` },
});

// api calls

export const getConversations = async () => {
  const res = await axios.get(`${API_URL}/conversations`, authHeader());
  return res.data;
};

export const getConversationDetail = async (conversationId) => {
  const res = await axios.get(
    `${API_URL}/conversations/${conversationId}`,
    authHeader()
  );
  return res.data;
};

export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const res = await axios.get(
    `${API_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    authHeader()
  );
  return res.data;
};

export const createConversation = async (data) => {
  const res = await axios.post(`${API_URL}/conversations`, data, authHeader());
  return res.data;
};

export const searchUsers = async (query) => {
  const res = await axios.get(
    `${API_URL}/users?search=${encodeURIComponent(query)}`,
    authHeader()
  );
  return res.data;
};

export const deleteConversation = async (conversationId) => {
  return await axios.delete(
    `${API_URL}/conversations/${conversationId}`,
    authHeader()
  );
};

// sockets functions

let socket = null;

export const connectSocket = () => {
  const token = Cookies.get("auth_token");

  if (socket?.connected) return socket;

  // if socket exists but disconnected THEN clean it up
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => console.log("Socket connected:", socket.id));
  socket.on("disconnect", () => console.log("Socket disconnected"));
  socket.on("connect_error", (error) =>
    console.error("Socket connection error:", error)
  );

  return socket;
};

export const getSocket = () => socket;

export const joinConversationRoom = (conversationId) => {
  if (socket) {
    socket.emit("joinConversation", JSON.stringify({ conversationId }));
  }
};

export const leaveConversationRoom = (conversationId) => {
  if (socket) {
    socket.emit("leaveConversation", JSON.stringify({ conversationId }));
  }
};

export const sendMessageViaSocket = (
  conversationId,
  content,
  _tempId = null
) => {
  if (socket) {
    const messageData = {
      conversationId,
      content,
      _tempId,
      messageType: "text",
    };
    socket.emit("sendMessage", JSON.stringify(messageData));
  }
};

export const editMessageViaSocket = (messageId, conversationId, newContent) => {
  if (socket) {
    const editData = {
      messageId,
      conversationId,
      content: newContent,
    };
    socket.emit("editMessage", JSON.stringify(editData));
  }
};

export const deleteMessageViaSocket = (messageId, conversationId) => {
  if (socket) {
    const deleteData = {
      messageId,
      conversationId,
    };
    socket.emit("deleteMessage", JSON.stringify(deleteData));
  }
};

export const onReceiveMessage = (callback) => {
  if (socket) {
    socket.off("receiveMessage");
    socket.on("receiveMessage", (data) => {
      const message = data.message || data;
      callback(message);
    });
  }
};

export const onMessageSent = (callback) => {
  if (socket) {
    socket.off("messageSent");
    socket.on("messageSent", (data) => {
      const message = data.message || data;
      callback(message);
    });
  }
};

export const onMessageEdited = (callback) => {
  if (socket) {
    socket.off("messageEdited");
    socket.on("messageEdited", (data) => {
      const message = data.message || data;
      callback(message);
    });
  }
};

export const onMessageDeleted = (callback) => {
  if (socket) {
    socket.off("messageDeleted");
    socket.on("messageDeleted", (data) => {
      callback(data);
    });
  }
};

export const onMessageError = (callback) => {
  if (socket) {
    socket.off("messageError");
    socket.on("messageError", (error) => {
      callback(error);
    });
  }
};

export const onReady = (callback) => {
  if (socket) {
    socket.off("ready");
    socket.on("ready", (data) => {
      callback(data);
    });
  }
};

export const removeSocketListeners = () => {
  if (socket) {
    socket.off("receiveMessage");
    socket.off("messageSent");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("messageError");
    socket.off("ready");
    socket.off("joined");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    removeSocketListeners();
    socket.disconnect();
    socket = null;
  }
};
