"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const commander_1 = require("commander");
const taskService_1 = require("./taskService");
const interactive_1 = require("./interactive");
const program = new commander_1.Command();
program
    .name('task-manager')
    .description('A simple CLI task manager')
    .version('1.0.0');
program
    .command('add')
    .description('Add a new task')
    .argument('<title>', 'task title')
    .option('-p, --priority <priority>', 'task priority: low, medium, high', 'medium')
    .option('-t, --tag <tag>', 'optional task tag')
    .option('-d, --due-date <dueDate>', 'optional due date string')
    .action((title, options) => {
    const task = (0, taskService_1.addTask)(title, options.priority, [], options.dueDate, options.tag);
    console.log(`Added task #${task.id}: ${task.title} [${task.priority}]${task.tag ? ` tag ${task.tag}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
});
program
    .command('list')
    .description('List all tasks')
    .action(() => {
    const tasks = (0, taskService_1.listTasks)();
    if (tasks.length === 0) {
        console.log('No tasks found.');
        return;
    }
    tasks.forEach((task) => {
        const status = task.completed ? 'done' : 'todo';
        console.log(`#${task.id} [${status}] [${task.priority}] ${task.title} (created ${task.createdAt})${task.dueDate ? ` (due ${task.dueDate})` : ''}`);
    });
});
program
    .command('done')
    .description('Mark a task as completed')
    .argument('<id>', 'task id')
    .action((id) => {
    const task = (0, taskService_1.markDone)(Number(id));
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
    .action((query) => {
    const tasks = (0, taskService_1.searchTasks)(query);
    if (tasks.length === 0) {
        console.log('No tasks found.');
        return;
    }
    tasks.forEach((task) => {
        const status = task.completed ? 'done' : 'todo';
        console.log(`#${task.id} [${status}] [${task.priority}] ${task.title} (created ${task.createdAt})${task.dueDate ? ` (due ${task.dueDate})` : ''}`);
    });
});
program
    .command('export')
    .description('Export tasks to tasks.csv')
    .action(() => {
    (0, fs_1.writeFileSync)('tasks.csv', (0, taskService_1.exportTasks)(), 'utf8');
    console.log('Exported tasks to tasks.csv.');
});
program
    .command('delete')
    .description('Delete a task')
    .argument('<id>', 'task id')
    .action((id) => {
    const removed = (0, taskService_1.deleteTask)(Number(id));
    console.log(removed ? `Deleted task #${id}.` : 'Task not found.');
});
program
    .command('deleteAll')
    .description('Delete all tasks')
    .action(() => {
    const deletedCount = (0, taskService_1.deleteAllTasks)();
    console.log(deletedCount > 0 ? `Deleted all ${deletedCount} task${deletedCount === 1 ? '' : 's'}.` : 'No tasks found.');
});
program.option('--interactive', 'launch interactive task menu');
const options = program.parse(['node', 'dist/index.js', ...process.argv.slice(2)]).opts();
if (options.interactive) {
    void (0, interactive_1.runInteractiveMenu)();
}
