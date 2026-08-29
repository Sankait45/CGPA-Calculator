# 🎓 Advanced CGPA & SGPA Calculator

A modern, highly responsive, client-side CGPA calculator built specifically for engineering students. It features an interactive master dashboard, dynamic "What-If" grade targeting, and local storage data persistence.

### 🌟 Live Demo
**[Click here to view the live application!](https://cgpa-calculator-gamma-wine.vercel.app/)**

## ✨ Key Features
- **Dynamic Master Dashboard:** Automatically aggregates data across 5 semesters to calculate overall CGPA in real-time.
- **"What-If" Exam Planner:** Intelligently calculates exactly how many marks you need in your remaining exams to pass or achieve an 'A' grade.
- **Strict Data Validation:** Prevents out-of-bounds typos with live visual error highlighting.
- **Premium Glassmorphism UI:** Features a modern, frosted-glass aesthetic with fluid Mesh Gradients and full Light/Dark mode support.
- **Zero Backend Required:** Uses browser `localStorage` for blazing-fast, secure data persistence without requiring a database.

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Hosting/CI-CD:** Vercel
- **Architecture:** Local Progressive Web App (PWA) compatible

## 💡 How to Use
1. Select a semester from the top navigation bar.
2. Enter your marks for Internal Assessments (CIA) and End Semester Exams (SEE).
3. The app will live-calculate your SGPA and provide target scores for empty fields.
4. Click **Save to Master Dashboard** (only available when all inputs are valid).
5. Navigate to the **Dashboard** to view your aggregated CGPA and performance graphs.
