export function findSubject(subjects, subjectId) {
  return subjects.find((s) => s.id === subjectId) || null;
}

export function subjectColorVar(subject) {
  const color = subject ? subject.color : 'slate';
  return `var(--subject-${color})`;
}

export function subjectName(subjects, subjectId) {
  const subject = findSubject(subjects, subjectId);
  return subject ? subject.name : 'Ohne Fach';
}

// Shared traffic-light rule for due-date urgency, used by the dashboard
// deadline list, task rows and the calendar. Deliberately simple: based on
// days-until-due only (the planner's own urgency score also weighs effort
// and priority, but the *color* people scan a list with should stay legible).
export function urgencyTone(daysUntilDue) {
  if (daysUntilDue < 0) return 'danger';
  if (daysUntilDue <= 3) return 'danger';
  if (daysUntilDue <= 7) return 'warning';
  return 'success';
}
