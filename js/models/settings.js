export function defaultSettings() {
  return {
    theme: 'system', // 'light' | 'dark' | 'system'
    dailyCapacityMinutes: 60,
    workBlockStart: '11:00',
    workBlockEnd: '12:00',
    workdays: [1, 2, 3, 4, 5], // Mon-Fri (0=Sun ... 6=Sat)
    holidays: [], // [{id, start, end, label}]
    maxTasksPerDay: 3,
    seedDataLoaded: false,
  };
}
