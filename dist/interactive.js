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
        console.log(`#${task.id} [${status}] [${task.priority}] ${task.title}`);
    });
}
async function runInteractiveMenu() {
    const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    const menu = async () => {
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
                const priority = (priorityInput || 'medium');
                const task = (0, taskService_1.addTask)(title, priority);
                console.log(`Added task #${task.id}: ${task.title} [${task.priority}]`);
                return menu();
            }
            case '2':
                printTasks();
                return menu();
            case '3': {
                const id = Number((await ask(rl, 'Task id: ')).trim());
                const task = (0, taskService_1.markDone)(id);
                console.log(task ? `Marked task #${task.id} as done.` : 'Task not found.');
                return menu();
            }
            case '4': {
                const id = Number((await ask(rl, 'Task id: ')).trim());
                const removed = (0, taskService_1.deleteTask)(id);
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
