/** @format */
import React, { useState, useEffect } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/api/chat";

export default function CreateConversationModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
  user,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [conversationTitle, setConversationTitle] = useState("");

  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length > 2,
  });

  // Add user
  const handleUserSelect = (user) => {
    if (!selectedUsers.find((u) => u.username === user.username)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setSearchQuery("");
  };

  // Remove user
  const handleRemoveUser = (username) => {
    setSelectedUsers((prev) => prev.filter((u) => u.username !== username));
  };

  // Create conversation
  const handleCreate = () => {
    if (selectedUsers.length === 0) return;

    onCreate({
      title:
        conversationTitle || selectedUsers.map((u) => u.username).join(", "),
      participants: selectedUsers.map((u) => u.username),
    });

    // Reset
    setSelectedUsers([]);
    setConversationTitle("");
    setSearchQuery("");
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setConversationTitle("");
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            New Conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Selected Participants */}
        {selectedUsers.length > 0 && (
          <div className="p-5 border-b border-gray-200">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Participants:
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.username}
                  className="flex items-center gap-2 bg-emerald-100 px-3 py-1 rounded-full"
                >
                  <span className="text-sm text-emerald-800">
                    {user.username}
                  </span>
                  <button
                    onClick={() => handleRemoveUser(user.username)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Group Name */}
        <div className="p-5 border-b border-gray-200">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Group Name (Optional)
          </label>
          <input
            type="text"
            value={conversationTitle}
            onChange={(e) => setConversationTitle(e.target.value)}
            placeholder="Enter group name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
          />
        </div>

        {/* User Search */}
        <div className="p-5 border-b border-gray-200">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Add Participants
          </label>
          <div className="relative mb-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
            />
          </div>

          {searchQuery.length > 2 && (
            <div className="max-h-40 overflow-y-auto border rounded-lg shadow-inner">
              {searching ? (
                <div className="p-3 text-center text-gray-500">
                  Searching...
                </div>
              ) : searchResults?.data?.users?.length > 0 ? (
                searchResults.data.users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition"
                    onClick={() => handleUserSelect(user)}
                  >
                    <img
                      src={
                        user?.avatar?.startsWith("http")
                          ? user.avatar
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selectedUsers.length === 0 || isLoading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
