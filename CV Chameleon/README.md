# Annabel's Job Pipeline

Find jobs · Tailor resume with Claude AI · Download PDF

---

## Deploy to Vercel (exact steps)

### Step 1 — Create GitHub account
Go to github.com and sign up if you don't have one.

### Step 2 — Create a new repository
1. Click the **+** icon top right → **New repository**
2. Name it: `job-pipeline`
3. Set to **Private**
4. Click **Create repository**

### Step 3 — Upload these files
On the new repo page, click **uploading an existing file**
Upload ALL files from this folder maintaining the folder structure:
```
job-pipeline/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx
│   └── index.js
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```
Click **Commit changes**

### Step 4 — Deploy on Vercel
1. Go to vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Click **Add New Project**
4. Select your `job-pipeline` repository
5. Leave all settings as default
6. Click **Deploy**

Wait ~60 seconds. Vercel gives you a live URL like:
`https://job-pipeline-yourusername.vercel.app`

### Step 5 — Open and use
Go to your URL, enter your Anthropic API key, click Find Jobs.

---

## Updating the app later
1. Edit `src/App.jsx`
2. Re-upload to GitHub (or use GitHub Desktop for easier updates)
3. Vercel auto-redeploys in ~30 seconds

---

## Adding more tools to your dashboard
To add new tools (forex tracker, reselling tracker, etc.):
- Add new components in `src/`
- Add a nav bar to `App.jsx` that routes between tools
- Each tool is just a new `.jsx` file

This is your personal cloud dashboard. Keep building.
