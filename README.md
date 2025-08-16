
# 📘 Digital Shersha

**Bangla digital exam platform (up to class 10)**
Frontend: React + Vite + TailwindCSS
Backend: Node.js + Express + MongoDB

---

## ⚡ Features

* Student and Teacher accounts
* Online quizzes/exams in Bengali
* Secure authentication with JWT
* MongoDB for storing users, exams, results
* TailwindCSS for modern UI

---

## 🛠️ Project Setup

### 1. Clone Repository

```bash
git clone <your_repo_url>
cd digital_shersha
```

---

### 2. Frontend Setup (React + Vite 5 + Tailwind)

```bash
cd frontend
```

**Dependencies:**

* `react` / `react-dom`
* `vite@5.x`
* `@vitejs/plugin-react@4.x`
* `tailwindcss` / `postcss` / `autoprefixer`

**Install:**

```bash
npm install
npm install -D vite@5.4.8 @vitejs/plugin-react@4.3.1 tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Run dev server (default: [http://localhost:5173](http://localhost:5173)):**

```bash
npm run dev
```

---

### 3. Backend Setup (Node + Express + MongoDB)

```bash
cd backend
```

**Dependencies:**

* `express` → server
* `mongoose` → MongoDB
* `bcrypt` → password hashing
* `jsonwebtoken` → authentication

**Install:**

```bash
npm install express mongoose bcrypt jsonwebtoken dotenv cors
npm install -D nodemon
```

**Run backend server (default: [http://localhost:5000](http://localhost:5000)):**

```bash
npm run dev
```

---

## 📂 Project Structure

```
digital_shersha/
│── frontend/   # React + Vite + Tailwind
│── backend/    # Node.js + Express + MongoDB
│── README.md
│── .gitignore
```

---

## 🚀 Scripts

### Frontend

```bash
npm run dev      # start frontend on localhost:5173
npm run build    # build production files
```

### Backend

```bash
npm run dev      # start backend with nodemon (localhost:5000)
```

---

## ✅ Requirements

* Node.js **18+**
* npm **9+**
* MongoDB (local)

---
