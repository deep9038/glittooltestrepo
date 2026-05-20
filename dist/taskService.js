"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = addTask;
exports.listTasks = listTasks;
exports.markDone = markDone;
exports.searchTasks = searchTasks;
exports.exportTasks = exportTasks;
exports.deleteTask = deleteTask;
exports.deleteAllTasks = deleteAllTasks;
const storage_1 = require("./storage");
const csv_1 = require("./csv");
function nextId(tasks) {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}
function addTask(title, priority = 'medium', tags = [], dueDate, tag) {
    const tasks = (0, storage_1.readTasks)();
    const task = {
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
    return tasks.filter((task) => {
        const haystacks = [task.title, task.tag ?? '', ...task.tags];
        return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
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
function deleteAllTasks() {
    const tasks = (0, storage_1.readTasks)();
    const deletedCount = tasks.length;
    if (deletedCount === 0) {
        return 0;
    }
    (0, storage_1.writeTasks)([]);
    return deletedCount;
}
