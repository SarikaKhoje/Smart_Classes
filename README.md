# 🎓 Kashvi SmartClass - Complete EdTech & School Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT_Token-FB542B?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

**Kashvi SmartClass** is an institutional academic management system for schools and coaching institutes. It includes role-based **Admin**, **Teacher**, **Student**, and **Parent** portals, attendance and homework management, lecture feedback, live classes, parent-teacher messaging and appointments, private in-app notifications, verified parent-child links, and Razorpay-hosted fee payments.

The supported class grades are **7, 8, 9, and 10**; section/division suffixes are not accepted by the UI or API.

---

## 🌟 Key Features by Role

### 👑 1. Admin Dashboard (`/dashboard/admin`)
- **Institutional Overview**: Real-time stats on total students, faculty members, fee revenue collections, and system health.
- **User Directory**: Create, update, search, and manage faculty, student, and parent accounts with encrypted passwords and unique IDs (e.g. `STU-2024-XXXX`).
- **Relationship Management**: Verify parent–student links and explicitly assign teachers to individual students; admins can manage all institutional accounts.
- **Academic Timetable Scheduler**: Day/time/class schedule management with automated backend conflict detection (`TEACHER_COLLISION`, `CLASS_COLLISION`, `ROOM_COLLISION`).
- **Fee Management**: Create tuition invoices, monitor revenue analytics, and track real-time settlement status.
- **Study Notes Governance**: View and manage curriculum documents across all grades.
- **Audit History**: Review paginated records of account, relationship, fee, payment, and check-in changes.
- **Parent verification**: Administrators explicitly link and unlink parent accounts to student accounts.
- **Admission enquiries**: Review public enquiries and update their status.

### 👨‍🏫 2. Teacher Dashboard (`/dashboard/teacher`)
- **Attendance Register**: Class attendance marking (`Present`, `Absent`, `Leave`, `Holiday`) with a "Mark All Present" helper.
- **Assigned Students**: View and manage records only for students explicitly linked by an administrator; class-wide teaching remains scoped to assigned grades.
- **Arrival / Departure**: Record and review student arrivals and departures by date, without collecting location data.
- **Homework Hub**: Create homework assignments with due dates, attachments, duplicate prevention, and submissions review.
- **Live Classroom Scheduling**: Schedule and launch Google Meet / Zoom live classes.
- **Study Materials Repository**: Upload and publish subject notes, PDF guides, and revision resources.
- **Private study material access**: Students and linked parents can browse class resources and download uploaded files through authorization-checked endpoints.
- **Parent communication**: Message verified parents and publish meeting availability for assigned classes.

### 🎒 3. Student Dashboard (`/dashboard/student`)
- **Academic Learning Workspace**: Daily schedule, quick concept boosters, and performance stats.
- **Attendance Analytics**: Visual breakdown of attendance percentage with graphical metric cards.
- **Homework & Submissions**: View assigned tasks, upload file attachments/links, and track submission feedback.
- **Dynamic Leaderboard**: Live academic ranking calculated dynamically from weighted test scores and attendance consistency.
- **🤖 AI Study Plan Generator**: Adaptive 7-day personalized study timetable powered by **Google Gemini 1.5 Flash** (with built-in academic intelligence engine fallback) and MongoDB persistence.
- **Live Virtual Classes**: Join scheduled live lectures directly with one click.
- **Lecture Feedback**: Submit feedback forms created by teachers.
- **Notifications**: View private account updates such as attendance, homework, and institute announcements.

