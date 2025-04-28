import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNext?.();
  };

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrevious?.();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={styles.modalOverlay} 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        role="document"
      >
        <div className={styles.modalHeader}>
          {title && <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>}
          <button 
            className={styles.closeButton} 
            onClick={onClose} 
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
      <div className={styles.modalNavigation}>
        {!hasPrevious && hasNext && (
          <button 
            className={styles.navButton}
            onClick={handleNext}
            aria-label="Next incident"
          >
            →
          </button>
        )}
        {hasPrevious && !hasNext && (
          <button 
            className={styles.navButton}
            onClick={handlePrevious}
            aria-label="Previous incident"
          >
            ←
          </button>
        )}
        {hasPrevious && hasNext && (
          <>
            <button 
              className={styles.navButton}
              onClick={handlePrevious}
              aria-label="Previous incident"
            >
              ←
            </button>
            <button 
              className={styles.navButton}
              onClick={handleNext}
              aria-label="Next incident"
            >
              →
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 