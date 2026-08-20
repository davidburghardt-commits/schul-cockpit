import { createSubject } from '../models/subject.js';
import { createTask } from '../models/task.js';
import { createExam } from '../models/exam.js';
import { createSubtask } from '../models/subtask.js';
import { TASK_STATUS, TASK_PRIORITY, EXAM_TYPE } from '../utils/constants.js';
import { todayISO, addDays } from '../utils/dateUtils.js';

function sub(list, name) {
  return list.find((s) => s.name === name);
}

// Realistic example data so the app is never empty on first launch.
// Fully removable later via Einstellungen -> "Beispieldaten entfernen".
export function buildSeedData() {
  const today = todayISO();

  const subjects = [
    createSubject({ name: 'Mathematik', color: 'blue', teacher: 'Hr. Weber' }),
    createSubject({ name: 'Deutsch', color: 'purple', teacher: 'Fr. Klein' }),
    createSubject({ name: 'Englisch', color: 'green', teacher: 'Fr. Adams' }),
    createSubject({ name: 'Geschichte', color: 'orange', teacher: 'Hr. Vogt' }),
    createSubject({ name: 'PGW', color: 'teal', teacher: 'Fr. Nolte' }),
    createSubject({ name: 'Chemie', color: 'red', teacher: 'Hr. Brandt' }),
    createSubject({ name: 'Biologie', color: 'pink', teacher: 'Fr. Sommer' }),
    createSubject({ name: 'Physik', color: 'indigo', teacher: 'Hr. Ludwig' }),
    createSubject({ name: 'Religion', color: 'amber', teacher: 'Fr. Hahn' }),
    createSubject({ name: 'Spanisch', color: 'slate', teacher: 'Fr. Torres' }),
  ];

  const tasks = [
    createTask({
      subjectId: sub(subjects, 'Mathematik').id,
      title: 'Trigonometrie Aufgaben',
      description: 'Aufgabenblatt 4: Sinus, Kosinus, Tangens am Einheitskreis.',
      status: TASK_STATUS.IN_BEARBEITUNG,
      priority: TASK_PRIORITY.HOCH,
      startDate: today,
      dueDate: addDays(today, 26),
      estimatedMinutes: 300,
      subtasks: [
        { ...createSubtask('Aufgaben 1–4 rechnen'), done: true },
        createSubtask('Aufgaben 5–8 rechnen'),
        createSubtask('Aufgaben 9–12 rechnen'),
        createSubtask('Ergebnisse kontrollieren'),
      ],
    }),
    createTask({
      subjectId: sub(subjects, 'Deutsch').id,
      title: 'Szenenanalyse – Kabale und Liebe',
      description: '2. Akt, 3. Szene: Sprachliche Mittel und Figurenkonstellation.',
      status: TASK_STATUS.IN_BEARBEITUNG,
      priority: TASK_PRIORITY.NORMAL,
      dueDate: addDays(today, 9),
      estimatedMinutes: 240,
      subtasks: [
        { ...createSubtask('Szene lesen'), done: true },
        { ...createSubtask('Einleitung schreiben'), done: true },
        createSubtask('Inhaltsangabe'),
        createSubtask('Figuren analysieren'),
        createSubtask('Sprachliche Mittel untersuchen'),
        createSubtask('Schluss schreiben'),
        createSubtask('Überarbeiten'),
      ],
    }),
    createTask({
      subjectId: sub(subjects, 'Englisch').id,
      title: 'Essay – Climate Change',
      description: 'Argumentative essay, ca. 400 words, mit Gegenargument.',
      status: TASK_STATUS.NICHT_BEGONNEN,
      priority: TASK_PRIORITY.NORMAL,
      dueDate: addDays(today, 14),
      estimatedMinutes: 180,
      progress: 0,
    }),
    createTask({
      subjectId: sub(subjects, 'Chemie').id,
      title: 'Arbeitsblatt Säuren und Basen',
      description: 'pH-Werte berechnen, Neutralisationsreaktionen.',
      status: TASK_STATUS.IN_BEARBEITUNG,
      priority: TASK_PRIORITY.SEHR_HOCH,
      dueDate: addDays(today, 3),
      estimatedMinutes: 90,
      progress: 40,
    }),
    createTask({
      subjectId: sub(subjects, 'Geschichte').id,
      title: 'Quellenanalyse Vorbereitung',
      description: 'Quellen zum Wiener Kongress sichten und Leitfragen notieren.',
      status: TASK_STATUS.NICHT_BEGONNEN,
      priority: TASK_PRIORITY.NIEDRIG,
      dueDate: addDays(today, 20),
      estimatedMinutes: 120,
      progress: 0,
    }),
    createTask({
      subjectId: sub(subjects, 'PGW').id,
      title: 'Referat: Föderalismus in Deutschland',
      description: 'Kurzreferat mit Handout, ca. 8 Minuten.',
      status: TASK_STATUS.ERLEDIGT,
      priority: TASK_PRIORITY.NORMAL,
      dueDate: addDays(today, -2),
      estimatedMinutes: 150,
      progress: 100,
    }),
  ];

  const exams = [
    createExam({
      subjectId: sub(subjects, 'Mathematik').id,
      type: EXAM_TYPE.KLAUSUR,
      title: 'Klausur: Trigonometrie & Funktionen',
      date: addDays(today, 12),
      time: '08:00',
      description: 'Themen: Einheitskreis, Funktionsanalyse, Textaufgaben.',
      learningProgress: 25,
    }),
    createExam({
      subjectId: sub(subjects, 'Englisch').id,
      type: EXAM_TYPE.TEST,
      title: 'Vocabulary Test – Unit 3',
      date: addDays(today, 6),
      time: '10:00',
      description: 'Wortschatz Unit 3 + unregelmäßige Verben.',
      learningProgress: 10,
    }),
  ];

  return { subjects, tasks, exams };
}
