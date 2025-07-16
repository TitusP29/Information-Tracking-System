import React from "react";
import { Loader2 } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading your attendance records...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState; 