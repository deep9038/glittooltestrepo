"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = addTask;
exports.listTasks = listTasks;
exports.markDone = markDone;
exports.searchTasks = searchTasks;
exports.exportTasks = exportTasks;
exports.deleteTask = deleteTask;
const storage_1 = require("./storage");
const csv_1 = require("./csv");
function nextId(tasks) {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}
function addTask(title, priority = 'medium', tags = []) {
    const tasks = (0, storage_1.readTasks)();
    const task = {
        id: nextId(tasks),
        title,
        completed: false,
        priority,
        tags,
    };
    tasks.push(task);
    (0, storage_1.writeTasks)(tasks);
    return task;
}
function listTasks() {
    return (0, storage_1.readTasks)();
}
function markDone(id) {
    const tasks = (0, storage_1.readTasks)();
    const task = tasks.find((item) => item.id === id);
    if (!task) {
        return null;
    }
    task.completed = true;
    (0, storage_1.writeTasks)(tasks);
    return task;
}
function searchTasks(query) {
    const tasks = (0, storage_1.readTasks)();
    const normalizedQuery = query.toLowerCase();
    return tasks.filter((task) => task.title.toLowerCase().includes(normalizedQuery));
}
function exportTasks() {
    return (0, csv_1.tasksToCsv)((0, storage_1.readTasks)());
}
function deleteTask(id) {
    const tasks = (0, storage_1.readTasks)();
    const nextTasks = tasks.filter((task) => task.id !== id);
    if (nextTasks.length === tasks.length) {
        return false;
    }
    (0, storage_1.writeTasks)(nextTasks);
    return true;
}
