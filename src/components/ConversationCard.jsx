/** @format */
import React, { useState } from "react";
import { FiMoreVertical, FiTrash2 } from "react-icons/fi";

export default function ConversationCard({
  conversation,
  onClick,
  onDelete,
  user,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const lastMsg = conversation.lastMessage?.content || "No messages yet";
  const time =
    conversation.lastMessageAt &&
    new Date(conversation.lastMessageAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const otherParticipants = conversation.participants?.filter(
    (p) => p.user._id.toString() !== user?._id.toString()
  );

  const displayAvatars = () => {
    if (!otherParticipants || otherParticipants.length === 0) {
      return (
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="avatar"
          className="w-12 h-12 rounded-full border-2 border-white shadow"
        />
      );
    }

    if (conversation.type === "individual" || otherParticipants.length === 1) {
      const person = otherParticipants[0].user;
      return (
        <img
          src={
            person.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt={person.username}
          className="w-12 h-12 rounded-full border-2 border-white shadow"
        />
      );
    }

    return (
      <div className="relative w-12 h-12">
        {otherParticipants.slice(0, 3).map((p, index) => {
          const person = p.user;
          const size = index === 0 ? "w-8 h-8" : "w-6 h-6";
          const position =
            index === 0
              ? "bottom-0 left-0"
              : index === 1
              ? "top-0 left-2"
              : "top-0 right-0";

          return (
            <img
              key={person._id}
              src={
                person.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={person.username}
              className={`${size} rounded-full border-2 border-white shadow absolute ${position} z-${
                10 + index
              }`}
            />
          );
        })}

        {otherParticipants.length > 3 && (
          <div className="absolute -bottom-1 -right-1 bg-gray-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-50">
            +{otherParticipants.length - 3}
          </div>
        )}
      </div>
    );
  };

  const displayTitle =
    conversation.type === "individual" && otherParticipants?.length === 1
      ? otherParticipants[0].user.username
      : conversation.title || "Untitled Chat";

  return (
    <div
      onClick={() => onClick(conversation)}
      className="flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-100 transition relative"
    >
      <div className="flex items-center gap-4 min-w-0">
        {displayAvatars()}

        <div className="min-w-0">
          <h3 className="font-medium text-gray-800 truncate">{displayTitle}</h3>

          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 truncate max-w-[200px]">
              {lastMsg}
            </p>

            {conversation.unreadCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        {time && <span className="text-xs text-gray-400">{time}</span>}

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 hover:bg-gray-200 rounded-full transition"
          >
            <FiMoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-8 bg-white shadow-lg border rounded-md z-50 w-48"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onDelete?.(conversation._id);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-sm w-full hover:bg-red-50 text-red-600 transition"
              >
                <FiTrash2 size={16} />
                Delete Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
