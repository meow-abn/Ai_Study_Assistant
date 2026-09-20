# 🤖 AI Study Assistant

An AI-powered study assistant that helps students learn, revise, and practice concepts using AI.

## 🚀 Features

* 📚 **AI Summary**
  Generate simple and easy-to-understand summaries from study content.

* 📝 **AI Quiz Generator**
  Generate quizzes based on the selected study topic and test your understanding.

* 🃏 **AI Flashcards**
  Create AI-generated flashcards for quick revision.

* 👨‍🏫 **AI Tutor**
  Ask questions and get explanations from an AI tutor.

* ⚙️ **Custom Quiz Settings**
  Choose the number of questions generated for a quiz.

## 🛠️ Tech Stack

* HTML
* CSS
* JavaScript
* Tailwind CSS
* Groq API
* Vercel Serverless Functions

## 🏗️ Architecture

```text
Frontend
   ↓
JavaScript
   ↓
Vercel Serverless API
   ↓
Groq API
   ↓
AI Response
   ↓
Study Assistant
```

The Groq API key is stored securely as a Vercel Environment Variable and is never exposed in the frontend code.

## 📁 Project Structure

```text
AI_Study_Assistant/
│
├── index.html
├── login.html
├── dashboard.html
├── dashboard.js
├── ai.js
├── auth.js
├── supabaseClient.js
│
├── api/
│   └── groq.js
│
└── README.md
```

## 🔐 Security

The Groq API key is **not stored in the frontend or GitHub repository**.

The backend accesses it through:

```text
process.env.GROQ_API_KEY
```

The key is configured through Vercel Environment Variables.

## 🌐 Deployment

The application is deployed using Vercel.
## 🌐 Live Demo

[Open AI Study Assistant](https://ai-study-assistant-6193.vercel.app/)

GitHub is used for source-code version control and Vercel automatically deploys new commits pushed to the `main` branch.

## 🎯 Purpose

This project was built to explore how AI APIs can be integrated into a real-world educational application while keeping API credentials secure through a backend serverless function.

## 👨‍💻 Author

**Aban**

Built as an AI-powered learning project.
