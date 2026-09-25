import { Suspense } from "react";
import QuizPage from "./quiz_page";

export default function QuizRoute() {
  return (
    <Suspense fallback={null}>
      <QuizPage />
    </Suspense>
  );
} 