---
name: review-merge
description: Review an open PR and squash-merge it if nothing blocks, in a forked context. Run right after /ship opens a PR so the next task starts from an up-to-date master.
argument-hint: '<PR number>'
context: fork
agent: reviewer
---

Review and merge PR #$ARGUMENTS in yfix/schengen.

Follow your reviewer steps. Reply with `MERGED #n` or `BLOCKED #n` plus at most 5 lines of blockers/notes.

Afterwards the caller should: `git checkout master && git pull --ff-only`, then branch the next task from master.
