import React from 'react';
import { DollarSign, Edit, RefreshCw } from 'lucide-react';

const FeesHeader = ({ onRefresh, onUpdateFees }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
            <DollarSign className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-purple-800 dark:from-slate-100 dark:to-purple-100">
              Fees Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
              Manage student payments and fee structures
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onRefresh}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button 
            onClick={onUpdateFees} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-3 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
          >
            <Edit size={20} />
            Update Fees
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeesHeader; 