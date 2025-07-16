import React from 'react';
import { X } from 'lucide-react';

const ExamQuestion = ({
  question,
  sectionIdx,
  questionIdx,
  onQuestionChange,
  onOptionChange,
  onRemoveQuestion
}) => {
  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 mb-2 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <input 
          type="text" 
          placeholder="Question Text" 
          value={question.text} 
          onChange={e => onQuestionChange(sectionIdx, questionIdx, 'text', e.target.value)} 
          className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
        />
        <button 
          type="button" 
          onClick={() => onRemoveQuestion(sectionIdx, questionIdx)} 
          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
        >
          <X size={14} /> Remove
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        {question.options.map((option, optIdx) => (
          <input 
            key={optIdx} 
            type="text" 
            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`} 
            value={option} 
            onChange={e => onOptionChange(sectionIdx, questionIdx, optIdx, e.target.value)} 
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
          />
        ))}
      </div>
      
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-1 text-sm font-medium">
          <input 
            type="radio" 
            name={`correctOption-${sectionIdx}-${questionIdx}`} 
            checked={question.correctOption === 0} 
            onChange={() => onQuestionChange(sectionIdx, questionIdx, 'correctOption', 0)} 
          /> A
        </label>
        <label className="flex items-center gap-1 text-sm font-medium">
          <input 
            type="radio" 
            name={`correctOption-${sectionIdx}-${questionIdx}`} 
            checked={question.correctOption === 1} 
            onChange={() => onQuestionChange(sectionIdx, questionIdx, 'correctOption', 1)} 
          /> B
        </label>
        <label className="flex items-center gap-1 text-sm font-medium">
          <input 
            type="radio" 
            name={`correctOption-${sectionIdx}-${questionIdx}`} 
            checked={question.correctOption === 2} 
            onChange={() => onQuestionChange(sectionIdx, questionIdx, 'correctOption', 2)} 
          /> C
        </label>
        <label className="flex items-center gap-1 text-sm font-medium">
          <input 
            type="radio" 
            name={`correctOption-${sectionIdx}-${questionIdx}`} 
            checked={question.correctOption === 3} 
            onChange={() => onQuestionChange(sectionIdx, questionIdx, 'correctOption', 3)} 
          /> D
        </label>
        <input 
          type="number" 
          min="1" 
          value={question.marks} 
          onChange={e => onQuestionChange(sectionIdx, questionIdx, 'marks', e.target.value)} 
          className="w-20 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
          placeholder="Marks" 
        />
      </div>
    </div>
  );
};

export default ExamQuestion; 