import { Task } from './types';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function tasksToCsv(tasks: Task[]): string {
  const header = 'id,title,completed,priority,tag';
  const rows = tasks.map((task) =>
    [task.id, escapeCsv(task.title), task.completed, task.priority, escapeCsv(task.tag ?? '')].join(',')
  );
  return [header, ...rows].join('\n');
}
