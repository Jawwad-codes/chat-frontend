/** @format */

import React from "react";

const Headerline = () => {
  return (
    <div className="w-full bg-gradient-to-r from-green-300 to-white text-gray-800 py-2 text-center text-xs sm:text-sm font-medium shadow-sm">
      <span className="inline-flex items-center justify-center">
        <span className="flex h-2 w-2 mr-2 relative">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="hidden sm:inline">
          Connect Instantly with Secure Chats - Your Privacy, Our Priority
        </span>
        <span className="sm:hidden">Secure Chats - Privacy First</span>
      </span>
    </div>
  );
};

export default Headerline;
