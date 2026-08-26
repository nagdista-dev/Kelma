import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';

const HIDDEN_PATHS = ['/quiz', '/report', '/summary'];

/**
 * Floating "Resume quiz" button — appears whenever an active quiz is
 * in progress and the user is browsing any other page.
 */
export function ResumeQuizButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const phase = useQuizStore(s => s.phase);

  const quizRunning = phase === 'active' || phase === 'feedback';
  const visible = quizRunning && !HIDDEN_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          id="resume-quiz-btn"
          initial={{ opacity: 0, y: 24, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.85 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={() => navigate('/quiz')}
          className="fixed bottom-5 right-5 z-[70] inline-flex cursor-pointer items-center gap-2 rounded-full border border-teal-400/40 bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-xl shadow-teal-900/30 transition-all hover:bg-teal-500 active:scale-95"
          aria-label="Resume your quiz"
          title="Resume your quiz"
        >
          <PlayCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Back to Quiz</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
