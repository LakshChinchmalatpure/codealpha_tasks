# NLP FAQ Similarity Sandbox & Smart Chatbot

An educational, fully offline sandbox application designed to visualize and dissect how natural language processing (NLP), Lexical Tokenization, TF-IDF (Term Frequency-Inverse Document Frequency) normalization, and **Cosine Vector Similarity** algorithms resolve user queries against indexed FAQ documents. 

Experience real-time diagnostic matrices, preprocessing stages (stopword filtration, stemming), and full mathematical proofs with zero server overhead or third-party API dependencies.

---

## 🎯 Role of the Website

The role of this application is to demystify complex natural language processing (NLP) algorithms by providing a highly visual, real-time playground. Instead of treating text similarity as a black box, this tool:
- **Visualizes Lexical Workflows**: Shows exactly how human text is converted into tokens, filtered for stopwords, and stem-reduced.
- **Maps N-Dimensional Vectors**: Builds the Term Frequency (TF) and Inverse Document Frequency (IDF) vector matrices live on-screen.
- **Performs Dynamic Cosine Calculations**: Shows the complete step-by-step math to calculate the directional cosine angle between the user query vector and FAQ document vectors to select the best match.
- **Provides an Interactive Chat Interface**: Features a fully-responsive chatbot that resolves questions instantly using the internal similarity solver.

---

## 🛠️ Tech Stack & Architecture

- **Core Search Engine**: Custom-coded mathematical processing pipeline (tokenization, clean regex sanitization, stemmer, TF-IDF calculation, and Cosine similarity solvers) written in pure **TypeScript**.
- **Frontend Framework**: **React 18/19** utilizing functional components, hooks, and clean state containment.
- **Developer Suite**: Built on **Vite 6** and **TypeScript 5.8** for near-instant compilation and extreme modularity.
- **Graphic Engine**: Beautiful high-contrast dark space/slate design system built with utility-first **Tailwind CSS**.
- **Micro-interactions & Vectors**: Elegant animations powered by **Motion**, with modern diagnostic icons from **Lucide React**.

---

## ⚙️ Step-by-Step Guide: Running the Website on Any Device

### 💻 A. Running on a Laptop or Desktop (Local Environment)

Follow these directions to boot up the application locally:

#### Step 1: Install Node.js
Make sure you have **Node.js** (version 18 or higher) installed on your system. 
- Open your Terminal (Mac/Linux) or Command Prompt (Windows) and type:
  ```bash
  node -v
