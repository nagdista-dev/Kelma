import { Navigate } from 'react-router-dom';
import { PlacementQuiz } from '@/components/quiz/PlacementQuiz';
import { usePlacementStore } from '@/store/placementStore';

/**
 * Dedicated route for the AI placement test. Requires a generated quiz —
 * otherwise sends the user back to the level picker.
 */
export function PlacementPage() {
  const hasQuestions = usePlacementStore(st => st.questions.length > 0);

  if (!hasQuestions) {
    return <Navigate to="/level" replace />;
  }

  return <PlacementQuiz />;
}
