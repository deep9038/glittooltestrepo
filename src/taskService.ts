import { readTasks, writeTasks } from './storage';
import { tasksToCsv } from './csv';
import { Priority, Task } from './types';

function nextId(tasks: Task[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

export function addTask(title: string, priority: Priority = 'medium', tags: string[] = [], dueDate?: string, tag?: string): Task {
  const tasks = readTasks();
  const task: Task = {
    id: nextId(tasks),
    title,
    completed: false,
    priority,
    tags,
    ...(tag ? { tag } : {}),
    createdAt: new Date().toISOString(),
    ...(dueDate ? { dueDate } : {}),
  };

  tasks.push(task);
  writeTasks(tasks);
  return task;
}

export function listTasks(): Task[] {
  return readTasks();
}

export function markDone(id: number): Task | null {
  const tasks = readTasks();
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return null;
  }

  task.completed = true;
  writeTasks(tasks);
  return task;
}

export function searchTasks(query: string): Task[] {
  const tasks = readTasks();
  const normalizedQuery = query.toLowerCase();
  return tasks.filter((task) => {
    const haystacks = [task.title, task.tag ?? '', ...task.tags];
    return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export function exportTasks(): string {
  return tasksToCsv(readTasks());
}

export function deleteTask(id: number): boolean {
  const tasks = readTasks();
  const nextTasks = tasks.filter((task) => task.id !== id);
  if (nextTasks.length === tasks.length) {
    return false;
  }

  writeTasks(nextTasks);
  return true;
}

export function deleteAllTasks(): number {
  const tasks = readTasks();
  const deletedCount = tasks.length;
  if (deletedCount === 0) {
    return 0;
  }

  writeTasks([]);
  return deletedCount;
}
