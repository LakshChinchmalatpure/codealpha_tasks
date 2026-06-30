# NLP FAQ Similarity Sandbox & Smart Chatbot

An educational, fully offline sandbox application designed to visualize and dissect how natural language processing (NLP), Lexical Tokenization, TF-IDF (Term Frequency-Inverse Document Frequency) normalization, and **Cosine Vector Similarity** algorithms resolve user queries against indexed FAQ documents. 

Experience real-time diagnostic matrices, preprocessing stages (stopword filtration, stemming), and full mathematical proofs with zero server overhead or third-party API dependencies.

---


Live Link   :    https://aistudio.google.com/apps/de2fdf2e-1f1d-428e-a558-68d9bf662d39?showPreview=true&showAssistant=true&fullscreenApplet=true

## 🌟 Key Features

1. **Active Preprocessing Pipeline & Lexical Preprocessor**:
   - Live stream tokenizations under the hood as you type.
   - Normalizes text (case conversion), strips punctuation, classifies **stopwords**, and extracts word roots via an offline **Stemming preprocessor**.

2. **Smart NLP Chatbot & Cosine Diagnostic Assistant**:
   - Chat with preset or custom knowledge bases.
   - Provides a live **NLP Metrics Console** displaying the matched FAQ document, alignment percentages, and overlap weights per question.

3. **TF-IDF & Lexical Vocabulary Matrices**:
   - Fully interactive table mapping the vocabulary vectors.
   - Showcases individual document Term Frequency (TF) weights alongside calculated IDF dimensions.

4. **Vector Magnitude & Math Prove-Out**:
   - Demonstrates complete step-by-step vector mechanics:
     $$\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
   - Displays real-time calculations of Scalar Dot Product, Magnitude Weights, and joint dimensions.

5. **Knowledge Base Domain & Document customizer**:
   - Toggle instantly between several preset workspaces (e.g., *Smart Home Systems*, *E-Commerce & Billing*, *Hardware Specs*, *Healthcare & Wearables*).
   - Initialize fully blank Custom Sandbox domains, or inject, edit, and delete document entries directly to see the vector space adjust on-the-fly.

---

## 🛠️ Tech Stack & Architecture

- **Core Engine & Preprocessors**: Preprocessor engines written in pure TypeScript (`/src/lib/` and state managers) running client-side with full state determinism.
- **Frontend Core**: **React 19** with stable custom hooks and reactive layouts.
- **Developer & Build Suite**: **Vite 6** paired with **TypeScript 5.8** for native modular type safety.
- **Graphic Identity**: Styled in a polished, minimalist high-contrast theme (Slate, Onyx, and Warm Linen accents) built with **Tailwind CSS**.
- **Micro-Interactions**: Fluid, staggered transitions, metrics indicators, and responsive panels powered by **Motion** (`motion/react`) and vectorized icons via **Lucide React**.

---

## ⚙️ Step-by-Step Guide: Running the Code on Any Device

### 💻 A. Running the Project on a Laptop / Desktop (Local Environment)

Follow these simple steps from scratch to boot up the application locally:

