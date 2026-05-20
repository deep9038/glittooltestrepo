import fs from 'fs';
import path from 'path';
import { Task } from './types';

const DATA_FILE = path.resolve(process.cwd(), 'tasks.json');

export function readTasks(): Task[] {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (!raw.trim()) {
    return [];
  }

  const tasks = JSON.parse(raw) as Array<Task & { tags?: string[]; createdAt?: string }>;
  return tasks.map((task) => ({
    ...task,
    tags: Array.isArray(task.tags) ? task.tags : [],
    createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
  }));
}

export function writeTasks(tasks: Task[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}
