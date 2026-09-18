import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TASKS_DIR = '.local/agents/tasks';
const TASK_INDEX = `${TASKS_DIR}/README.md`;
const REQUIRED_DELIVERABLE_STATUSES = new Set(['in_progress', 'review', 'done']);

function lineNumber(text, pattern) {
  const match = text.match(pattern);
  return match ? text.slice(0, match.index).split('\n').length : 1;
}

function parseInlineList(value) {
  if (!value || value.trim() === '[]') return [];
  const body = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  return body
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

/** Parse only the small frontmatter subset used by local task briefs. */
export function parseFrontmatter(text, file = '<input>') {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') {
    return { fields: {}, errors: [`${file}:1: missing YAML frontmatter`] };
  }

  const fields = {};
  const errors = [];
  let currentList = null;

  let closed = false;
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '---') {
      closed = true;
      break;
    }

    const listItem = line.match(/^\s+-\s+(.+?)\s*$/);
    if (listItem && currentList) {
      fields[currentList].push(listItem[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }

    const field = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!field) {
      if (line.trim()) errors.push(`${file}:${index + 1}: unsupported frontmatter syntax`);
      currentList = null;
      continue;
    }

    const [, name, rawValue] = field;
    if (rawValue.trim() === '') {
      fields[name] = [];
      currentList = name;
    } else {
      fields[name] = rawValue.trim().startsWith('[')
        ? parseInlineList(rawValue)
        : rawValue.trim().replace(/^['"]|['"]$/g, '');
      currentList = null;
    }
  }

  if (!closed) errors.push(`${file}:${lines.length}: missing closing frontmatter marker`);

  return { fields, errors };
}

function readTask(root, fileName) {
  const file = join(root, TASKS_DIR, fileName);
  const text = readFileSync(file, 'utf8');
  const parsed = parseFrontmatter(text, `${TASKS_DIR}/${fileName}`);
  const fields = parsed.fields;
  const id = typeof fields.id === 'string' ? fields.id : fileName.match(/^PLR-\d{3}/)?.[0];
  return {
    fileName,
    file: `${TASKS_DIR}/${fileName}`,
    text,
    fields,
    id,
    status: fields.status,
    contextRefs: Array.isArray(fields.context_refs) ? fields.context_refs : [],
    deliverable: typeof fields.deliverable === 'string' ? fields.deliverable : '',
    parseErrors: parsed.errors,
  };
}

function hasPath(root, value) {
  if (!value || isAbsolute(value)) return false;
  const target = resolve(root, value);
  const rel = relative(root, target);
  return rel !== '..' && !rel.startsWith(`..${sep}`) && existsSync(target);
}

function formatIssue(kind, file, taskId, detail) {
  const task = taskId ? ` [${taskId}]` : '';
  return `${kind}${task} — ${file}: ${detail}`;
}

function taskFiles(root) {
  const directory = join(root, TASKS_DIR);
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  return readdirSync(directory)
    .filter((file) => /^PLR-\d{3}-.+\.md$/i.test(file))
    .sort();
}

export function validateWorkspace(root = DEFAULT_ROOT) {
  const errors = [];
  const files = taskFiles(root);
  const tasks = files.map((file) => readTask(root, file));

  if (tasks.length === 0) {
    errors.push(formatIssue('Missing tasks', TASKS_DIR, '', 'no PLR task files found'));
    return { root, tasks, errors };
  }

  for (const task of tasks) {
    errors.push(...task.parseErrors);
    if (!task.id) {
      errors.push(formatIssue('Invalid task', task.file, '', 'missing id'));
      continue;
    }

    const refs = task.contextRefs;
    if (!Array.isArray(refs) || refs.length === 0) {
      errors.push(
        formatIssue('Missing context_ref', task.file, task.id, 'context_refs is empty or missing'),
      );
    } else {
      for (const ref of refs) {
        if (!hasPath(root, ref)) {
          errors.push(formatIssue('Missing context_ref', task.file, task.id, ref));
        }
      }
    }

    if (REQUIRED_DELIVERABLE_STATUSES.has(task.status) && !hasPath(root, task.deliverable)) {
      errors.push(
        formatIssue(
          'Missing deliverable',
          task.file,
          task.id,
          task.deliverable || 'deliverable is missing',
        ),
      );
    }
  }

  const byId = new Map();
  for (const task of tasks) {
    if (!task.id) continue;
    const matching = byId.get(task.id) ?? [];
    matching.push(task);
    byId.set(task.id, matching);
  }
  for (const [id, matching] of byId) {
    if (matching.length > 1) {
      errors.push(
        formatIssue(
          'Duplicate task id',
          matching.map((task) => task.file).join(', '),
          id,
          'identifier occurs more than once',
        ),
      );
    }
  }

  const indexFile = join(root, TASK_INDEX);
  if (!existsSync(indexFile)) {
    errors.push(
      formatIssue('Missing task index', TASK_INDEX, '', 'tasks/README.md does not exist'),
    );
  } else {
    const indexText = readFileSync(indexFile, 'utf8');
    for (const task of tasks) {
      const linkPattern = new RegExp(
        `\\[${task.id}\\]\\([^)]*${task.fileName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\)`,
      );
      if (!linkPattern.test(indexText)) {
        const idPattern = new RegExp(`\\[${task.id}\\]\\(`);
        const line = lineNumber(indexText, idPattern);
        errors.push(
          formatIssue('Missing task index link', `${TASK_INDEX}:${line}`, task.id, task.fileName),
        );
      }
    }
  }

  return { root, tasks, errors };
}

function parseArgs(argv) {
  const rootIndex = argv.indexOf('--root');
  return rootIndex >= 0 && argv[rootIndex + 1] ? resolve(argv[rootIndex + 1]) : DEFAULT_ROOT;
}

function main() {
  const result = validateWorkspace(parseArgs(process.argv.slice(2)));
  if (result.errors.length === 0) {
    console.log(`Agent workspace validation passed: ${result.tasks.length} task files checked.`);
    return;
  }

  console.error(`Agent workspace validation failed: ${result.errors.length} issue(s).`);
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
}

const invokedAsScript =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (invokedAsScript) main();
