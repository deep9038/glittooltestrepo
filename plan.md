Absolutely — here’s a revised design that incorporates those improvements in a clean, phased way.

# Task CLI Design

## Goals
Build a small, reliable TypeScript CLI task manager with:
- simple commands
- persistent JSON file storage
- robust validation and migration
- clear command semantics
- room to grow without redesigning core types

---

# 1. Scope

## V1
- add task
- list tasks
- mark task done
- delete task
- search tasks
- export CSV
- priority support
- multi-tag support
- JSON file persistence
- validation
- migration for older records
- exact command behavior definitions

## V1.1
- update/edit task
- filtered list
- undone command
- atomic file writes
- automated tests

## V2
- description field
- configurable data path
- JSON output
- stronger concurrency protection
- advanced tag editing (`--add-tag`, `--remove-tag`)
- lock file support

---

# 2. Data Model

```ts
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}
```

## Notes
- `id` is monotonically increasing and never reused
- `createdAt` is required
- `updatedAt` is set when a task is edited
- `completedAt` is set when a task is marked done
- `tags` are normalized before storage

---

# 3. Storage Design

## File format
Tasks are stored in a JSON file.

### Suggested structure
```ts
interface TaskFile {
  nextId: number;
  tasks: Task[];
}
```

## Why this structure
- avoids recomputing next ID
- guarantees IDs are never reused
- simplifies migration and validation

## Default path
For V1:
- `./tasks.json`

For later versions:
- allow configurable path such as:
```bash
task --data ./custom-tasks.json list
```

---

# 4. Storage Rules

## Load behavior
On startup:
1. if file does not exist, return empty store:
```ts
{ nextId: 1, tasks: [] }
```
2. if file exists, parse JSON
3. validate shape
4. migrate older task records
5. return normalized in-memory data

## Save behavior
Writes should be atomic:
1. write JSON to temp file
2. rename temp file to target file

This prevents partial writes if the process exits during save.

## Concurrency note
For V1:
- concurrent writes are not guaranteed safe

For later:
- add lock file or equivalent protection

---

# 5. Validation and Migration

## Validation rules

### Title
- required
- trimmed
- must not be empty
- max length: 200 characters

### Tags
- optional on input
- stored as array
- normalized to lowercase
- trimmed
- unique
- max 10 tags per task
- each tag max length: 30 characters
- exact tag matching for filters
- sorted alphabetically before storing

### Priority
- allowed values: `low`, `medium`, `high`
- default: `medium`

### ID
- positive integer

### Dates
- stored as ISO strings

---

## Migration rules
When loading older task records:
- `tags` missing → `[]`
- `priority` missing → `medium`
- `completed` missing → `false`
- `createdAt` missing → fill with current ISO timestamp
- `updatedAt` missing → leave undefined
- `completedAt` missing:
  - if `completed === true`, optionally set current timestamp during migration
  - otherwise undefined

## Validation vs migration
- migration fills missing known fields
- validation rejects malformed records that cannot be safely interpreted

---

# 6. Command Semantics

---

## `task add`

### Usage
```bash
task add "Finish report" --priority high --tag work --tag writing
```

### Behavior
- creates a new task
- assigns next available ID
- normalizes tags
- defaults:
  - `priority = medium`
  - `completed = false`
- sets `createdAt`
- saves file
- prints created task

### Alias
```bash
task a "Finish report"
```

---

## `task list`

### Usage
```bash
task list
task list --all
task list --status done
task list --status pending
task list --priority high
task list --tag work
```

### Behavior
- returns tasks sorted by ID ascending
- supports filtering by:
  - status
  - priority
  - tag
- `--tag` uses exact normalized match
- if no tasks match, prints friendly empty state

### Example empty state
```text
No tasks found.
```

### Alias
```bash
task ls
```

### Recommended function
```ts
function listTasks(filters?: {
  status?: 'done' | 'pending';
  priority?: Priority;
  tag?: string;
}): Task[]
```

---

## `task done`

### Usage
```bash
task done 3
```

### Behavior
- marks task completed
- sets `completed = true`
- sets `completedAt` if not already set
- saves file

If task is already completed:
- prints friendly message
- leaves task unchanged

---

## `task undone` (V1.1)

### Usage
```bash
task undone 3
```

### Behavior
- marks task incomplete
- sets `completed = false`
- clears `completedAt`
- saves file

---

## `task delete`

### Usage
```bash
task delete 3
```

### Behavior
- removes the task permanently
- does not reuse its ID
- saves file

### Alias
```bash
task rm 3
```

---

## `task update` (V1.1)

### Usage
```bash
task update 3 --title "Finish annual report" --priority high --tag work --tag finance
```

