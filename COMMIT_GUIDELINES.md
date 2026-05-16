# Commit Guidelines

Purpose: concise rules and commands to keep commit history clean and recoverable.

## Quick Commands

- Stage interactively: `git add -p`
- Commit with subject + body: `git commit -m "Short summary" -m "Longer description explaining why"`
- Amend last commit (content or message): `git add <files>` then `git commit --amend` or `git commit --amend -m "New message"`
- Squash last N commits (interactive): `git rebase -i HEAD~N` (change `pick` → `s`/`f` to squash/fixup)
- Autosquash: `git commit --fixup=<commit-hash>` then `git rebase -i --autosquash <base>`
- Combine N commits quickly: `git reset --soft HEAD~N && git commit -m "Combined commit message"`
- Split a commit:
  1. `git rebase -i HEAD~N` → mark commit `edit`
  2. `git reset HEAD^`
  3. use `git add -p` + `git commit` repeatedly
  4. `git rebase --continue`
- Reorder or drop commits: `git rebase -i <base>` and reorder/delete lines
- Move a commit to another branch: `git checkout target-branch && git cherry-pick <commit>`
- Undo publicly (safe): `git revert <commit>`
- Force-push after rewrite (safer): `git push --force-with-lease`
- View compact history: `git log --oneline --graph --decorate --all`
- Recover lost commits: `git reflog` then `git reset --hard <hash>` or `git checkout <hash>`
- Stash WIP: `git stash push -m "WIP: reason"` and `git stash pop`

## Commit Message Template

Format:

```
Type(scope): short summary

Optional longer description explaining what and why. Reference issues: Refs: #123
```

- Keep the subject <= 50 chars; imperative mood ("Add", "Fix").
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`.

Example:

`git commit -m "feat(auth): add OAuth callback handling" -m "Handles token refresh and avoids duplicate sessions.\n\nRefs: #42"`

## Workflow Rules

- Make small, focused commits: one logical change per commit.
- Use `git add -p` to avoid unrelated changes leaking into commits.
- Rewrite history (rebase/squash) only on private branches. For shared branches prefer `git revert`.
- Use `--force-with-lease` when pushing rewritten history.
- Create a backup branch before big rewrites: `git branch backup/feature-x`

## Safety & Recovery

- Before rewriting remote history: `git fetch origin && git rebase origin/main` or create backup branch.
- If commits are lost: inspect `git reflog` and restore with `git reset --hard <hash>`.
- To collaborate safely, communicate when rebasing or force-pushing.

## Automation & Tooling

- Set a commit template: `git config commit.template .gitmessage.txt` and add your template file.
- Use `git rebase -i --autosquash` to apply `--fixup` commits automatically.
- Consider using `commitizen` or `git-cz` to enforce Conventional Commits.
- Use pre-commit hooks to run linters/tests: `npx husky install` + `.husky/pre-commit`.

---

Created by your assistant — adapt and extend as needed.
