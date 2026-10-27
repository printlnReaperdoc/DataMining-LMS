# Data Mining (Elective 2) — ITEP411-T Learning Management System (LMS)

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Security](https://img.shields.io/badge/Security-Helmet%20%7C%20Bcrypt%20%7C%20CSRF%20%7C%20RateLimit-red.svg)]()
[![Automated Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)]()

A secure, production-grade university Learning Management System (LMS) purpose-built for **Data Mining (Elective 2) — Course Code: ITEP411-T (4th Year, 1st Term)**.

This system is 100% database-driven with MySQL 8.0+ acting as the authoritative source of truth for persistent application state: users, courses, modules, chapters, lessons, quizzes, question banks, student attempts, answer histories, sequential topic unlocks, gradebooks, and centralized audit logs.

---

## Table of Contents
1. [Course Metadata & Curriculum Hierarchy](#course-metadata--curriculum-hierarchy)
2. [Technology Stack](#technology-stack)
3. [System Architecture & Security Model](#system-architecture--security-model)
4. [Prerequisites & System Requirements](#prerequisites--system-requirements)
5. [Installation & Setup Guide](#installation--setup-guide)
6. [Database Migration & Seeding](#database-migration--seeding)
7. [Running the Application](#running-the-application)
8. [Automated Test Suite](#automated-test-suite)
9. [Role-Based Access Control (RBAC) & Workflows](#role-based-access-control-rbac--workflows)
10. [Sequential Unlocking & Assessment Engine](#sequential-unlocking--assessment-engine)
11. [Gradebooks & Reporting Exports](#gradebooks--reporting-exports)
12. [Centralized Audit Logging](#centralized-audit-logging)
13. [Database Backup & Restoration Procedures](#database-backup--restoration-procedures)
14. [Troubleshooting & Production Hardening](#troubleshooting--production-hardening)

---

## 1. Course Metadata & Curriculum Hierarchy

The LMS enforces and presents the official curriculum structure across student and faculty interfaces:

- **Course Title**: Data Mining (Elective 2)
- **Course Code**: ITEP411-T
- **Classification**: IT Professional Elective 2
- **Academic Level**: 4th Year
- **Term**: 1st Term (4-1)

### 4 Modules & 12 Structured Chapters
* **Module 1: Foundations and Preprocessing**
  - **Chapter 1**: Introduction to Data Mining *(KDD pipeline, data types, OLAP vs Data Mining, ethical considerations)*
  - **Chapter 2**: Data, Measurements, and Data Preprocessing *(Scales, statistics, cleaning, normalization, PCA)*
  - **Chapter 3**: Data Warehousing and Online Analytical Processing (OLAP) *(Schemas, cubes, drill-down, roll-up, slice, dice)*
* **Module 2: Pattern Mining and Association**
  - **Chapter 4**: Pattern Mining: Basic Concepts and Methods *(Market basket analysis, support/confidence, Apriori principle)*
  - **Chapter 5**: Pattern Mining: Advanced Methods *(FP-Growth, FP-Trees, closed/maximal itemsets, Lift, correlation)*
* **Module 3: Classification and Machine Learning**
  - **Chapter 6**: Classification: Basic Concepts and Methods *(Decision trees, Entropy, Information Gain, Gini, Naive Bayes)*
  - **Chapter 7**: Classification: Advanced Methods *(Bagging, Random Forests, Boosting, AdaBoost, SVM, Kernels, ROC/AUC)*
* **Module 4: Clustering and Advanced Mining**
  - **Chapter 8**: Cluster Analysis: Basic Concepts and Methods *(Distance metrics, k-Means, PAM, Hierarchical linkage)*
  - **Chapter 9**: Cluster Analysis: Advanced Methods *(DBSCAN, OPTICS, grid-based methods, Silhouette Coefficient)*
  - **Chapter 10**: Deep Learning *(MLP, activation functions, backpropagation, CNNs, RNN/LSTM, Dropout)*
  - **Chapter 11**: Outlier Detection *(Point/contextual/collective anomalies, LOF, Isolation Forests)*
  - **Chapter 12**: Data Mining Trends and Research Frontiers *(Streams, concept drift, graph mining, Differential Privacy, XAI)*

---

## 2. Technology Stack

- **Backend Runtime**: Node.js (v20+ or v22 LTS)
- **Web Framework**: Express.js (v5)
- **Database Engine**: MySQL 8.0+ (InnoDB, UTF8mb4 Unicode)
- **Database Connectivity**: `mysql2` connection pooling with parameterized queries and transaction isolation
- **Session Store**: `express-session` with `express-mysql-session` persistent store
- **Password Security**: `bcryptjs` (cost factor 12)
- **Security & Headers**: `helmet` (custom Content-Security-Policy), `express-rate-limit`, CSRF token validation
- **Validation**: `express-validator` server-side schema constraints
- **File Uploads**: `multer` with MIME-type restriction and isolated storage
- **Spreadsheet Generation**: `exceljs` for `.xlsx` and CSV generation
- **PDF Generation**: `pdfkit` for vector academic reports and transcripts
- **Frontend Architecture**: Standards-compliant HTML5, CSS3 Custom Properties design system, and Vanilla JavaScript (No React, Vue, or client-side mock databases).

---

## 3. System Architecture & Security Model

```
data-mining-lms/
├── package.json                   # Root package script runner
├── README.md                      # Comprehensive production manual
├── backend/
│   ├── server.js                  # Primary Express entrypoint
│   ├── package.json               # Backend dependencies & test scripts
│   ├── .env                       # Local runtime environment secrets
│   ├── .env.example               # Environment template with placeholders
│   ├── config/
│   │   └── db.js                  # MySQL pool & transaction runner
│   ├── middleware/
│   │   ├── auth.js                # Authenticated session verifier
│   │   ├── authorize.js           # Role-based access control (Faculty vs Student)
│   │   ├── csrf.js                # CSRF header token validator
│   │   ├── requestId.js           # Request UUID tracking
│   │   └── validate.js            # Express-validator error handler
│   ├── controllers/               # Business logic controllers
│   ├── routes/                    # Modular RESTful API route definitions
│   ├── services/
│   │   ├── audit.service.js       # Centralized transactional audit logger
│   │   ├── grading.service.js     # Authoritative server-side quiz grading
│   │   ├── progress.service.js    # Sequential unlock & curriculum stats
│   │   └── export.service.js      # ExcelJS & PDFKit report generators
│   ├── database/
│   │   ├── schema.sql             # MySQL 15-table relational schema
│   │   ├── seed.js                # Repeatable database seed script
│   │   ├── seedData.js            # Curriculum data assembler
│   │   ├── seedDataPart1.js       # Modules 1-3 & Chapters 1-6 + 120 questions
│   │   └── seedDataPart2.js       # Module 4 & Chapters 7-12 + 120 questions
│   ├── storage/
│   │   └── uploads/               # Protected lesson attachments directory
│   └── tests/
│       └── lms.test.js            # End-to-end automated test suite
└── frontend/
    ├── index.html                 # Single-page responsive web application
    ├── css/
    │   └── app.css                # Polished accessible design system
    └── js/
        └── app.js                 # Vanilla JS application controller
```

### Security Hardening Measures
1. **Authoritative Server Grading**: The client never submits scores or receives answer keys before completion. Raw answers are evaluated against server-side keys within an atomic database transaction.
2. **Server-Enforced 10-Minute Limit**: Deadlines are validated by comparing server submission timestamps against stored `started_at` timestamps. Client timers are purely visual.
3. **Session Fixation Defense**: Sessions are regenerated upon successful authentication (`req.session.regenerate()`).
4. **Role Isolation**: Public registration rejects role escalation; public registrants are strictly assigned `student`. Faculty accounts require administrative credentials.
5. **Private Gradebook Isolation**: Direct object reference (IDOR) protection ensures students cannot access other students' attempt records.

---

## 4. Prerequisites & System Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu Linux 22.04+
- **Node.js**: `v20.x` or `v22.x` (`node -v` to verify)
- **npm**: `v10.x`+ (`npm -v` to verify)
- **MySQL Server**: `v8.0` or higher (`mysql --version` to verify)

---

## 5. Installation & Setup Guide

### Step 1: Clone or Navigate to the Project Root
```bash
cd DataMining-LMS
```

### Step 2: Install Node.js Dependencies
```bash
# Install dependencies in the backend
npm --prefix backend install
```

### Step 3: Configure Environment Variables
Create `.env` from the provided template:
```bash
# On Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# On macOS / Linux:
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your MySQL credentials:
```ini
PORT=3000
NODE_ENV=development
SESSION_SECRET=216d56ec7964c49e50aa185e36533c3debb358072fd5a4f9f22eff1220e4491adb5217ed410fcd4c4822938e1214128c677a6003d979f0dbd86181909544319d

# MySQL Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=datamininglms
DB_USER=root
DB_PASSWORD=

# Initial Faculty Account Seed
FACULTY_USERNAME=faculty
FACULTY_PASSWORD=FacultyPass123!
FACULTY_FIRST_NAME=Dr. Evelyn
FACULTY_SURNAME=Vance

# Demo Student Default Password
STUDENT_PASSWORD=StudentPass123!

UPLOAD_DIR=storage/uploads
```

---

## 6. Database Migration & Seeding

The seed script creates the MySQL database `datamininglms`, executes the schema migration (creating all 15 tables with foreign keys and unique constraints), populates the 4 modules, 12 chapters, comprehensive lesson summaries, objectives, markdown content, key concepts, slide carousels, and **240 curriculum-aligned questions** (exactly 20 per chapter).

Run the repeatable seed:
```bash
# From the root directory:
npm run seed

# Or directly from backend:
npm --prefix backend run seed
```

### Initial Seed Accounts:
| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Faculty** | `faculty` | `FacultyPass123!` | Course instructor & administrator |
| **Student 1** | `student1` | `StudentPass123!` | Sample student: Passed Chapters 1 & 2 (Ch 3 unlocked) |
| **Student 2** | `student2` | `StudentPass123!` | Sample student: Ch 1 passed after retake; Ch 2 failed (14/20) |
| **Student 3** | `student3` | `StudentPass123!` | Newly enrolled student: Ch 1 available, Ch 2-12 locked |

---

## 7. Running the Application

### Development Startup:
```bash
# From workspace root:
npm start

# Or directly from backend:
node backend/server.js
```

Open your browser to:
**`http://localhost:3000`**

---

## 8. Automated Test Suite

The automated test suite runs end-to-end tests against MySQL, verifying:
- Registration, password hashing, and prevention of faculty role escalation.
- Sequential chapter gatekeeping (Chapter 1 unlocked, Chapter 2 locked until passing Ch 1).
- Server-side scoring (14/20 fails, 15/20 passes and unlocks next chapter).
- Duplicate submission prevention.
- Import validation (rejects quizzes not containing exactly 20 questions).
- Topic Gradebook & Master Gradebook calculations.
- CSV, XLSX, and PDF export buffer generation.
- MySQL audit log persistence.
- IDOR access denial when a student attempts to access another student's attempts.

Run the test suite:
```bash
npm test
```

---

## 9. Role-Based Access Control (RBAC) & Workflows

### Student Workflow
1. **Sign In**: Student signs in or registers via the public form.
2. **Dashboard Overview**: Views completion percentage, chapters passed (X/12), current average, and remaining assessments.
3. **Curriculum Navigation**: Sidebar shows real-time chapter status:
   - 🔒 **Locked**: Requires passing previous chapter with ≥ 75%.
   - 🔓 **Available**: Unlocked for study and assessment.
   - ✅ **Passed**: Displays highest score (e.g. `18/20`).
   - ⚠️ **Failed**: Below 15/20; retakes available anytime.
4. **Lesson Study & Slide Viewer**: Reviews overview, learning objectives, detailed content, key concepts, and interacts with the lecture slide carousel.
5. **Taking the Quiz**:
   - 10-minute visual countdown timer.
   - Question palette (1-20) to jump between questions.
   - Radio buttons for options A, B, C, D.
   - Instant score review upon submission.
6. **Transcript & Export**: Student downloads their personal academic report in PDF.

### Faculty Workflow
1. **Curriculum Authoring**: Faculty edits chapter overviews, objectives, markdown content, key concepts, and slide decks.
2. **Material Management**: Uploads PDF and PowerPoint slides (up to 15MB) with download/delete controls.
3. **Quiz Management**:
   - Inspects all 20 questions with answers displayed.
   - Toggles publish status (server verifies 20 questions).
   - Imports questions via JSON, CSV, or Excel (.xlsx).
   - Resets questions to curriculum standards.
4. **Topic Gradebook**:
   - Sorts students by Surname, Score, or Latest Attempt.
   - Drills down into individual student attempt histories.
   - Exports reports to PDF, XLSX, CSV, or browser print view.
5. **Master Gradebook**:
   - Full 12-chapter matrix of all students.
   - Computes overall course average across attempted chapters (excluding unattempted chapters, not treating them as zero).
   - Administrative progress override modal to manually unlock or credit chapters with required audit justification.
6. **Audit Trail**: Inspects system mutation logs with actor, action, timestamp, IP, and structured JSON change diffs.
7. **User Administration**: Provisions authorized faculty accounts.

---

## 10. Sequential Unlocking & Assessment Engine

- **Threshold**: 75% score (minimum **15 correct answers out of 20**).
- **Time Limit**: 600 seconds (10 minutes).
- **Progression Rule**:
  - Chapter 1 is unlocked upon enrollment.
  - Chapter $N+1$ unlocks strictly when Chapter $N$ achieves `status = 'passed'` with $\ge 15/20$ correct answers.
  - Scores $< 15$ record a failed attempt; the next chapter remains locked.
  - Students may retake assessments an unlimited number of times.
  - Passed status is persistent and never revoked by failed retakes.

---

## 11. Gradebooks & Reporting Exports

### Export Formats:
- **PDF**: Formatted reports rendered via `pdfkit` complete with course headers, metadata, zebra tables, and status badges.
- **XLSX**: Native Excel spreadsheets created via `exceljs` featuring title blocks, formatted header cells, colored pass/fail fonts, and column auto-widths.
- **CSV**: RFC 4180-compliant comma-separated value tables.
- **Print**: Dedicated `@media print` CSS stylesheet hiding navigation bars for browser printing.

---

## 12. Centralized Audit Logging

Every critical mutation emits a record to the MySQL `audit_logs` table:
- **Authentication**: `register`, `login`, `failed_login` (passwords redacted), `logout`.
- **Curriculum & Lesson**: `update_chapter`, `update_lesson`, `upload_lesson_file`, `delete_lesson_file`.
- **Assessments**: `start_quiz_attempt`, `quiz_submission`, `quiz_timeout_submission`, `chapter_unlock`, `import_quiz`, `publish_quiz`.
- **Administration**: `progress_override`, `create_faculty_account`, `activate_user`, `deactivate_user`, `export_topic_gradebook`, `export_master_gradebook`.

Audit logs record the `actor_user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `request_id`, timestamp, and sanitized `details_json`.

---

## 13. Database Backup & Restoration Procedures

### Creating a Database Backup:
```bash
mysqldump -u root -p datamininglms > backup_datamininglms_$(date +%Y%m%d).sql
```

### Restoring from Backup:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS datamininglms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p datamininglms < backup_datamininglms_YYYYMMDD.sql
```

---

## 14. Troubleshooting & Production Hardening

- **Port in Use**: If port 3000 is occupied, set `PORT=3001` in `backend/.env`.
- **Database Access Denied**: Verify MySQL credentials in `backend/.env` and test connection:
  ```bash
  mysql -u root -p -h 127.0.0.1 -P 3306
  ```
- **HTTPS & Secure Cookies**: In production, set `NODE_ENV=production` in `.env` to enable secure session cookies, and place behind a reverse proxy (e.g., NGINX or Caddy) with TLS certificates.

---

*Academic LMS built for Data Mining (ITEP411-T) — All assessment logic, grading, sequential gating, and audit trails verified against authoritative MySQL 8.0+ data persistence.*