### 👨‍👩‍👦 4. Parent Dashboard (`/dashboard/parent`)
- **Multi-Ward Switcher**: Switch seamlessly between enrolled children under a single guardian account.
- **Live Attendance Monitor**: Daily attendance log and cumulative presence percentage.
- **Arrival / Departure**: Review staff-recorded arrival and departure events for linked students.
- **Fee Invoices & Online Payments**: View invoices and pay through Razorpay Checkout. Payment status and receipts are only finalized after server-side verification.
- **Report Cards**: Term-by-term score sheets, percentages, subject grades, and faculty remarks.
- **Homework, timetable & announcements**: View real records for linked students.
- **Study materials**: Browse learning resources for a selected linked child.
- **Teacher communication**: Send private messages and book available parent-teacher appointments.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend API** | Node.js (ES Modules), Express.js 4.19, Mongoose 8.4, Axios |
| **Database** | MongoDB (Local `mongodb://127.0.0.1:27017` or MongoDB Atlas) |
| **Authentication & Security** | JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express Validator, CORS, Strict Parent IDOR Protection |
| **AI Engine** | Google Gemini 1.5 Flash API + Built-in Adaptive Academic Planner |
| **Payments** | Razorpay Checkout, server-side payment signature verification and capture, signed webhook handling |
| **File Storage & Media** | Multer, Cloudinary SDK |
| **Frontend Options** | • **React Web Client**: React 18, Vite 5, Tailwind CSS, Lucide Icons, React Router DOM 6/7, React Hot Toast, Axios<br>• **Standalone Portal**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js |
| **Logging & Utilities** | Morgan, Dotenv, Nodemailer |

---

## 🧭 How the Application Works

Kashvi SmartClass has two main parts:

- **Frontend (`frontend/`)**: the website shown in the browser. React builds the pages and responds to user actions.
- **Backend (`backend/`)**: the API server. Express receives frontend requests, checks permissions, applies application rules, and reads or writes database records.
- **Database (MongoDB)**: stores accounts and school records. Mongoose defines how the application reads and writes those records.

The frontend and backend communicate using HTTP requests and JSON responses. During local development, Vite forwards requests beginning with `/api` to the backend at `http://localhost:5000`.

### Example: a teacher marks attendance

1. The teacher opens the attendance area in the React dashboard and submits a form.
2. The frontend sends the attendance information to an API endpoint using Axios.
3. Express matches the URL to a route. Middleware checks the user's token, role, and request data.
4. The controller applies the attendance rules and uses a Mongoose model to save the record in MongoDB.
5. The backend returns a success or error response. React then displays the result to the teacher.

In short:

```text
User → React page → Axios request → Express route → middleware/controller
     → Mongoose model → MongoDB → JSON response → updated React page
```

### Login and role-specific access

1. The login page sends the user's email and password to `POST /api/auth/login`.
2. The backend checks the account and password. Passwords are hashed with `bcryptjs`; the original password is not stored as plain text.
3. When credentials are correct, the backend returns a signed JWT (JSON Web Token) and basic user information.
4. The frontend stores the token in browser local storage and sends it with later API requests in the `Authorization` header.
5. React Router and `ProtectedRoute` direct the user to the appropriate dashboard. The backend also checks authentication and role permissions, so access is not based only on hiding frontend pages.

### Main code areas

| Location | Responsibility |
|---|---|
| `package.json` | Root convenience commands for starting the app and seeding data. |
| `frontend/src/main.jsx` | Starts React, browser routing, notifications, and global CSS. |
| `frontend/src/App.jsx` | Connects browser URLs to pages and role-protected dashboards. |
| `frontend/src/pages/` | Screens for login, public home, and Admin, Teacher, Student, and Parent features. |
| `frontend/src/components/` | Reusable interface pieces, including layouts and protected-route checks. |
| `frontend/src/context/` | Shared state, including authentication, language, and theme settings. |
| `frontend/src/services/api.js` | Axios setup for API requests and attaching the saved JWT. |
| `frontend/src/styles/` | Global frontend styles. |
| `frontend/vite.config.js` | Vite development configuration and `/api` proxy to the backend. |
| `backend/server.js` | Loads environment settings, connects to MongoDB, configures Express middleware, and starts the API server. |
| `backend/routes/` | Defines API URL paths and connects each path to its controller. `routes/index.js` groups the feature routes under `/api`. |
| `backend/controllers/` | Handles the work for API requests, such as login, attendance, homework, and fees. |
| `backend/models/` | Mongoose schemas that describe the data stored in MongoDB, such as users, attendance, and homework. |
| `backend/middleware/` | Reusable request checks and processing, including authentication, role authorization, validation, and error handling. |
| `backend/config/` | External-service configuration such as the database, email, and Cloudinary. |
| `backend/utils/` | Shared helpers, including ID generation, password utilities, and demo-data seeding. |
| `backend/tests/` | Automated tests for selected backend behavior. |
| `backend/.env` | Local secrets and environment settings. Create this from `backend/.env.example`; do not commit or share it. |

