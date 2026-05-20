"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTasks = readTasks;
exports.writeTasks = writeTasks;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_FILE = path_1.default.resolve(process.cwd(), 'tasks.json');
function readTasks() {
    if (!fs_1.default.existsSync(DATA_FILE)) {
        return [];
    }
    const raw = fs_1.default.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) {
        return [];
    }
    const tasks = JSON.parse(raw);
    return tasks.map((task) => ({
        ...task,
        tags: Array.isArray(task.tags) ? task.tags : [],
    }));
}
function writeTasks(tasks) {
    fs_1.default.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}
