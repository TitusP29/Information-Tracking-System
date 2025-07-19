import React from 'react';
import { BookOpen, FileText, Award } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'materials', label: 'Study Materials', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

  return (
    <div className="flex border-b mb-6">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon className="inline mr-2" size={18} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation; 