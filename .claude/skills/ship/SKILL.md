---
name: ship
description: Commit, push and open/update a PR for the current changes, on a cheap model in a forked context. Use whenever work is ready to commit or the user says ship, push, commit or open a PR.
argument-hint: '[stack] [base-branch] [what was checked]'
context: fork
agent: shipper
---

Ship the current working-tree changes of this repo.

Arguments from the caller (may be empty): $ARGUMENTS

- If the first word is an existing branch name, use it as the PR base; otherwise base is `master`.
- If the word `stack` appears (or this branch builds on another unmerged branch), ship the chain as a GitHub stack.
- Anything else describes what was checked (the PR's "Checked" line).

Reply with branch, commit hash and PR URL only.
