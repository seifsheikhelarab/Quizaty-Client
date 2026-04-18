# 📝 Quizaty Client

<p align="center">
  <img src="app/welcome/logo-light.svg" alt="Quizaty Logo" width="120" />
</p>

Quizaty is a feature-rich, secure quiz management platform designed to support Egyptian teachers. Built with **React Router 7**, **React 19**, and **TailwindCSS 4**, it provides a seamless experience for managing classes, quizzes, and student performance with full Arabic support.

## ✨ Features

- 🌍 **Arabic First**: Fully localized interface designed for local teachers and students.
- 👨‍🏫 **Teacher Dashboard**: Comprehensive overview of students, classes, active quizzes, and assistants.
- 📊 **Class Management**: Organize students into classes, track unique student codes, and manage invites.
- 📝 **Quiz Builder**: Create quizzes manually or from a dedicated **Question Bank**.
- 🤖 **OCR Question Extraction**: Upload PDFs or images to extract questions automatically using Google Gemini AI.
- 🛡️ **Anti-Cheat Measures**: Watermarking, no screenshotting/copy-pasting, and devtools detection.
- 📈 **Performance Analytics**: Detailed insights into quiz attempts, leaderboards, and student violations.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended runtime)
- Node.js (v20+)

### Installation

```bash
# Clone the repository
git clone https://github.com/seifsheikhelarab/test-app.git
cd Quizaty/Quizaty-Client

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:7492/api
```

## 🛠️ Tech Stack

- **Framework**: [React Router 7](https://reactrouter.com/)
- **UI**: [React 19](https://react.dev/)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📦 Project Structure

```text
app/
├── components/     # Reusable UI components
├── routes/         # Page-level route components
├── utils/          # API utilities and helpers
├── types/          # TypeScript definitions
├── root.tsx        # Application entry point
└── routes.ts       # Route configuration
```

> [!TIP]
> This project uses the `~/*` path alias for imports starting from the `app/` directory.

## 🚢 Deployment

```bash
# Build for production
bun run build

# Start the production server
bun run start
```
