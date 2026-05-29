"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTask = addTask;
exports.listTasks = listTasks;
exports.markDone = markDone;
exports.updateTask = updateTask;
exports.searchTasks = searchTasks;
exports.filterByPriority = filterByPriority;
exports.exportTasks = exportTasks;
exports.deleteTask = deleteTask;
exports.deleteAllTasks = deleteAllTasks;
const storage_1 = require("./storage");
const csv_1 = require("./csv");
function nextId(tasks) {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}
function addTask(title, priority = 'medium', tags = [], dueDate) {
    const tasks = (0, storage_1.readTasks)();
    const task = {
        id: nextId(tasks),
        title,
        completed: false,
        priority,
        tags,
        createdAt: new Date().toISOString(),
        dueDate,
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
function updateTask(id, updates) {
    const tasks = (0, storage_1.readTasks)();
    const task = tasks.find((item) => item.id === id);
    if (!task) {
        return null;
    }
    if (updates.title !== undefined) {
        task.title = updates.title;
    }
    if (updates.priority !== undefined) {
        task.priority = updates.priority;
    }
    (0, storage_1.writeTasks)(tasks);
    return task;
}
function searchTasks(query) {
    const tasks = (0, storage_1.readTasks)();
    const normalizedQuery = query.toLowerCase();
    return tasks.filter((task) => {
        const haystacks = [task.title, ...task.tags, task.dueDate ?? ''];
        return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
}
function filterByPriority(priority) {
    return (0, storage_1.readTasks)().filter((task) => task.priority === priority);
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