### A short presentation explanation

> “Kashvi SmartClass has a React frontend, an Express and Node.js backend, and a MongoDB database. The frontend displays role-specific pages and sends requests to the backend. The backend verifies the user's identity and permissions, performs the requested operation, and reads or saves records in MongoDB. It returns a response that the frontend displays.”

---

## 📁 Project Structure

```
kashvi/
├── backend/                     # Node.js Express REST API
│   ├── config/                  # Database, Email & Cloudinary configs
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   └── email.js
│   ├── controllers/             # Request handlers for all modules
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── feeController.js
│   │   ├── notificationController.js
│   │   ├── onlineClassController.js
│   │   ├── parentController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   ├── studyMaterialController.js
│   │   ├── teacherController.js
│   │   └── timetableController.js
│   ├── middleware/              # Auth guard, role check, trial guard, upload, error handler
│   ├── models/                  # Mongoose Schemas (User, Attendance, Homework, Fee, StudyPlan, etc.)
│   ├── routes/                  # Modular API routes
│   ├── utils/                   # Seed data, ID generator, notification service, verification suite
│   ├── .env.example             # Backend environment template
│   ├── package.json
│   └── server.js                # Express entry point
│
├── frontend/                    # Vite + React Modern Web Client
│   ├── src/
│   │   ├── components/          # Layout, Sidebar Navigation, ProtectedRoute
│   │   ├── context/             # AuthContext (JWT state & 2FA handlers)
│   │   ├── pages/               # Multi-role dashboard pages (Admin, Teacher, Student, Parent, Login)
│   │   ├── services/            # Axios API clients
│   │   ├── styles/              # Global Tailwind CSS stylesheet
│   │   ├── App.jsx              # Application router
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── index.html                   # Standalone Full-Featured Interactive Portal
├── app.js                       # Interactive portal application logic & charts
├── styles.css                   # Premium glassmorphic stylesheet
├── package.json                 # Root convenience scripts
└── README.md                    # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### 1. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` while in the `backend/` directory. In PowerShell:
   ```powershell
   Copy-Item .env.example .env
   ```
   Set `JWT_SECRET` to a unique random value (at least 32 characters) and set `MONGODB_URI` to a running MongoDB instance. The API refuses to start without `JWT_SECRET`.
   To enable password-reset email, configure `EMAIL_USER` and `EMAIL_PASS` with a real Gmail account and an app password. Recovery requests fail explicitly until SMTP credentials are set; the app does not generate or display fake reset codes.
   For verified online payments, also provide your own Razorpay test/live credentials and configure the `payment.captured` webhook URL as `https://<your-api-host>/api/fees/razorpay/webhook`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=...
   ```

4. **Seed demo data (optional)**:
   Seeding adds demo users and records only to an empty database. It refuses to run if any checked collections already contain data; it does not delete or overwrite records.
   ```bash
   npm run seed
   ```

5. **Start the API Server**:
   ```bash
   # Development mode with hot-reload
   npm run dev

   # Production mode
   npm start
   ```
   *Server will run at `http://localhost:5000` (Health check: `http://localhost:5000/health`). The default bind address is loopback (`127.0.0.1`).*

---

### 2. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite dev server**:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

### 3. Root Workspace Commands (Convenience)

