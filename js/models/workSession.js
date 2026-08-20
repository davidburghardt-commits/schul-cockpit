import { createId } from '../utils/id.js';

export function createWorkSession({
  taskId,
  date,
  plannedMinutes = 0,
  actualMinutes = 0,
  outcome = null,
  startedAt = null,
  endedAt = null,
} = {}) {
  return {
    id: createId('ws'),
    taskId,
    date,
    plannedMinutes,
    actualMinutes,
    outcome,
    startedAt,
    endedAt,
  };
}
