# Architecture Overview for Task Manager CLI

## Project Structure

The project follows a modular structure, organized into dedicated folders and files as described below:

```
/
├── src/
│   ├── index.ts           # Main entry point for the CLI application
│   ├── taskService.ts     # Service logic for task management (CRUD operations)
│   ├── csv.ts             # Logic for exporting tasks to CSV
│   ├── interactive.ts      # Interactive command line interface logic
│   ├── types.ts           # Type definitions for tasks and priorities
│   ├── utils.ts           # Utility functions (if needed)
│   └── ...                # Additional modules as needed
├── arcitech.md            # Architecture documentation
├── package.json           # Project metadata and dependencies
└── tsconfig.json          # TypeScript configuration file
```

## Key Components

### 1. Task Object
- **Properties**: A task contains properties such as `id`, `title`, `priority`, `tags`, `createdAt`, and `dueDate`.
- **TypeScript Interface**: The `Task` interface is defined in `src/types.ts` to enforce consistent structure.

### 2. Task Management Functions
- **CRUD Operations**: The project supports creating, reading, updating, and deleting tasks via functions defined in `src/taskService.ts`.
- **Update Functionality**: `updateTask(id, title, priority)` allows modification of tasks by their ID, enhancing flexibility.

### 3. CSV Export
- **Export Functionality**: The `exportTasksToCSV(tasks)` function in `src/csv.ts` manages the formatting and file generation for task data in CSV format.

### 4. Command Handling
- **Interaction Commands**: The `src/index.ts` file initializes and handles command-line commands using the `commander` library for user input and output.
- **Interactive Mode**: A user-friendly interactive mode in `src/interactive.ts` provides an engaging experience for managing tasks interactively.

### 5. Data Persistence
- The project does not currently specify a data persistence mechanism (like a database), implying tasks are stored in memory during execution. This can be improved with local storage or a database in future iterations.

## Future Enhancements
- **Persistent Storage**: Implement data persistence to retain tasks across sessions.
- **Improved Search Functionality**: Enhance search with filters for tags and priorities.
- **Testing Suite**: Add unit and integration tests to ensure code reliability and robustness.
- **User Authentication**: Secure the application with authentication for task management.

---
This architecture document provides a comprehensive overview of the project's structure, components, and potential future improvements.