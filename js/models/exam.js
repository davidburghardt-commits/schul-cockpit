import { createId } from '../utils/id.js';
import { EXAM_TYPE } from '../utils/constants.js';

export function createExam({
  subjectId,
  type = EXAM_TYPE.KLAUSUR,
  title,
  date,
  time = '',
  description = '',
  learningProgress = 0,
} = {}) {
  return {
    id: createId('exam'),
    subjectId: subjectId || null,
    type,
    title: (title || '').trim() || 'Neuer Termin',
    date: date || null,
    time: time || '',
    description: description || '',
    learningProgress: Math.max(0, Math.min(100, Number(learningProgress) || 0)),
    createdAt: new Date().toISOString(),
  };
}
