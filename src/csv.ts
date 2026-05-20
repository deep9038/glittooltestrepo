import { Task } from './types';

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function tasksToCsv(tasks: Task[]): string {
  const header = 'id,title,completed,priority,tags,dueDate';
  const rows = tasks.map((task) =>
    [
      task.id,
      escapeCsv(task.title),
      task.completed,
      task.priority,
      escapeCsv(task.tags.join(';')),
      escapeCsv(task.dueDate ?? ''),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}
