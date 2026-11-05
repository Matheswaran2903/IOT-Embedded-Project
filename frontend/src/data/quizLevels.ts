export type QuizLevel = 'beginner' | 'intermediate' | 'advanced';
export const QUIZ_LEVELS: Record<QuizLevel, { title: string; description: string; indices: number[]; duration: string }> = {
  beginner: { title: 'Beginner', description: 'Basic components, names and simple concepts.', indices: [0,2,3,5,7,8,13], duration: '10–15 min' },
  intermediate: { title: 'Intermediate', description: 'Connections, readings, practical use and troubleshooting.', indices: [1,4,6,9,11,18,19], duration: '15–20 min' },
  advanced: { title: 'Advanced', description: 'Calculations, communication, system design and safety.', indices: [10,12,14,15,16,17], duration: '20–25 min' },
};
