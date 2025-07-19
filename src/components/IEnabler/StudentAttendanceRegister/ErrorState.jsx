import React from "react";
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400">Error loading attendance: {error}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState; 