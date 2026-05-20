Updated plan with a **multi-tag system** added for tasks.

---

## Plan: TypeScript CLI Task Manager

### Key Features Identified
- **TypeScript CLI**
- **Task manager**
- Commands:
  1. **add task**
  2. **list all tasks**
  3. **mark task as done**
  4. **delete task by ID**
  5. **search tasks by keyword**
  6. **export tasks to CSV**
- **Storage:** `tasks.json`
- **CLI parsing:** `commander`
- **Priority field:** `low | medium | high`
- **New tag system:** each task can have **multiple tags**

---

## 1. Project Setup
1. Initialize a Node.js project with TypeScript support.
2. Install required dependencies:
   - Runtime:
     - `commander`
   - Dev:
     - `typescript`
     - `ts-node`
     - `@types/node`
3. Create a `tsconfig.json` configured for Node.js CLI usage.
4. Add package scripts for:
   - building TypeScript
   - running the CLI in development
   - executing compiled output

**Suggested files**
- `package.json`
- `tsconfig.json`

---

## 2. Define Project Structure
Keep CLI parsing separate from task persistence logic.

**Suggested structure**
```text
src/
  index.ts           # commander CLI entrypoint
  taskService.ts     # add/list/done/delete/search/export operations
  storage.ts         # read/write tasks.json
  types.ts           # Task + Priority type definitions
  csv.ts             # CSV export helper(s)
  format.ts          # optional helpers for terminal output
tasks.json           # persisted task data
exports/             # optional output folder for CSV exports
```

**Decision**
- Keep `tasks.json` at the project root for simplicity.
- Keep CSV exports in `exports/` by default when no path is provided.

---

## 3. Define Data Model
In `src/types.ts`, define both priority and tags in the task model.

**Recommended types**
```ts
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  createdAt?: string;
}
```

### Tag decisions
- `tags` is always an array.
- Default to `[]` when no tags are provided.
- Tags are stored as strings.
- Normalize tags on input:
  - trim whitespace
  - remove empty values
  - optionally lowercase them for consistency
  - remove duplicates

### Recommended normalization
Examples:
- `["Work", " urgent ", "work", ""]`
  becomes
- `["work", "urgent"]`

### Trade-off
- Lowercasing tags improves consistency but loses original casing.
- Recommended for a simple CLI: store tags in lowercase.

---

## 4. Implement Storage Layer
In `src/storage.ts`:

1. Implement logic to read tasks from `tasks.json`.
2. If `tasks.json` does not exist, return an empty array.
3. If the file exists but contains invalid JSON, fail with a clear error.
4. Ensure loaded tasks conform reasonably to expected structure:
   - valid `priority`
   - `tags` is an array of strings, or default to `[]`

**Recommended functions**
- `loadTasks(): Task[]`
- `saveTasks(tasks: Task[]): void`

### Decisions
- Use Node `fs` / `fs/promises`
- Store JSON as an array of task objects
- Pretty-print JSON for readability
- For backward compatibility:
  - if older tasks do not have `tags`, treat them as `[]`

### Recommended behavior for invalid JSON
Fail with a clear error message rather than resetting silently.

---

## 5. Implement Tag Utilities
Add helper functions for tag validation and normalization.

**Suggested helpers**
```ts
normalizeTag(tag: string): string
normalizeTags(tags: string[]): string[]
parseTagList(input: string): string[]
```

### Behavior
- Trim each tag
- Convert to lowercase
- Remove empty tags
- Remove duplicates

### Example
Input:
```ts
[" Work ", "urgent", "Urgent", ""]
```

Output:
```ts
["work", "urgent"]
```

### CLI parsing options for tags
Recommended support:
- repeated option:
  ```bash
  task add "Finish report" --tag work --tag urgent
  ```
- comma-separated fallback:
  ```bash
  task add "Finish report" --tags work,urgent
  ```

**Recommended first version**
Support `--tag` repeated multiple times. It is cleaner and avoids parsing ambiguity.

---

## 6. Implement Task Service
In `src/taskService.ts`, implement the main operations.

### 1. Add task
- Accept:
  - task title
  - task priority
  - zero or more tags
- Validate:
  - title is non-empty
  - priority is valid
- Normalize tags
- Assign new ID
- Save updated list

**Recommended function**
```ts
addTask(title: string, priority: Priority, tags?: string[]): Task
```

---

### 2. List tasks
- Return all tasks
- Display completion status, priority, and tags clearly

**Recommended function**
```ts
listTasks(): Task[]
```

---

### 3. Mark task as done
- Find by numeric ID
- If not found, return a clear message

**Recommended function**
```ts
completeTask(id: number): Task | null
```

---

### 4. Delete task
- Remove by numeric ID

**Recommended function**
```ts
deleteTask(id: number): boolean
```

---

### 5. Search tasks
Expand search behavior to support both:
- title search
- tag search

### Recommended search behavior
A keyword matches if it appears in:
- the task title, case-insensitive substring match, or
- any tag, case-insensitive substring match

Examples:
- searching `"work"` matches:
  - title: `"Work on proposal"`
  - tag: `"work"`
- searching `"urg"` matches tag `"urgent"`

**Recommended function**
```ts
searchTasks(keyword: string): Task[]
```

---

### 6. Export tasks to CSV
- Load all tasks
- Convert to CSV
- Include tags in export
- Save to provided path or default path

**Recommended function**
```ts
exportTasksToCsv(outputPath?: string): { path: string; count: number }
```

---

## 7. Implement CSV Export Logic
In `src/csv.ts`:

1. Convert tasks into CSV text.
2. Escape CSV values correctly.
3. Include tags as a single column.

