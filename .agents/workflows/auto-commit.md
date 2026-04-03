---
description: Auto commit and push changes to GitHub after making code edits
---

# Auto Commit & Push Workflow

After making ANY code changes to the campus-flow project, ALWAYS follow these steps automatically without being asked.

## Steps

1. Stage all changed files
```powershell
& "C:\Program Files\Git\bin\git.exe" add .
```

// turbo
2. Commit with a descriptive message summarizing what was changed
```powershell
& "C:\Program Files\Git\bin\git.exe" commit -m "<describe what changed>"
```

// turbo
3. Push to GitHub
```powershell
& "C:\Program Files\Git\bin\git.exe" push origin main
```

4. Confirm success by checking the output. If push fails due to auth, notify the user.

> Working directory is always: `c:\Users\aksha\.gemini\antigravity\scratch\campus-flow`
