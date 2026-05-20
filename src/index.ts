import { writeFileSync } from 'fs';
import { Command } from 'commander';
import { addTask, deleteAllTasks, deleteTask, exportTasks, listTasks, markDone, searchTasks } from './taskService';
import { Priority } from './types';
import { runInteractiveMenu } from './interactive';

const program = new Command();

program
  .name('task-manager')
  .description('A simple CLI task manager')
  .version('1.0.0');

program
  .command('add')
  .description('Add a new task')
  .argument('<title>', 'task title')
  .option('-p, --priority <priority>', 'task priority: low, medium, high', 'medium')
  .option('-t, --tags <tags>', 'comma-separated task tags')
  .option('-d, --due-date <dueDate>', 'optional due date string')
  .action((title: string, options: { priority: Priority; tags?: string; dueDate?: string }) => {
    const tags = options.tags ? options.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
    const task = addTask(title, options.priority, tags, options.dueDate);
    console.log(`Added task #${task.id}: ${task.title} [${task.priority}]${task.tags.length ? ` tags ${task.tags.join(', ')}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
  });

program
  .command('list')
  .description('List all tasks')
  .action(() => {
    const tasks = listTasks();
    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    tasks.forEach((task) => {
      const status = task.completed ? 'done' : 'todo';
      const createdAt = new Date(task.createdAt).toLocaleString();
      console.log(`#${task.id} [${status}] [${task.priority}] ${task.title}${task.tags.length ? ` [${task.tags.join(', ')}]` : ''} (created ${createdAt})${task.dueDate ? ` (due ${task.dueDate})` : ''}`);
    });
  });

program
  .command('done')
  .description('Mark a task as completed')
  .argument('<id>', 'task id')
  .action((id: string) => {
    const task = markDone(Number(id));
    if (!task) {
      console.log('Task not found.');
      return;
    }

    console.log(`Marked task #${task.id} as done.`);
  });

program
  .command('search')
  .description('Search tasks by title')
  .argument('<query>', 'search query')
  .action((query: string) => {
    const tasks = searchTasks(query);
    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    tasks.forEach((task) => {
      const status = task.completed ? 'done' : 'todo';
      const createdAt = new Date(task.createdAt).toLocaleString();
      console.log(`#${task.id} [${status}] [${task.priority}] ${task.title}${task.tags.length ? ` [${task.tags.join(', ')}]` : ''} (created ${createdAt})${task.dueDate ? ` (due ${task.dueDate})` : ''}`);
    });
  });

program
  .command('export')
  .description('Export tasks to tasks.csv')
  .action(() => {
    writeFileSync('tasks.csv', exportTasks(), 'utf8');
    console.log('Exported tasks to tasks.csv.');
  });

program
  .command('delete')
  .description('Delete a task')
  .argument('<id>', 'task id')
  .action((id: string) => {
    const removed = deleteTask(Number(id));
    console.log(removed ? `Deleted task #${id}.` : 'Task not found.');
  });

program
  .command('deleteAll')
  .description('Delete all tasks')
  .action(() => {
    const deletedCount = deleteAllTasks();
    console.log(deletedCount > 0 ? `Deleted all ${deletedCount} task${deletedCount === 1 ? '' : 's'}.` : 'No tasks found.');
  });

program.option('--interactive', 'launch interactive task menu');

const options = program.parse(['node', 'dist/index.js', ...process.argv.slice(2)]).opts<{ interactive?: boolean }>();

if (options.interactive) {
  void runInteractiveMenu();
}
