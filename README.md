# Smart Casino Frontend

## Prerequisites

Before running this project, ensure your machine has the following software installed.

### 1. Node.js and npm
**Required Version:** Node.js **LTS (v18.x or v20.x)** is recommended.
* **Verification:** Run `node -v` and `npm -v` in your terminal.
* **Download:** [Node.js Official Site](https://nodejs.org/)

### 2. IDE (Recommended)
**Visual Studio Code** (VS Code) is recommended for the best development experience with JavaScript/TypeScript.
* **Recommended Extensions:** ESLint, Prettier.

---

## Environment Setup

### Backend Service Requirement
**Critical:** This frontend application relies on the **Smart Casino Backend** to fetch data and authenticate users.
* Ensure the backend application is running on `http://localhost:8080` before interacting with the frontend.
* Refer to the **Smart Casino Backend README** for instructions on how to start the server with the `dev` profile.
    *   **https://github.com/NathanielCurry/Smart-Casino**

---

## Installation & Building

### 1. Clone the repository
If you haven't already, clone the repository and navigate to the project root.

```bash
git clone https://github.com/nateenglert04/Smart-Casino-Frontend.git
cd Smart-Casino-Frontend
```

### 2. Install Dependencies
This command downloads all necessary packages listed in package.json required to run the React/web application.

```bash
npm install
```
**Note**: If you encounter upstream dependency conflicts, you can try running npm install --legacy-peer-deps.

---

## Running the Application

### 1. Start the Development Server
Once dependencies are installed, start the local server with:

```bash
npm run dev
```

### 2. Access the Application
* Look for the output in your terminal (http://localhost:5173)

* **Alt + Click** on the link in your terminal to view the frontend in your browser.

* If the backend is running, you should be able to log in and interact with services immediately.

