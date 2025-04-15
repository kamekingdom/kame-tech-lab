# 🧪 Kame Tech Lab (2023)

A portfolio site built with **React** and **Bootstrap**, deployed via **Firebase Hosting**.  
Showcases award-winning research, interactive AI applications, and full-stack development projects.

---

## 🚀 Tech Stack

- **Frontend**: React + Bootstrap
- **Hosting**: Firebase Hosting
- **Deployment**: `firebase deploy`
- **CI/CD**: Manual via CLI / GitHub Actions (optional)

---

## 🌐 Live URL

🔗 [https://kame-tech-lab.web.app](https://kame-tech-lab.web.app)

---

## 📁 Project Structure

```
kame-tech-lab/
├── public/             # Static files (favicon, index.html, etc.)
├── src/                # Components, pages, styles
│   ├── components/
│   ├── pages/
│   └── App.js
├── firebase.json       # Firebase hosting config
├── .firebaserc         # Firebase project link
├── package.json
└── README.md
```

---

## 🧑‍💼 Featured Projects

- 🎮 **Picture Hunter II**  
  Real-time interactive game using multimodal LLMs and image captioning.  
  → Awarded at EC2024 (Best Demo)

- 📝 **KG Career Correction System**  
  NLP-based GUI app for plagiarism detection and keyword grading.

- 🎼 **Deep Stream App**  
  300+ member music club management system (originally built with Flutter).

- 💠 **Internship Systems**  
  Full-stack APIs & interfaces developed at Heartland IT Innovation, Inc.

---

## 🛠 Firebase Hosting Setup

If you want to deploy yourself:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

- `"public"` directory must be set to `build` in `firebase.json`
- If using `react-router`, make sure to enable rewrites for SPA

---

## 📄 License

MIT License

---

Created by [@kamekingdom](https://github.com/kamekingdom)
