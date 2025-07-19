import React from 'react';
import { Dialog } from "@headlessui/react";
import { Edit, X, Save } from 'lucide-react';

const FeesUpdateModal = ({ 
  modalOpen, 
  setModalOpen, 
  fees, 
  setFees 
}) => {
  return (
    <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-2xl w-full relative border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 text-3xl bg-slate-100 dark:bg-slate-700 rounded-full w-12 h-12 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-lg"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Edit className="text-white" size={24} />
            </div>
            <div>
              <Dialog.Title className="text-2xl font-bold text-slate-800 dark:text-slate-100">Update Fee Structure</Dialog.Title>
              <p className="text-slate-600 dark:text-slate-400">Modify fee amounts for different services</p>
            </div>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-6">
              {Object.entries(fees).map(([key, fee]) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-3 text-lg">{fee.label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">R</span>
                    <input
                      type="number"
                      value={fee.amount}
                      onChange={(e) =>
                        setFees({
                          ...fees,
                          [key]: { ...fee, amount: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full pl-8 pr-4 py-4 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 dark:text-white text-lg transition-all duration-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
            <button 
              onClick={() => setModalOpen(false)} 
              className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button 
              onClick={() => setModalOpen(false)} 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FeesUpdateModal; 