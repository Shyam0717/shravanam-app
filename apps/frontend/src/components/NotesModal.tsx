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

  // Handle escape key and lock page scroll — only while open. (Every lecture card renders one of
  // these, so a closed modal must never touch body styles, or it undoes other scroll locks.)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const save = () => {
    onSave(noteText);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-sage-100 dark:bg-sage-900 flex items-center justify-center">
                <FileText className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              </div>
              <div className="min-w-0">
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
            <div className="flex shrink-0 items-center gap-2">
              {/* Phones: Save sits up here, where the on-screen keyboard can't cover it */}
              <button onClick={save} className="btn-primary px-4 py-2 text-sm sm:hidden">
                Save
              </button>
              <button
                onClick={onClose}
                aria-label="Close notes"
                className="btn-icon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 sm:p-6">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your reflections, insights, and key takeaways from this lecture..."
            className="input-field min-h-[200px] flex-1 resize-none leading-relaxed sm:min-h-[280px]"
            autoFocus
          />
          <p className="text-xs text-foreground-muted mt-2">
            Tip: Note down verses, key points, and how to apply these teachings.
          </p>
        </div>

        {/* Footer */}
        <div className="hidden p-6 border-t border-neutral-200 dark:border-neutral-700 sm:flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="btn-primary"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
