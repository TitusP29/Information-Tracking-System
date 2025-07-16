import React from "react";
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error }) => {
  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error loading system: {error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 