### Behavior
- updates specified fields only
- sets `updatedAt`
- replacing tags with `--tag` replaces all tags
- later versions may add:
  - `--add-tag`
  - `--remove-tag`

### Recommended function
```ts
function updateTask(
  id: number,
  updates: {
    title?: string;
    priority?: Priority;
    tags?: string[];
  }
): Task
```

---

## `task search`

### Usage
```bash
task search "report"
task search "report" --field title
task search "work" --field tag
```

### Behavior
- substring match, case-insensitive
- default behavior:
  - search title and tags
- optional field restriction:
  - `title`
  - `tag`

### Notes
- `list --tag work` is preferred for exact tag filtering
- `search` is mainly for text lookup

---

## `task export`

### Usage
```bash
task export
task export --output ./tasks.csv
task export --completed-only
task export --pending-only
task export --tag work
```

### Behavior
- exports matching tasks to CSV
- default output path:
  - `./tasks.csv`
- must escape CSV safely
- includes headers

### CSV columns
```text
id,title,completed,priority,tags,createdAt,updatedAt,completedAt
```

### Future option
```bash
task export --format json
```

---

# 7. Sorting and Matching Rules

## Task sorting
- list output is sorted by `id` ascending

## ID policy
- IDs are monotonically increasing
- IDs are never reused

## Tag semantics
- tags are normalized to lowercase
- exact match for filters:
```bash
task list --tag work
```
- substring match allowed in search:
```bash
task search "wor"
```

## Tag ordering
- tags are stored sorted alphabetically

---

# 8. CLI UX

## Suggested aliases
```bash
task add      # a
task list     # ls
task delete   # rm
task done     # complete (optional alias)
```

## Output style
Each task should show:
- ID
- completion status
- title
- priority
- tags

### Example
```text
[ ] #3 Finish report (high) tags: finance, work
[x] #4 Submit taxes (medium) tags: personal
```

### Optional later enhancement
```bash
task list --json
```

---

# 9. Module Structure

```text
src/
  index.ts        // CLI entry
  commands/       // command handlers
  taskService.ts  // core task operations
  storage.ts      // load/save/migrate/validate
  validators.ts   // input and schema validation
  formatters.ts   // console and CSV formatting
  types.ts        // Task and Priority types
```

## Responsibility split
- `index.ts`: parse CLI args
- `taskService.ts`: business logic
- `storage.ts`: persistence, migration, atomic writes
- `validators.ts`: input validation and normalization
- `formatters.ts`: terminal and CSV output

---

# 10. Core Service API

```ts
function addTask(input: {
  title: string;
  priority?: Priority;
  tags?: string[];
}): Task;

function listTasks(filters?: {
  status?: 'done' | 'pending';
  priority?: Priority;
  tag?: string;
}): Task[];

function markTaskDone(id: number): Task;

function markTaskUndone(id: number): Task;

function deleteTask(id: number): void;

function updateTask(
  id: number,
  updates: {
    title?: string;
    priority?: Priority;
    tags?: string[];
  }
): Task;

function searchTasks(
  query: string,
  field?: 'title' | 'tag'
): Task[];

function exportTasks(options?: {
  output?: string;
  completedOnly?: boolean;
  pendingOnly?: boolean;
  tag?: string;
}): void;
```

---

# 11. Error Handling

## Examples
- invalid ID → print clear error
- task not found → print clear error
- invalid priority → reject with message
- invalid JSON file → print load failure with recovery guidance
- malformed task record → reject file or skip invalid records depending on strictness setting

## Recommended V1 behavior
Fail fast on malformed file with a helpful message:
```text
Failed to load tasks.json: invalid task data format.
```

---

# 12. Testing Plan

## Unit tests
- title validation
- tag normalization
- priority validation
- exact tag filtering
- search matching
- CSV escaping

## Storage tests
- missing file returns empty store
- migration of old records
- invalid JSON handling
- atomic write behavior

## Integration tests
- add/list/delete/done flow
- update flow
- export flow
- undone flow
- filtered list behavior

## Tools
- `vitest` recommended

## Test strategy
Use temp directories so tests never touch real user data.

---

# 13. Future Enhancements

## V2 candidates
- `description` field
- `--data` custom path
- JSON output
- tag add/remove editing
- lock file support
- archive/restore instead of hard delete
- toggle command

### Possible future model
```ts
export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}
```

---

# 14. Final Recommended Spec Snapshot

## Required decisions
- IDs never reused
- list sorted by ID ascending
- done on completed task prints friendly message
- createdAt required
- tags lowercase, unique, exact-match in filters
- atomic writes required
- validation and migration handled separately