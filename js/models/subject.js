import { createId } from '../utils/id.js';

export function createSubject({ name, color = 'blue', teacher = '', notes = '' } = {}) {
  return {
    id: createId('subj'),
    name: (name || '').trim() || 'Neues Fach',
    color,
    teacher: teacher || '',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
}
