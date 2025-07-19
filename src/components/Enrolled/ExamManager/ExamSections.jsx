import React from 'react';
import { Plus, X } from 'lucide-react';
import ExamQuestion from './ExamQuestion';

const ExamSections = ({ sections, setSections }) => {
  // Add section
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        heading: '',
        description: '',
        questions: [
          { text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }
        ]
      }
    ]);
  };

  // Remove section
  const handleRemoveSection = (sectionIdx) => {
    setSections(sections.filter((_, idx) => idx !== sectionIdx));
  };

  // Update section fields
  const handleSectionChange = (sectionIdx, field, value) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx ? { ...section, [field]: value } : section
    ));
  };

  // Add question to section
  const handleAddQuestion = (sectionIdx) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? { ...section, questions: [...section.questions, { text: '', options: ['', '', '', ''], correctOption: 0, marks: 1 }] }
        : section
    ));
  };

  // Remove question from section
  const handleRemoveQuestion = (sectionIdx, questionIdx) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? { ...section, questions: section.questions.filter((_, qIdx) => qIdx !== questionIdx) }
        : section
    ));
  };

  // Update question fields
  const handleQuestionChange = (sectionIdx, questionIdx, field, value) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? {
            ...section,
            questions: section.questions.map((q, qIdx) =>
              qIdx === questionIdx ? { ...q, [field]: value } : q
            )
          }
        : section
    ));
  };

  // Handle option changes for question form
  const handleOptionChange = (sectionIdx, questionIdx, optIdx, value) => {
    setSections(sections.map((section, idx) =>
      idx === sectionIdx
        ? {
            ...section,
            questions: section.questions.map((q, qIdx) =>
              qIdx === questionIdx
                ? { ...q, options: q.options.map((opt, oIdx) => oIdx === optIdx ? value : opt) }
                : q
            )
          }
        : section
    ));
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Sections / Topics</h3>
        <button 
          type="button" 
          onClick={handleAddSection} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"
        >
          <Plus size={16} /> Add Section
        </button>
      </div>
      
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="text" 
              placeholder="Section Heading" 
              value={section.heading} 
              onChange={e => handleSectionChange(sectionIdx, 'heading', e.target.value)} 
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500" 
            />
            <button 
              type="button" 
              onClick={() => handleRemoveSection(sectionIdx)} 
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
            >
              <X size={14} /> Remove
            </button>
          </div>
          
          <textarea 
            placeholder="Section Description" 
            value={section.description} 
            onChange={e => handleSectionChange(sectionIdx, 'description', e.target.value)} 
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 mb-2 min-h-[40px]" 
          />
          
          <div className="flex items-center justify-between mb-1 mt-2">
            <span className="font-medium">Questions</span>
            <button 
              type="button" 
              onClick={() => handleAddQuestion(sectionIdx)} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs"
            >
              <Plus size={14} /> Add Question
            </button>
          </div>
          
          {section.questions.map((question, questionIdx) => (
            <ExamQuestion
              key={questionIdx}
              question={question}
              sectionIdx={sectionIdx}
              questionIdx={questionIdx}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
              onRemoveQuestion={handleRemoveQuestion}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ExamSections; 