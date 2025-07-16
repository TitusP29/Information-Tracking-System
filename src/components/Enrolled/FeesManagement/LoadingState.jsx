import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ message = "Loading fee management system..." }) => {
  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 min-h-screen">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState; 