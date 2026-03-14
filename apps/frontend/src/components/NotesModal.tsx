'use client';

import { useState, useEffect } from 'react';
import { FileText, X } from 'lucide-react';

interface NotesModalProps {
  isOpen: boolean;
  notes: string;
  lectureTitle?: string;
  onClose: () => void;
  onSave: (notes: string) => void;
}

export function NotesModal({ isOpen, notes, lectureTitle, onClose, onSave }: NotesModalProps) {
  const [noteText, setNoteText] = useState(notes);

  useEffect(() => {
    setNoteText(notes);
  }, [notes]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Lecture Notes
                </h3>
                {lectureTitle && (
                  <p className="text-sm text-foreground-muted line-clamp-1">
                    {lectureTitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-icon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your reflections, insights, and key takeaways from this lecture..."
            className="input-field min-h-[280px] resize-none leading-relaxed"
            autoFocus
          />
          <p className="text-xs text-foreground-muted mt-2">
            Tip: Note down verses, key points, and how to apply these teachings.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(noteText);
              onClose();
            }}
            className="btn-primary"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
