import readline from 'readline';
import { addTask, deleteTask, listTasks, markDone } from './taskService';
import { Priority } from './types';

function ask(rl: readline.Interface, prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function printTasks(): void {
  const tasks = listTasks();
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  tasks.forEach((task) => {
    const status = task.completed ? 'done' : 'todo';
    console.log(`#${task.id} [${status}] [${task.priority}] ${task.title}${task.tags.length ? ` tags ${task.tags.join(', ')}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
  });
}

export async function runInteractiveMenu(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const menu = async (): Promise<void> => {
    console.log('\n1) Add task');
    console.log('2) List tasks');
    console.log('3) Mark done');
    console.log('4) Delete task');
    console.log('5) Exit');

    const choice = (await ask(rl, 'Choose an option: ')).trim();

    switch (choice) {
      case '1': {
        const title = (await ask(rl, 'Task title: ')).trim();
        const priorityInput = (await ask(rl, 'Priority (low, medium, high) [medium]: ')).trim();
        const priority = (priorityInput || 'medium') as Priority;
        const tagsInput = (await ask(rl, 'Tags (comma-separated, optional): ')).trim();
        const dueDate = (await ask(rl, 'Due date (optional): ')).trim();
        const tags = tagsInput ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
        const task = addTask(title, priority, tags, dueDate || undefined);
        console.log(`Added task #${task.id}: ${task.title} [${task.priority}]${task.tags.length ? ` tags ${task.tags.join(', ')}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
        return menu();
      }
      case '2':
        printTasks();
        return menu();
      case '3': {
        const id = Number((await ask(rl, 'Task id: ')).trim());
        const task = markDone(id);
        console.log(task ? `Marked task #${task.id} as done.` : 'Task not found.');
        return menu();
      }
      case '4': {
        const id = Number((await ask(rl, 'Task id: ')).trim());
        const removed = deleteTask(id);
        console.log(removed ? `Deleted task #${id}.` : 'Task not found.');
        return menu();
      }
      case '5':
        rl.close();
        return;
      default:
        console.log('Invalid option.');
        return menu();
    }
  };

  rl.on('close', () => process.exit(0));
  await menu();
}
