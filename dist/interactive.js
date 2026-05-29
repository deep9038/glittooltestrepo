"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInteractiveMenu = runInteractiveMenu;
const readline_1 = __importDefault(require("readline"));
const taskService_1 = require("./taskService");
function ask(rl, prompt) {
    return new Promise((resolve) => rl.question(prompt, resolve));
}
function printTasks() {
    const tasks = (0, taskService_1.listTasks)();
    if (tasks.length === 0) {
        console.log('No tasks found.');
        return;
    }
    tasks.forEach((task) => {
        const status = task.completed ? 'done' : 'todo';
        console.log(`#${task.id} [${status}] [${task.priority}] ${task.title}${task.tags.length ? ` tags ${task.tags.join(', ')}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
    });
}
async function handleAddTask(rl) {
    const title = (await ask(rl, 'Task title: ')).trim();
    const priorityInput = (await ask(rl, 'Priority (low, medium, high) [medium]: ')).trim();
    const priority = (priorityInput || 'medium');
    const tagsInput = (await ask(rl, 'Tags (comma-separated, optional): ')).trim();
    const dueDate = (await ask(rl, 'Due date (optional): ')).trim();
    const tags = tagsInput ? tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
    const task = (0, taskService_1.addTask)(title, priority, tags, dueDate || undefined);
    console.log(`Added task #${task.id}: ${task.title} [${task.priority}]${task.tags.length ? ` tags ${task.tags.join(', ')}` : ''}${task.dueDate ? ` due ${task.dueDate}` : ''}`);
}
async function handleMarkDone(rl) {
    const id = Number((await ask(rl, 'Task id: ')).trim());
    const task = (0, taskService_1.markDone)(id);
    console.log(task ? `Marked task #${task.id} as done.` : 'Task not found.');
}
async function handleDeleteTask(rl) {
    const id = Number((await ask(rl, 'Task id: ')).trim());
    const removed = (0, taskService_1.deleteTask)(id);
    console.log(removed ? `Deleted task #${id}.` : 'Task not found.');
}
async function runInteractiveMenu() {
    const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    const actions = {
        '1': () => handleAddTask(rl),
        '2': printTasks,
        '3': () => handleMarkDone(rl),
        '4': () => handleDeleteTask(rl),
        '5': () => rl.close(),
    };
    const menu = async () => {
        console.log('\n1) Add task');
        console.log('2) List tasks');
        console.log('3) Mark done');
        console.log('4) Delete task');
        console.log('5) Exit');
        const choice = (await ask(rl, 'Choose an option: ')).trim();
        const action = actions[choice];
        if (!action) {
            console.log('Invalid option.');
            return menu();
        }
        await action();
        if (choice !== '5') {
            return menu();
        }
    };
    rl.on('close', () => process.exit(0));
    await menu();
}
