/** @format */
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Loader2,
  CheckCheck,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getProfile } from "@/api/auth";
import {
  getConversationDetail,
  getMessages,
  connectSocket,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  sendMessageViaSocket,
  editMessageViaSocket,
  deleteMessageViaSocket,
  onReceiveMessage,
  onMessageSent,
  onMessageEdited,
  onMessageDeleted,
  onMessageError,
  onReady,
  removeSocketListeners,
} from "@/api/chat";

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const pendingOperations = useRef(new Set());

  // Current User
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const currentUser = profileData?.data?.user;

  // Conversation
  const { data: convData, isLoading: loadingConv } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationDetail(conversationId),
    enabled: !!conversationId,
  });
  const conversation = convData?.data?.conversation;

  // Messages
  const { data: msgData } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (msgData?.data?.messages) {
      const sorted = [...msgData.data.messages].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sorted);
    }
  }, [msgData]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };
  useEffect(() => scrollToBottom(), [messages.length, editingMessage]);

  // SOCKET
  useEffect(() => {
    if (!conversationId || !currentUser) return;

    console.log("🔌 Setting up socket for conversation:", conversationId);
    const socket = connectSocket();

    // Set up message listeners FIRST before any events
    const handleIncomingMessage = (msg) => {
      setMessages((prev) => {
        // Simple duplicate check by _id
        if (prev.some((m) => m._id === msg._id)) {
          return prev;
        }

        // Add new message
        return [...prev, msg];
      });
    };

    // Separate handler for messageSent (own messages)
    const handleMessageSent = (msg) => {
      // only show messages for current conversation
      if (msg.conversation !== conversationId) {
        return;
      }
      handleIncomingMessage(msg);
    };

    // separate handler for receiveMessage (messages from others)
    const handleReceiveMessage = (msg) => {
      // skip if message is from current user (already handled by messageSent)
      if (msg.sender?._id === currentUser?._id) {
        return;
      }
      // only show messages for current conversation
      if (msg.conversation !== conversationId) {
        return;
      }
      handleIncomingMessage(msg);
    };

    // set up all message listeners BEFORE connecting/joining
    onMessageSent(handleMessageSent);
    onReceiveMessage(handleReceiveMessage);

    onMessageEdited((updated) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === updated._id
            ? { ...m, ...updated, isEdited: true, isOptimistic: false }
            : m
        )
      );
      pendingOperations.current.delete(`edit-${updated._id}`);
    });

    onMessageDeleted((data) => {
      setMessages((prev) => prev.filter((m) => m._id !== data.messageId));
      pendingOperations.current.delete(`delete-${data.messageId}`);
    });

    onMessageError((err) => {
      alert(err.message || "Failed to send");
    });

    // Now set up connection listeners
    socket.on("connect", () => {
      setConnectionStatus("connected");
    });
    
    socket.on("disconnect", () => {
      setConnectionStatus("connecting");
    });

    onReady(() => {
      setConnectionStatus("ready");
      joinConversationRoom(conversationId);
    });

    return () => {
      leaveConversationRoom(conversationId);
      removeSocketListeners();
      // Force disconnect so fresh connection is made next time
      const socket = getSocket();
      if (socket) {
        socket.disconnect();
      }
    };
  }, [conversationId, currentUser]);

  // Send / Edit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (editingMessage) {
      const opKey = `edit-${editingMessage.id}`;
      if (pendingOperations.current.has(opKey)) return;
      pendingOperations.current.add(opKey);

      setMessages((prev) =>
        prev.map((m) =>
          m._id === editingMessage.id
            ? { ...m, content: inputText.trim(), isOptimistic: true }
            : m
        )
      );

      editMessageViaSocket(editingMessage.id, conversationId, inputText.trim());
      setEditingMessage(null);
      setInputText("");
      return;
    }

    // Just send message, no optimistic UI
    const messageContent = inputText.trim();
    setInputText(""); // Clear input immediately
    sendMessageViaSocket(conversationId, messageContent);
  };

  const startEditing = (msg) => {
    setEditingMessage({ id: msg._id, content: msg.content });
    setInputText(msg.content);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setInputText("");
  };

  const deleteMessage = (msgId) => {
    if (!confirm("Delete this message?")) return;
    pendingOperations.current.add(`delete-${msgId}`);
    setMessages((prev) => prev.filter((m) => m._id !== msgId));
    deleteMessageViaSocket(msgId, conversationId);
  };

  // Determine chat partner (first participant who is not current user)
  const chatPartner = conversation?.participants?.find(
    (p) => p.user._id !== currentUser?._id
  )?.user;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="flex-none h-16 px-4 flex items-center justify-between border-b bg-slate-800 border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 text-gray-300 hover:bg-slate-700 hover:text-white"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft size={20} />
          </Button>

          <div className="flex items-center gap-3">
            <img
              src={
                chatPartner?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={chatPartner?.username || "Chat"}
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />
            <div>
              <h2 className="font-semibold text-white text-sm">
                {conversation?.displayTitle || chatPartner?.username || "Chat"}
              </h2>
              <p className="text-xs text-white">
                {connectionStatus === "ready" ? "Online" : "Connecting..."}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages - Centered container for better UX on wide screens */}
      <div className="flex-1 overflow-y-auto bg-gray-100 flex justify-center">
        <div className="w-full max-w-4xl p-4 space-y-3">
        {messages.map((msg, index) => {
          const isMe = msg.sender?._id === currentUser?._id;
          const isPending =
            pendingOperations.current.has(`edit-${msg._id}`) ||
            pendingOperations.current.has(`delete-${msg._id}`);

          const isSameSender =
            index > 0 && messages[index - 1].sender?._id === msg.sender?._id;

          return (
            <div
              key={msg._id || msg._tempId}
              className={`flex w-full ${
                isMe ? "justify-end" : "justify-start"
              } ${isPending ? "opacity-60" : ""} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex max-w-[85%] group relative ${
                  isMe ? "flex-row-reverse" : "flex-row"
                } items-end gap-2`}
              >
                {!isMe && !isSameSender && (
                  <img
                    src={
                      msg.sender?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    alt="avatar"
                  />
                )}
                {!isMe && isSameSender && <div className="w-8" />}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-md"
                  } ${msg.isOptimistic ? "opacity-80" : ""}`}
                >
                  {/* Show username for group chats */}
                  {conversation?.type === "group" && !isMe && (
                    <div className={`font-semibold text-xs mb-1 ${
                      isMe ? "text-white" : "text-emerald-600"
                    }`}>
                      {msg.sender?.username || "Unknown"}
                    </div>
                  )}
                  {msg.content}

                  <div
                    className={`flex items-center gap-1 justify-end text-xs mt-1 ${
                      isMe ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {msg.isEdited && <span>(edited)</span>}
                    <span>
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                    {isMe && (
                      <span>
                        {msg.isOptimistic ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCheck size={12} />
                        )}
                      </span>
                    )}
                  </div>

                  {isMe && !msg.isOptimistic && !isPending && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-6 w-6 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50"
                          >
                            <MoreVertical size={12} className="text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => startEditing(msg)}>
                            <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMessage(msg._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="flex-none bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto w-full relative">
          {editingMessage && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
              <div className="flex items-center justify-between">
                <span>Editing message</span>
                <button
                  onClick={cancelEditing}
                  className="hover:bg-yellow-100 rounded p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                editingMessage ? "Update message..." : "Type a message..."
              }
              className="flex-1 bg-gray-50 border-gray-300 rounded-full px-4 py-2"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputText.trim()}
              className={`rounded-full h-10 w-10 ${
                inputText.trim()
                  ? "bg-emerald-700 hover:bg-emerald-700 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {editingMessage ? <CheckCheck size={18} /> : <Send size={18} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
