# GitHub Push Checklist

Before pushing this repository to GitHub, verify the following checklist to prevent leaking secrets or deploying broken code.

## 1. Secret Sanitization
- [ ] `.env.local` is ignored by git and contains no committed secrets.
- [ ] `Supabase Service Role Key` is **not** hardcoded anywhere in the codebase.
- [ ] `Google Client Secret` is **not** hardcoded anywhere in the codebase.
- [ ] No temporary files (`*.log`, `.DS_Store`) are staged.

## 2. Build Verification
- [ ] `npm run build` succeeds locally with 0 errors.
- [ ] No `Failed to type check` errors in the build output.
- [ ] No hydration warnings (or none that break production builds).

## 3. Dependency Integrity
- [ ] `package.json` contains only required packages.
- [ ] `package-lock.json` is committed and up to date.
- [ ] No unused massive libraries are included (e.g. `node_modules` is not staged).

## 4. Git Push Commands

Once the checklist is verified, execute the following commands in your terminal:

```bash
# 1. Initialize git (if not already done)
git init

# 2. Stage all files (respecting .gitignore)
git add .

# 3. Commit the deployment-ready code
git commit -m "Initial AlloySphere deployment-ready build"

# 4. Link the remote repository
git remote add origin git@github.com:alloyspheretechnologies/AlloySphere.git

# 5. Push to main branch
git branch -M main
git push -u origin main
```
