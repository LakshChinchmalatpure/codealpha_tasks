import React, { useState } from 'react';
import { FAQTopic, FAQItem } from '../types';
import { PRESET_TOPICS } from '../data';
import { Plus, Trash2, Edit2, Check, RotateCcw, Home, ShoppingBag, Cpu, Activity, ListChecks } from 'lucide-react';

interface FaqManagerProps {
  activeTopic: FAQTopic;
  onTopicChange: (topic: FAQTopic) => void;
  onUpdateFaqs: (faqs: FAQItem[]) => void;
  customTopics: FAQTopic[];
  onAddCustomTopic: (newTopic: FAQTopic) => void;
}

export const FaqManager: React.FC<FaqManagerProps> = ({
  activeTopic,
  onTopicChange,
  onUpdateFaqs,
  customTopics,
  onAddCustomTopic
}) => {
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // Suffix/Icon map matching preset keys
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-4 h-4 text-[#C4A484]" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4 text-[#C4A484]" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-[#C4A484]" />;
      case 'Activity': return <Activity className="w-4 h-4 text-[#C4A484]" />;
      default: return <ListChecks className="w-4 h-4 text-[#C4A484]" />;
    }
  };

  // Reset current topic to its factory defaults
  const handleResetTopic = () => {
    const factoryDefault = PRESET_TOPICS.find(t => t.id === activeTopic.id);
    if (factoryDefault) {
      onUpdateFaqs([...factoryDefault.faqs]);
    } else {
      onUpdateFaqs([]);
    }
  };

  // Trigger editing state for an FAQ row
  const startEditing = (item: FAQItem) => {
    setEditingFaqId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  // Save the modified FAQ row
  const saveEdit = (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    const updated = activeTopic.faqs.map(faq => 
      faq.id === id ? { ...faq, question: editQuestion.trim(), answer: editAnswer.trim() } : faq
    );
    onUpdateFaqs(updated);
    setEditingFaqId(null);
  };

  // Delete an FAQ row
  const deleteFaq = (id: string) => {
    const updated = activeTopic.faqs.filter(faq => faq.id !== id);
    onUpdateFaqs(updated);
  };

  // Add a brand-new FAQ row
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newFaq: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    };

    onUpdateFaqs([...activeTopic.faqs, newFaq]);
    setNewQuestion('');
    setNewAnswer('');
    setIsAdding(false);
  };

  // Create a whole new custom topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic: FAQTopic = {
      id: `custom-${Date.now()}`,
      name: newTopicName.trim(),
      description: newTopicDesc.trim() || 'Custom user-created vector FAQ playground.',
      icon: 'Custom',
      faqs: []
    };

    onAddCustomTopic(newTopic);
    onTopicChange(newTopic);
    setIsCreatingTopic(false);
    setNewTopicName('');
    setNewTopicDesc('');
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Topic Switcher */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4A484]">
            Select Active Knowledge Topic
          </label>
          <button
            onClick={() => setIsCreatingTopic(true)}
            className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#C4A484] flex items-center gap-1 cursor-pointer bg-white border border-[#1A1A1A]/15 px-3 py-1.5 rounded-none transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#C4A484]" />
            + New Custom domain
          </button>
        </div>

        {/* Preset topics list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...PRESET_TOPICS, ...customTopics].map((topic) => {
            const isActive = activeTopic.id === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => onTopicChange(topic)}
                className={`p-4 border text-left flex flex-col justify-between transition-all rounded-none relative cursor-pointer ${
                  isActive
                    ? 'bg-[#F5F2EE]/90 border-[#1A1A1A] shadow-[4px_4px_0_rgba(26,26,26,0.06)]'
                    : 'bg-[#FDFCFB] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 hover:bg-[#F5F2EE]/30'
                }`}
                id={`topic-btn-${topic.id}`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#C4A484]" />
                )}
                <div className="flex items-start justify-between w-full">
                  <div className={`p-2 rounded-none border border-[#1A1A1A]/10 ${isActive ? 'bg-white' : 'bg-[#F5F2EE]'}`}>
                    {getIcon(topic.icon)}
                  </div>
                  {isActive && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C4A484] font-serif italic">Active</span>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className={`text-sm tracking-tight ${isActive ? 'text-[#1A1A1A] font-bold' : 'text-[#1A1A1A]/75'}`}>
                    {topic.name}
                  </h4>
                  <p className="text-[11px] text-[#1A1A1A]/50 line-clamp-1 mt-0.5" title={topic.description}>
                    {topic.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Modal for creating custom topic */}
      {isCreatingTopic && (
        <div className="bg-[#F5F2EE] border border-[#1A1A1A]/15 rounded-none p-5 mt-2 animate-fadeIn">
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <h4 className="text-base font-serif italic text-[#1A1A1A] flex items-center gap-2">
              💡 Setup an Empty Custom Domain Sandbox
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block mb-1 text-[#1A1A1A]/70 font-semibold uppercase tracking-wider text-[9px]">Domain / Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Gym Policies, School Syllabus FAQ"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1A1A1A]/15 bg-white text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block mb-1 text-[#1A1A1A]/70 font-semibold uppercase tracking-wider text-[9px]">Description</label>
                <input
                  type="text"
                  placeholder="A short helper baseline..."
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-[#1A1A1A]/15 bg-white text-[#1A1A1A]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingTopic(false)}
                className="px-4 py-1.5 border border-[#1A1A1A]/10 bg-transparent text-[#1A1A1A] font-bold uppercase tracking-widest text-[10px] rounded-none hover:bg-black/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest text-[10px] rounded-none hover:bg-[#C4A484] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                Initialize Topic
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 3: Manage Active Document FAQs */}
      <div className="bg-[#FDFCFB] border border-[#1A1A1A]/15 rounded-none p-6 relative overflow-hidden">
        {/* Decorative branding bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#1A1A1A]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#1A1A1A]/10">
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#C4A484] font-bold block mb-1">
              Corpus Knowledge Base
            </span>
            <h3 className="text-xl font-serif text-[#1A1A1A] italic">
              Indexed Documents ({activeTopic.name})
            </h3>
            <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
              Each registered sentence represents a localized target vector document mapping the query parameters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!activeTopic.id.startsWith('custom') && (
              <button
                onClick={handleResetTopic}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 border border-[#1A1A1A]/15 bg-[#FDFCFB] text-[#1A1A1A] hover:bg-neutral-900 hover:text-white transition-colors rounded-none flex items-center gap-1.5 cursor-pointer"
                title="Restore this standard topic to its default questions."
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C4A484]" />
                Reset Presets
              </button>
            )}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#FDFCFB] bg-[#1A1A1A] hover:bg-[#C4A484] hover:text-[#1A1A1A] px-4 py-2 rounded-none flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Document
            </button>
          </div>
        </div>

        {/* Adding inline card */}
        {isAdding && (
          <form onSubmit={handleAddFaq} className="bg-[#F5F2EE] p-5 border border-[#1A1A1A]/15 mb-5 text-xs space-y-4 animate-fadeIn">
            <h4 className="font-serif italic text-sm text-[#1A1A1A] flex items-center gap-1.5">
              ✍️ Inject a New Vector Coordinates Point
            </h4>
            <div>
              <label className="block mb-1.5 text-[#1A1A1A]/65 font-semibold uppercase tracking-[0.15em] text-[8px]">Document Question (Vector Context)</label>
              <input
                type="text"
                required
                placeholder="What terms will users type to activate this answer?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-[#1A1A1A]/15 bg-white text-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-[#1A1A1A]/65 font-semibold uppercase tracking-[0.15em] text-[8px]">Matching Answer Response</label>
              <textarea
                required
                rows={2}
                placeholder="The detailed instructions or content returned on match."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-[#1A1A1A]/15 bg-white text-[#1A1A1A]"
              />
            </div>
            <div className="flex justify-end gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-1.5 border border-[#1A1A1A]/10 bg-transparent text-[#1A1A1A] font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest hover:bg-[#C4A484] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                Add & Re-index
              </button>
            </div>
          </form>
        )}

        {/* FAQs List Table */}
        {activeTopic.faqs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#1A1A1A]/20 bg-[#F5F2EE]/20 text-[#1A1A1A]/50 text-xs italic font-serif">
            This topic holds no answers. Click "+ Add Document" above to start seeding this query sandbox.
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {activeTopic.faqs.map((faq, index) => {
              const isEditing = editingFaqId === faq.id;
              return (
                <div 
                  key={faq.id} 
                  className={`p-4 border transition-all rounded-none ${
                    isEditing 
                      ? 'bg-[#F5F2EE] border-[#1A1A1A] shadow-xs' 
                      : 'bg-white border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold text-[#C4A484] mb-1">Edit Question</label>
                        <input
                          type="text"
                          value={editQuestion}
                          onChange={(e) => setEditQuestion(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#1A1A1A]/15 text-[#1A1A1A]"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider font-bold text-[#C4A484] mb-1">Edit Answer Response</label>
                        <textarea
                          rows={2}
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="w-full px-3 py-1.5 border border-[#1A1A1A]/15 text-[#1A1A1A]"
                        />
                      </div>
                      <div className="flex gap-2 justify-end text-[10px]">
                        <button
                          onClick={() => setEditingFaqId(null)}
                          className="px-3 py-1.5 border border-[#1A1A1A]/10 bg-transparent text-[#1A1A1A] font-bold uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(faq.id)}
                          className="px-3 py-1.5 bg-[#1A1A1A] text-white font-bold uppercase tracking-widest hover:bg-[#C4A484] hover:text-[#1A1A1A] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Update Indices
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-sans text-sm max-w-xl text-[#1A1A1A] leading-relaxed">
                          <span className="text-[#C4A484] font-serif italic font-bold mr-1.5">doc {index + 1}.</span>{' '}
                          {faq.question}
                        </div>
                        
                        <div className="flex items-center gap-1.5 ml-auto shrink-0">
                          <button
                            onClick={() => startEditing(faq)}
                            className="p-1 px-2 border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-[#FDFCFB] hover:bg-[#1A1A1A] text-[#1A1A1A]/60 hover:text-white cursor-pointer transition-all text-xs"
                            title="Edit Document"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="p-1 px-2 border border-red-200 hover:border-red-600 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white cursor-pointer transition-all text-xs"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2.5 text-xs text-[#1A1A1A]/65 pl-4 border-l border-[#C4A484] line-clamp-2">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

