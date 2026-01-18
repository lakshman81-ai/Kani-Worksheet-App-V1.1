# Super Quiz App - Deployment Instructions

## 📦 What's Included

**super-quiz-deployment.zip** (Ready to deploy - 72KB)
- Built app ready for immediate deployment
- Just extract and upload to GitHub Pages

**super-quiz-app.zip** (Full source code - 49KB)
- Complete source code
- Requires Node.js to build

---

## 🚀 Quick Deployment to GitHub Pages

### Option 1: Upload Built Files (Easiest - 5 minutes)

1. **Create a new GitHub repository** or use an existing one
   - Go to https://github.com/new
   - Name it anything (e.g., "my-super-quiz")
   - Make it public
   - Click "Create repository"

2. **Extract super-quiz-deployment.zip**
   - You'll get: index.html, assets folder, .nojekyll

3. **Upload to GitHub**
   - In your new repo, click "uploading an existing file"
   - Drag and drop ALL files (index.html, assets folder, .nojekyll)
   - Commit the files

4. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: main → / (root)
   - Click Save

5. **Done!** Your app will be live at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```
   (Takes 1-2 minutes to deploy)

---

### Option 2: Deploy with GitHub Actions (Automatic updates)

1. **Extract super-quiz-app.zip** (source code)

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Add Super Quiz app"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: GitHub Actions
   - The workflow will auto-deploy

4. **Modify base path** (if needed)
   - Edit `vite.config.ts`
   - Change `base: './'` to `base: '/YOUR_REPO_NAME/'` if using a project page
   - Commit and push

---

## 🎮 App Features

✅ **4 Learning Modules**
- 🚀 Space Quiz
- 🌍 Geography Quiz
- 🔢 Math Quiz
- ✏️ Spell Check (with audio)

✅ **Modern UI**
- Animated mascot selection
- Glassmorphism effects
- Responsive design

✅ **Google Sheets Integration**
- Dynamic question loading
- Worksheet filtering support
- Easy content updates

---

## 📝 Updating Google Sheets URLs

To connect your own Google Sheets:

1. Open `services/googleSheetsService.ts`
2. Replace placeholder URLs with your actual Google Sheets URLs
3. Make sure each sheet is published as CSV:
   - File → Share → Publish to web
   - Select "Comma-separated values (.csv)"
   - Copy the URL

Example sheet format:
```csv
Question,Answer A,Answer B,Answer C,Answer D,Correct Answer,Note,Worksheet No.
"What planet is red?","Earth","Mars","Venus","Jupiter","B","",1
```

---

## 🛠️ Local Development

If you want to modify the app:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

The app will run at http://localhost:3000

---

## 📱 Testing Locally

To test the built files locally:

1. Install a simple HTTP server:
   ```bash
   npm install -g http-server
   ```

2. Run in the dist folder:
   ```bash
   cd dist
   http-server
   ```

3. Open http://localhost:8080

---

## 🐛 Troubleshooting

**Problem: Blank page after deployment**
- Check browser console for errors
- Verify all files uploaded correctly
- Make sure .nojekyll file is present

**Problem: Assets not loading**
- Check the base path in vite.config.ts
- For root domain: use `base: './'`
- For project page: use `base: '/repo-name/'`

**Problem: Old app still showing**
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Wait 1-2 minutes for GitHub Pages to update
- Check if you uploaded to the correct branch

---

## 📧 Support

For issues or questions:
- Check the README.md file
- Review the documentation files (GOOGLE_SHEETS_CONFIG.md, WORKSHEET_EXAMPLE.md)

---

**Enjoy your Super Quiz app! 🎉**
