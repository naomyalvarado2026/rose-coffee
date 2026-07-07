import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2500,
  className = ''
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [isPdfExport, setIsPdfExport] = useState(false);

  useEffect(() => {
    const handlePdfStart = () => setIsPdfExport(true);
    const handlePdfEnd = () => setIsPdfExport(false);
    window.addEventListener('pdf-export-start', handlePdfStart);
    window.addEventListener('pdf-export-end', handlePdfEnd);
    return () => {
      window.removeEventListener('pdf-export-start', handlePdfStart);
      window.removeEventListener('pdf-export-end', handlePdfEnd);
    };
  }, []);

  useEffect(() => {
    if (phrases.length === 0 || isPdfExport) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const fullText = phrases[currentPhraseIndex];

    if (isPaused) {
      timeoutId = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeoutId);
    }

    if (isDeleting) {
      if (currentText.length === 0) {
        timeoutId = setTimeout(() => {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }, 0);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, deletingSpeed);
      }
    } else {
      if (currentText.length === fullText.length) {
        timeoutId = setTimeout(() => {
          setIsPaused(true);
        }, 0);
      } else {
        timeoutId = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, isPdfExport]);

  return (
    <span className={className}>
      {isPdfExport ? phrases[0] : currentText}
      {!isPdfExport && (
        <span className="animate-pulse border-r-2 border-current ml-1" style={{ animationDuration: '0.8s' }}></span>
      )}
    </span>
  );
};