From the project root folder:
```bash
# Run backend development server
npm run dev:backend

# Run frontend development server
npm run dev:frontend

# Seed database
npm run seed
```

---

## 🔑 Demo Credentials

These credentials are for local demo data only. Change them before deploying or exposing the app to a network.

| Role | Email / Unique ID | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kashvi.com` / `ADMIN-2024-0001` | `Admin@2024` | Full system control, timetable & user setup |
| **Teacher** | `teacher@kashvi.com` / `TCH-2024-0048` | `Teacher@123` | Class 10, 8 Mathematics |
| **Student** | `student@kashvi.com` / `STU-2024-1284` | `Student@123` | Class 10 (Aarav Sharma) |
| **Parent** | `parent@kashvi.com` / `PRN-2024-0980` | `Parent@123` | Guardian of Aarav Sharma & Rhea |

## Implementation Notes and Known Limits

- The project uses grades 7–10 and explicit teacher/student links; it does not yet have separate batch, subject-enrolment, or course-enrolment records.
- Published tests currently support automatically graded multiple-choice questions. Server-side test-duration enforcement and teacher-entered/manual marks are not implemented.
- Authenticator-based TOTP is supported through `/api/auth/enable-2fa`: call it while signed in to receive an `otpauth://` URI, then submit the six-digit code to the same endpoint to finish setup. The project does not include a QR-code enrollment screen, and authenticator secrets are stored in the application database; protect the database with appropriate access controls and encryption at rest.
- Logout removes the token from the current browser, but JWTs are stateless and cannot be revoked before their configured expiry if copied elsewhere.
- Password-reset email requires valid Gmail SMTP credentials. Razorpay payment flows require real provider credentials; external payment success/failure scenarios have not been exercised without those credentials.
- Audit history records account, parent/teacher relationship, fee/payment, and check-in events. It is not yet a complete event log for every change in the application.
- Automated backend tests cover class validation, student test-answer handling, and TOTP behavior. Full four-role browser workflows, live MongoDB migration behavior, and Razorpay gateway callbacks still require environment-backed integration testing.

---

## 🔌 API Reference Overview

All API endpoints are prefixed with `/api`:

The `AuditLog` collection is created by Mongoose when the first audit event is written; existing collections and records are not deleted or rewritten. Added user relationship and two-factor-authenticator fields are optional schema fields.

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & retrieve JWT token
- `POST /api/auth/register` - Register new user account (Admin only)
- `GET /api/auth/me` - Get current authenticated user profile
- `POST /api/auth/verify-2fa` - Two-factor authentication verification
- `POST /api/auth/enable-2fa` - Start authenticator enrollment while signed in; submit the authenticator code to complete setup
- `PUT /api/auth/change-password` - Change account password

### 👑 Admin (`/api/admin`)
- `GET /api/admin/dashboard-stats` - Get institutional stats and telemetry
- `GET /api/admin/users` - List all users (filters: role, class, search query)
- `POST /api/admin/users` - Create new user with hashed password
- `DELETE /api/admin/users/:id` - Remove/deactivate user account
- `GET /api/admin/audit-logs?page=1&limit=25` - List paginated sensitive-operation audit history (admin only)
- `/api/admin/courses` - Create, list, update, and delete public course-directory entries

### 👨‍🏫 Teacher (`/api/teacher`)
- `POST /api/teacher/attendance/mark` - Record batch attendance with remarks
- `GET /api/teacher/attendance` - Query attendance history
- `POST /api/teacher/homework` - Create homework with duplicate detection
- `GET /api/teacher/homework` - View assignments and submissions
- `GET /api/teacher/my-students` - Get assigned students list

### 🎒 Student (`/api/student`)
- `GET /api/student/dashboard` - Get student metrics & schedule
- `GET /api/student/attendance` - Get attendance summary & history
- `GET /api/student/homework` - Get homework assignments & submission status
- `POST /api/student/homework/:id/submit` - Submit solution with file upload/link
- `GET /api/student/leaderboard` - Live dynamic academic rankings
- `GET /api/student/study-plan` - Get saved AI study plan
- `POST /api/student/study-plan` - Generate & persist personalized AI study plan

