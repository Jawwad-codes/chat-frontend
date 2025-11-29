/** @format */

import React from "react";

const Headerline = () => {
  return (
    <div className="w-full bg-emerald-50/60 backdrop-blur-sm border-b border-emerald-100 py-2.5">
      <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium text-emerald-900">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <p className="tracking-tight">
          <span className="font-semibold">Live:</span>
          <span className="ml-1.5 hidden sm:inline">
            Connect Instantly — Your Privacy is Our Priority
          </span>
          <span className="ml-1.5 sm:hidden">Instant & Private Messaging</span>
        </p>
      </div>
    </div>
  );
};

export default Headerline;