#### Step 1: Install Node.js
Ensure you have **Node.js** (v18 or higher recommended) installed. You can check if it's already installed by opening your command line (terminal or command prompt) and running:
```bash
node -v
```
*(If you do not have Node.js, download it from [nodejs.org](https://nodejs.org/) and install it).*

#### Step 2: Extract or Clone the Directory
Ensure your project files are organized in a directory. For example, on a Windows laptop, this might be:
```
D:\codealpha_tasks\CodeAlpha_Chatbot_for_FAQs
```

#### Step 3: Open terminal inside the Project Directory
Opening terminal inside the correct folder is crucial:
* **Windows**: Open **File Explorer**, navigate to the `CodeAlpha_Chatbot_for_FAQs` folder, click on the address bar at the top, type `cmd`, and press **Enter**.
* **macOS / Linux**: Open **Terminal**, type `cd ` (with a space), drag the project folder from your Finder into the terminal window, and press **Enter**.

Alternatively, you can change drives and folders manually in a standard command window:
```cmd
D:
cd \codealpha_tasks\CodeAlpha_Chatbot_for_FAQs
```

#### Step 4: Install Dependencies
Download and restore all required libraries, engines, and dependencies by running:
```bash
npm install
```

#### Step 5: Start the Development Server
Spawn the server and launch the reactive playground:
```bash
npm run dev
```

#### Step 6: Load the Web App
Vite will instantly build the local site. In your terminal, look for the URL (normally `http://localhost:3000` or `http://localhost:5173`). Copy-paste it into your web browser (Chrome, Edge, Safari, Brave, etc.) to start testing!

---

### 📱 B. Running or Viewing on a Mobile Device

Since static builds have no server-side requirements, you can access your app on mobile devices using **either** of these methods:

#### Method 1: Local Network Over WiFi (Fastest Testing)
Ensure your laptop and mobile device are connected to the exact same Wi-Fi network:
1. When you run `npm run dev -- --host` (or if Vite hosts automatically externally), it print a **Network IP** address (e.g., `http://192.168.1.15:3000`).
2. Open the browser on your phone and type that **Network IP** URL exactly.
3. *Note:* If it fails to connect, make sure your computer's firewall is not blocking incoming ports.

#### Method 2: Host Online (Recommended)
Because the codebase is completely self-contained and precompiled on the client, you can deploy it online for free on secure services in under a minute!
1. Import your project into GitHub.
2. Link the repository to free static hosting systems like **Vercel**, **Netlify**, or **GitHub Pages**.
3. It will generate a custom public link (e.g., `https://my-nlp-sandbox.vercel.app`) that opens flawlessly inside any mobile browser!

---

## 🚀 Step-by-Step Guide: Pushing Your Code to GitHub

When you saw the error **`error: remote origin already exists`**, it was because your Command Prompt was still inside `C:\Users\laksh>`! Doing `git init` there erroneously initialized your main Windows user folder.

Follow this exact terminal checklist to reset and push **only** your project code inside `D:\codealpha_tasks\CodeAlpha_Chatbot_for_FAQs`:

### Step 1: Open your command line inside the correct directory
Run these two commands to switch to your project partition and navigate into the target folder:
```cmd
D:
cd \codealpha_tasks\CodeAlpha_Chatbot_for_FAQs
```

### Step 2: Initialize a brand new Git repo within this specific project folder
```cmd
git init
```

### Step 3: Link your empty GitHub repository
To prevent existing remote clashes within your subfolders, we use the primary repository URL. Set this specific URL as your origin link:
```cmd
git remote add origin https://github.com/LakshChinchmalatpure/codealpha_tasks.git
```
*(Notice the remote ends in `.git` rather than a `/tree/main/...` path; this is the proper repository address).*

*If your terminal says `error: remote origin already exists`, remove it first then retry:*
```cmd
git remote remove origin
git remote add origin https://github.com/LakshChinchmalatpure/codealpha_tasks.git
```

### Step 4: Step-by-step staging & staging files
Stage your components, package indices, styles, and configurations:
```cmd
git add .
```

### Step 5: Commit your files locally
Create a structured savepoint and specify your initial work:
```cmd
git commit -m "Initialize NLP FAQ Similarity Sandbox & Smart Chatbot"
```

### Step 6: Identify or name your branch
Ensure the main branch matches current standard parameters:
```cmd
git branch -M main
```

### Step 7: Push the code to GitHub (Force-push to overwrite any stale/placeholder lines)
Since your repository holds placeholders you want to replace, push the local code cleanly to the master branch online:
```cmd
git push -u origin main --force
```

Now, refresh `https://github.com/LakshChinchmalatpure/codealpha_tasks` online, and you will see your entire source code structure (including this README, your preprocessors, components, styles, and configurations) beautifully uploaded!
