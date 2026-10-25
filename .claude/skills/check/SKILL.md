---
name: check
description: Cheap verification after a change (tests, typecheck, lint, build, smoke, optional screenshot look) on a small model in a forked context. Use instead of running the ladder in the main context.
argument-hint: '[--mobile] [look]'
context: fork
agent: checker
---

Verify the current working tree.

Caller arguments: $ARGUMENTS

- Flags starting with `--` are smoke-test flags; pass them through.
- If the word `look` is present, also read the screenshot(s) and add one line of visual notes.

Reply with your short PASS/FAIL report only.