**Recommended CSV columns**
```text
id,title,completed,priority,tags,createdAt
```

### Tags export format
Store tags in one field joined by a delimiter.

**Recommended choice**
Use semicolon-separated tags inside the CSV field:
```text
work;urgent
```

This avoids confusion with CSV commas.

### Example CSV output
```csv
id,title,completed,priority,tags,createdAt
1,"Finish report",false,high,"work;urgent",2026-05-19T10:00:00.000Z
2,"Buy groceries",true,medium,"home;errands",2026-05-19T11:00:00.000Z
```

**Recommended helper**
```ts
tasksToCsv(tasks: Task[]): string
```

---

## 8. Build the CLI with Commander
In `src/index.ts`, create the Commander-based CLI.

1. Create the main program with name and description.
2. Add commands.

---

### `add`
Usage:
```bash
task add "<title>" --priority <low|medium|high> --tag <tag> --tag <tag>
```

Action:
- call `addTask(title, priority, tags)`
- print confirmation with ID, priority, and tags

**Decision**
- `--priority` defaults to `medium`
- `--tag` can be repeated zero or more times

Examples:
```bash
task add "Buy milk"
task add "Finish report" --priority high --tag work --tag urgent
task add "Water plants" --priority low --tag home
```

---

### `list`
Usage:
```bash
task list
```

Action:
- call `listTasks`
- print all tasks in readable format
- show tags if present

**Optional later**
- filter by tag:
  ```bash
  task list --tag work
  ```

---

### `done`
Usage:
```bash
task done <id>
```

---

### `delete`
Usage:
```bash
task delete <id>
```

---

### `search`
Usage:
```bash
task search "<keyword>"
```

Action:
- search by title or tags
- print matching tasks
- show friendly message if no matches

Examples:
```bash
task search "report"
task search "work"
task search "urgent"
```

---

### `export`
Usage:
```bash
task export [outputPath]
```

Action:
- export tasks including tags to CSV

---

## 9. Output Formatting
Define consistent terminal output.

### Listing format
Show:
- ID
- completion marker
- priority
- title
- tags, if any

**Example**
```text
1. [ ] (high) Finish report tags: [work, urgent]
2. [x] (medium) Buy groceries tags: [home, errands]
3. [ ] (low) Water plants
```

### Mutation messages
- `Added task #3: Buy milk [medium]`
- `Added task #4: Finish report [high] tags=[work, urgent]`
- `Marked task #3 as done`
- `Deleted task #3`
- `Task #3 not found`

### Search messages
- Reuse listing format
- If none found:
  - `No tasks found matching "keyword"`

### Export messages
- `Exported 3 task(s) to ./tasks.csv`

---

## 10. Error Handling
1. Validate command input:
   - reject empty titles
   - reject invalid priorities
   - reject non-numeric IDs
   - reject empty search keywords
   - reject invalid export paths
2. Validate tags:
   - ignore empty tags after trimming, or reject them
   - remove duplicates automatically

### Recommended behavior for tags
If a user provides:
```bash
task add "Task" --tag work --tag " work " --tag ""
```

Normalize to:
```ts
["work"]
```

### Priority validation
If a user passes:
```bash
task add "Something" --priority urgent
```

Return:
```text
Invalid priority: urgent. Use one of: low, medium, high.
```

---

## 11. Make the CLI Executable
1. Add shebang to CLI entry file if needed:
   - `#!/usr/bin/env node`
2. Configure `package.json` `bin` field:
```json
{
  "main": "dist/index.js",
  "bin": {
    "task": "dist/index.js"
  }
}
```

---

## 12. Backward Compatibility / Migration
Because older tasks may not contain `tags`, define migration behavior when loading:

- if `tags` is missing, set it to `[]`
- if `priority` is missing and older data exists, either:
  - reject old records, or
  - default them to `medium`

**Recommended behavior**
- `tags` missing → `[]`
- keep current priority validation strategy consistent with the existing plan

This lets existing `tasks.json` continue to work without manual edits.

---

## 13. Test the Main Flows
Manually verify:

1. Add a task without tags:
   ```bash
   task add "Buy groceries"
   ```
2. Add tasks with tags:
   ```bash
   task add "Finish report" --priority high --tag work --tag urgent
   task add "Water plants" --priority low --tag home
   ```
3. Add duplicate / mixed-case tags:
   ```bash
   task add "Review PR" --tag Work --tag work --tag " urgent "
   ```
   Expected stored tags:
   ```text
   [work, urgent]
   ```
4. List tasks
5. Search by title:
   ```bash
   task search "report"
   ```
6. Search by tag:
   ```bash
   task search "work"
   task search "urgent"
   ```
7. Mark one as done:
   ```bash
   task done 1
   ```
8. Delete one:
   ```bash
   task delete 2
   ```
9. Export tasks:
   ```bash
   task export
   task export ./tasks.csv
   ```
10. Test invalid ID
11. Test invalid priority
12. Test empty search keyword
13. Test missing `tasks.json`
14. Test export to a non-writable path
15. Test export when there are zero tasks
16. Test loading older tasks without `tags`

---

## 14. Optional Future Enhancements
If you want to extend tags later, good next steps would be:

- filter list by tag:
  ```bash
  task list --tag work
  ```
- add/remove tags from an existing task:
  ```bash
  task tag add 3 work
  task tag remove 3 urgent
  ```
- search with dedicated tag filter:
  ```bash
  task search --tag work
  ```
- support multiple search filters:
  - by priority
  - by completion
  - by tag
- colorize priority or tags in terminal output