### 🗣️ Lecture Feedback (`/api/feedback`)
- `POST /api/feedback/teacher` - Create a lecture feedback form for a class (Teacher/Admin)
- `GET /api/feedback/teacher` - View forms and student responses (creating Teacher/Admin)
- `GET /api/feedback/student` - List feedback forms for the student's class
- `POST /api/feedback/student/:id/responses` - Submit a 1–5 lesson rating and optional comment once per form

Teachers can create forms from **Lecture Feedback** in their dashboard. Students submit feedback from the same dashboard section; their names and responses are visible to the teacher.

### 👨‍👩‍👦 Parent (`/api/parent`)
- `GET /api/parent/children` - Get linked student profiles
- `GET /api/parent/children/:id/attendance` - Get attendance log of specific child
- `GET /api/parent/children/:id/fees` - View tuition fee invoices of child
- `GET /api/parent/children/:id/reports` - View term academic report cards
- `GET /api/parent/children/:id/homework` - View homework for a verified linked child
- `GET /api/parent/children/:id/timetable` - View the linked child's timetable
- `GET /api/parent/children/:id/check-ins` - View arrival/departure records

### 💳 Fees & Payments (`/api/fees`)
- `GET /api/fees` - List invoices (Role-filtered)
- `GET /api/fees/:id` - Get invoice details
- `POST /api/fees` - Create fee invoice (Admin only)
- `POST /api/fees/:id/order` - Create a Razorpay Checkout order
- `POST /api/fees/:id/pay` - Verify Razorpay's signature and capture the payment server-side
- `POST /api/fees/razorpay/webhook` - Receive signed payment-captured webhooks

### 🌐 Public and communications
- `GET /api/public/courses` and `GET /api/public/teachers` - Public course/faculty directory
- `POST /api/public/admission-enquiries` - Submit a validated admission enquiry
- `GET /api/admission-enquiries` and `PUT /api/admission-enquiries/:id` - Admin enquiry management
- `/api/user-notifications` - Read private notifications; mark one or all read
- `/api/messages/children/:studentId` - Parent/assigned-teacher conversation, scoped to verified relationships
- `/api/meetings` - Teacher availability, parent bookings, and participant cancellation
- `/api/check-ins` - Teacher/admin arrival and departure records

The unauthenticated React home page is available at `/` and `/home`; the admission enquiry form is on `/admission`.

### 📅 Timetable (`/api/timetable`)
- `GET /api/timetable` - Get class/teacher schedule
- `POST /api/timetable` - Create slot with clash detection (`TEACHER_COLLISION`, `CLASS_COLLISION`, `ROOM_COLLISION`)
- `DELETE /api/timetable/:id` - Remove timetable slot

### 📚 Study Materials (`/api/notes`)
- `GET /api/notes` - Get curriculum notes & PDF downloads
- `POST /api/notes` - Upload new study material
- `DELETE /api/notes/:id` - Delete study material

### 📹 Online Classes (`/api/online-classes`)
- `GET /api/online-classes` - Get scheduled live lectures
- `POST /api/online-classes` - Schedule live class (Google Meet / Zoom)
- `PUT /api/online-classes/:id` - Update live class details
- `DELETE /api/online-classes/:id` - Cancel live class

---

## 🔒 Security & Architecture Highlights
- **Password Hashing**: Cryptographic salting and hashing via `bcryptjs`.
- **JWT Protection**: Stateless bearer tokens with strict expiration.
- **Strict IDOR Prevention**: Parent endpoints verify child ownership to prevent unauthorized data access.
- **HTTP Header Security**: Protected against XSS, clickjacking, and MIME sniffing via `helmet`.
- **Input Sanitization**: Request validation and schema checks via `express-validator`.
- **Timetable Conflict Engine**: Automated validation preventing teacher, room, and class double-booking.
