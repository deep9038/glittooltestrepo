"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksToCsv = tasksToCsv;
function escapeCsv(value) {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
function tasksToCsv(tasks) {
    const header = 'id,title,completed,priority,tags,dueDate';
    const rows = tasks.map((task) => [
        task.id,
        escapeCsv(task.title),
        task.completed,
        task.priority,
        escapeCsv(task.tags.join(';')),
        escapeCsv(task.dueDate ?? ''),
    ].join(','));
    return [header, ...rows].join('\n');
}
