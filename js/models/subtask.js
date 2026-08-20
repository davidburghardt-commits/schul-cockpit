import { createId } from '../utils/id.js';

export function createSubtask(title) {
  return {
    id: createId('sub'),
    title: (title || '').trim(),
    done: false,
  };
}
