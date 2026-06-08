# Revora - Academic Analytics & Feedback System

Revora is a modern, full-stack academic feedback management system built to streamline the collection, management, and analysis of course evaluations for institutions. It features automated course assignments matching students by branch and semester, rich visual analytics for faculty and administrators, and a sleek user interface for students to intuitively submit their feedback.

---

## 🎯 Features

- **Role-Based Workflows**: Separate dashboards designed for Admin, Faculty, and Students.
- **Automated Delivery**: Students are automatically assigned course feedbacks based on their academic profile (Branch, Semester, Section).
- **Extensive UI/UX**: Premium, responsive "Elegant Light Mode" interface with Ivory/Cream backgrounds, soft Emerald/Gold accents, and glassmorphism powered by Tailwind CSS.
- **Dynamic Feedback Forms**: Course-specific customizable feedback forms targeting *Teaching Feedback*, *Curricular Gap Analysis*, and *Course Outcomes*.
- **Admin Control**: Complete management of courses, faculty, students, feedback deadlines, and semester-level tracking.
- **Real-Time Analytics**: Built-in Recharts tracking performance histograms, percentages of student submissions, and question-average ratings.
- **Security First**: JWT-authenticated secure REST API backend with bcrypt password hashing.

---

## ⚙️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS (v4), React Router DOM, Axios, Lucide React (Icons), Recharts.
- **Backend**: Node.js, Express.js, Prisma ORM, JSON Web Tokens (JWT).
- **Database**: MySQL (Hosted locally via MySQL Workbench).

---

## 🚀 Getting Started (Beginner Friendly)

Follow these step-by-step instructions to get the application running on your local machine.

### Prerequisites

Make sure you have downloaded and installed the following on your computer:
1. **[Node.js](https://nodejs.org/en/download/)**: (LTS Version Recommended).
2. **[Git](https://git-scm.com/downloads)**: For tracking and downloading the project.
3. **[MySQL Installer (Workbench)](https://dev.mysql.com/downloads/installer/)**: For running the database server. During installation, remember the "root" password you create!

---

### Step 1: Clone the Repository

Open your terminal (Command Prompt, PowerShell, or Git Bash) and run:
```bash
git clone https://github.com/yourusername/Revora.git
cd Revora
```
*(Replace the URL with your actual GitHub repository URL after you push it).*

---

### Step 2: Database Setup (MySQL Workbench)

Before the project runs, it needs a place to store data. We'll set up a local MySQL server:

1. Open **MySQL Workbench**.
2. Click the `+` icon next to **MySQL Connections** to create a new connection or use your default `Local instance 3306`.
3. Open the connection and type your root password.
4. Open a new SQL Query tab by clicking the SQL icon 📜 with a plus sign at the top left.
5. Inside the query window, type the following to create your database:
   ```sql
   CREATE DATABASE Revora;
   ```
6. Click the lightening bolt icon ⚡ to execute the code. You should see a green checkmark saying it was created successfully.

---

### Step 3: Backend Setup

Now let's configure the backend server to connect to your database.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install all the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a configuration file: 
   Inside the `backend` folder, create a new file named exactly `.env`.
4. Copy and paste the following text into the `.env` file:
   ```ini
   # Database connection string format:
   # mysql://[USERNAME]:[PASSWORD]@localhost:3306/[DATABASE_NAME]
   DATABASE_URL="mysql://root:YOUR_MYSQL_PASSWORD@localhost:3306/Revora"
   
   # Server configuration
   PORT=5000
   JWT_SECRET="Revora_secret_key_change_for_production"
   ```
   **CRITICAL:** Replace `YOUR_MYSQL_PASSWORD` with the actual password you made when installing MySQL Workbench! 

5. Build the Database Schema:
   We use Prisma to automatically generate your database tables. In your backend terminal, run:
   ```bash
   npx prisma db push
   ```
   If successful, Prisma will read your schema and prepare the blank `Revora` database.

6. Start the Backend Server:
   ```bash
   node index.js
   # Or use nodemon for auto-restarts during development
   # npx nodemon index.js
   ```
   *You should see a message saying "Database Engine Successfully Bridged" and "Server running on port 5000".*

---

### Step 4: Frontend Setup

Leave the backend terminal running! We need a second terminal for the frontend.

1. Open a **new terminal** window and navigate to the project root, then into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Frontend Application:
   ```bash
   npm run dev
   ```
4. The terminal will give you a local URL (usually `http://localhost:5173`). Ctrl+Click on it to open Revora in your browser!

---

## 🔑 Default Users

When you first boot up the app, there is no one inside.
1. Click **Sign Up** from the main page to create an account.
2. By default, any account created from the generic registration page is assigned the `STUDENT` role.
3. **To register an Admin or Faculty:** Once you create an initial user, you will need to modify their role in the MySQL Database (change their `role` field from `"STUDENT"` to `"ADMIN"`). Or, the system allows the designated `ADMIN` to spawn Faculty accounts directly from the UI logic. 

**Pro Tip:** If you want testing data quickly, open Prisma Studio on a third terminal:
```bash
cd backend
npx prisma studio
```
This gives you an interactive webpage to easily modify/add users, change roles, and assign courses!

---

## 📁 Project Structure

```text
Revora/
├── backend/
│   ├── controllers/      # Route handler logic 
│   ├── middleware/       # JWT Auth and Role protection
│   ├── prisma/           # Database schemas & migrations
│   ├── routes/           # API Endpoints layout
│   └── index.js          # Core Express server config
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI parts (Layouts, Graph elements)
    │   ├── pages/        # Main route views (Admin, Faculty, Student)
    │   ├── App.jsx       # Routing table definition
    │   └── index.css     # Global Tailwind configurations
    └── tailwind.config.js
```

---

## 🤝 Contribution Guidelines

Found a bug or have a feature request? Feel free to open an Issue or submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
