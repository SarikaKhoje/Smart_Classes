# 🎨 Kashvi SmartClass - Comprehensive UI/UX Specification & Design Blueprint

---

## 🌟 1. Executive Summary & Design Philosophy

**Kashvi SmartClass** is an institutional-grade, multi-role Academic Management and EdTech Platform. The user interface is engineered to deliver a high-contrast, modern dark-mode aesthetic with glassmorphic transparency, responsive multi-column layouts, contextual telemetry, and role-tailored dashboards.

### Core Design Principles:
1. **Dark-Mode First with Glassmorphism**: Tailored with deep slate backdrops (`#020617` / `slate-950`), semi-transparent backdrop-blurred cards (`backdrop-blur-xl`), and subtle glowing borders (`border-slate-800`).
2. **Role-Based Adaptive Views**: Distinct, highly tailored workspace views for **Administrators**, **Teachers**, **Students**, and **Parents**.
3. **Information Hierarchy & Visual Density**: High-density data tables and telemetry KPI cards combined with generous whitespace, crisp typography, and high-contrast status chips.
4. **Contextual Micro-Interactions**: Hover elevations, glowing focus rings, animated state loaders, instant feedback toast notifications (via *React Hot Toast*), and dynamic vector QR rendering.

---

## 🎨 2. Visual Identity & Design System Tokens

### 2.1 Color Palette

| Token Name | Hex / Tailwind Class | Visual Purpose |
| :--- | :--- | :--- |
| **Canvas Background** | `#020617` (`bg-slate-950`) | Deep obsidian canvas backdrop. |
| **Card / Surface (Glass)** | `rgba(15, 23, 42, 0.8)` (`bg-slate-900/80`) | Main content containers with `backdrop-blur-xl`. |
| **Header & Sidebar** | `rgba(15, 23, 42, 0.95)` (`bg-slate-900/95`) | Persistent navigation frames. |
| **Border Subdued** | `#1E293B` (`border-slate-800`) | Structural dividing lines and modal borders. |
| **Primary Accent** | `#6366F1` (`indigo-500` / `indigo-600`) | Primary actions, branding icons, active tabs. |
| **Success / Present** | `#10B981` (`emerald-500` / `emerald-400`) | "Present" attendance, paid fees, session active badge. |
| **Warning / Pending** | `#F59E0B` (`amber-500` / `amber-400`) | Pending submissions, upcoming fees, late marks. |
| **Danger / Absent** | `#EF4444` (`rose-500` / `rose-400`) | "Absent" flags, overdue invoices, destructive actions. |
| **Cyan / AI Highlight** | `#06B6D4` (`cyan-500` / `cyan-400`) | Gemini AI features, quiz highlights, student ranks. |

### 2.2 Typography & Iconography
- **Font Family**: Modern Sans-Serif (`Inter`, `system-ui`, `-apple-system`).
- **Headings**: Extra Bold / Black (`font-bold`, `font-black`, tracking tight).
- **Monospace**: `font-mono` for Unique IDs (`ADM-2024-001`, `STU-101`), OTP fields, and Transaction IDs.
- **Iconography**: Clean SVG icons from `Lucide React` (React SPA) and `Material Symbols Outlined` (Portal).

---

## 📐 3. Global Navigation & Layout Architecture

The application is framed inside a master responsive shell (`Layout.jsx`):

```
+---------------------------------------------------------------------------------------+
|  [K] Kashvi SmartClass    |  ● Institutional Session Active    |  [Shield: ID / Role] |
+---------------------------+------------------------------------+----------------------+
| [Sidebar Navigation]      | [Main Scrollable Content Canvas]                          |
| - Role-specific link 1    |                                                           |
| - Role-specific link 2    |  - KPI Telemetry Summary Row                              |
| - Role-specific link 3    |  - Tab Filters / Search Bar Row                           |
| - Role-specific link 4    |  - Dynamic Data Grid / Tables / Modals                    |
|                           |                                                           |
| ------------------------- |                                                           |
| [User Initials Avatar]    |                                                           |
| User Name & Email         |                                                           |
| [🚪 Sign Out Button]      |                                                           |
+---------------------------------------------------------------------------------------+
```

### Key Global UI Elements:
- **Collapsible Sidebar (Desktop)**: Fixed 256px (`w-64`) glassmorphic side menu with active-state glow pills (`bg-indigo-600/20 text-indigo-400 border border-indigo-500/30`).
- **Mobile Navigation Drawer**: Hamburger toggle menu with full-screen slideout overlay for mobile viewport responsiveness.
- **Top App Bar**:
  - Left: Brand Logo & Title (Mobile) or Session Liveness Indicator (`Institutional Session Active` with pulsing green dot).
  - Right: Authenticated User Badge displaying institutional Unique ID and Role tag.
- **User Footer Card**: Located at the bottom of the sidebar with avatar initials circle, full name, email, and high-visibility red sign-out CTA.

---

## 🖥️ 4. Screen-by-Screen UI & Functional Breakdown

---

### 4.1 🔐 Authentication & Two-Factor Verification Screen

**Route**: `/login`  
**Components**: `Login.jsx`, `AuthContext.jsx`

#### Visual Layout & Key Elements:
1. **Background Gradient Canvas**: Deep radial gradient transitioning from `slate-950` to `indigo-950`.
2. **Branded Hero Header**:
   - Glowing Indigo logo container with Sparkle icon.
   - Title: `Kashvi SmartClass` with subtitle `Institutional School & Academic Management`.
3. **Quick-Fill Role Switcher Tabs**:
   - Segmented control pills: `[ Admin | Teacher | Student | Parent ]`.
   - Single-click pre-fills verified institutional credentials for rapid evaluation.
4. **Primary Sign-In Form**:
   - **Institutional Email**: Input box with prefix Mail icon and instant validation.
   - **Password**: Password field with show/hide toggle eye icon.
   - **Action Button**: Primary gradient submit button: `Enter [ROLE] Dashboard`.
5. **Two-Factor Authentication (2FA) State**:
   - When 2FA is triggered, the card seamlessly switches to a verification mode.
   - Monospace large tracking input for 6-digit numeric OTP code.
   - Icon header badge highlighting encryption status.

---

### 4.2 👑 Admin Dashboard (Institution Management)

**Route**: `/dashboard/admin/*`  
**Sub-routes**: `/users`, `/timetable`, `/fees`, `/notes`  
**Component**: `AdminDashboard.jsx`

#### 1. Telemetry KPI Metric Cards (Top Row)
- **Total Students**: Active student count with graduation cap icon and batch split.
- **Faculty Staff**: Total registered teachers and subject coverage.
- **Fee Revenue Realized**: Monthly and annual fee collections with percentage realization bar.
- **System Health**: Active classrooms, timetable schedules, and operational status.

#### 2. User Directory & RBAC Management
- **Search & Filter Header**:
  - Search input for name, email, or institutional ID.
  - Role Filter Pills: `All`, `Students`, `Teachers`, `Parents`, `Admins`.
  - **"+ Add User" Primary CTA**: Opens the Add User modal dialog.
- **User Records Data Table**:
  - Columns: User ID badge, Full Name, Email, Assigned Role (color-coded chip), Class/Subject, Action buttons.
  - Deactivate / Delete Action button with confirmation alert.
- **"Add User" Modal**:
  - Modal with backdrop blur and fields: Name, Email, Role selector, Class, Subject, and Password with confirm-password validation.

#### 3. Conflict-Free Timetable Scheduler
- **Timetable Matrix Grid**: Weekly schedule mapped across Monday through Saturday with time slots.
- **Collision Prevention Badges**: Highlights room, teacher, or class conflicts.
- **"Schedule Slot" Modal**: Form with Class, Subject, Teacher dropdown, Day, Start/End time pickers, and Room designation.

#### 4. Institutional Fee Invoices & Revenue Ledger
- **Invoice Overview**: Status tags (`Paid` in green, `Pending` in amber, `Overdue` in red).
- **Invoice Creation Modal**: Generates dynamic tuition fees for individual students or entire batches.

---

### 4.3 👨‍🏫 Teacher Dashboard (Classroom & Faculty Hub)

**Route**: `/dashboard/teacher/*`  
**Sub-routes**: `/attendance`, `/homework`, `/classes`, `/notes`  
**Component**: `TeacherDashboard.jsx`

#### 1. Quick Attendance Marking Hub
- **Control Bar**:
  - Class selector dropdown (e.g., `Class 10`).
  - Interactive Date Picker (`YYYY-MM-DD`).
  - **"⚡ Mark All Present" Quick Action**: Sets all students in the batch to Present with one click.
  - **"💾 Submit Attendance" Action**: Persists batch attendance with instant confirmation toast.
- **Student Roster Attendance List**:
  - Individual student cards with avatar initials and Roll/ID numbers.
  - 3-Way Segmented Toggle buttons: `[ Present (Green) | Absent (Red) | Late (Yellow) ]`.

#### 2. Homework & Assignment Manager
- **Assignment Deck**: Card list of active homework assignments displaying title, subject, due date countdown, and submission counters (`X / Y Submitted`).
- **"Create Assignment" Modal**: Rich dialog with Title, Subject, Class, Due Date picker, and Description / Assignment instructions.

#### 3. Live Online Classrooms Hub
- **Scheduled Virtual Class Cards**: Displays class title, subject, scheduled time, duration in minutes, and direct external launch URL (Google Meet / Zoom).
- **"Schedule Live Class" Modal**: Date-time selector, meeting link validator, and curriculum topic description.

#### 4. Study Notes & Document Uploader
- **Document Repository**: Cards displaying PDF / DOCX file names, uploaded date, subject tag, and download action.
- **"Upload Material" Modal**: Subject selector, file title, and document file URL uploader.

---

### 4.4 🎒 Student Dashboard (Learner Workspace)

**Route**: `/dashboard/student/*`  
**Sub-routes**: `/attendance`, `/homework`, `/leaderboard`, `/ai-plan`, `/classes`  
**Component**: `StudentDashboard.jsx`

#### 1. Academic Health & Telemetry Row
- **Attendance Gauge Card**: Visual attendance health percentage (`92% Present`) with warning alert if below institutional threshold (75%).
- **Homework Progress Card**: Completed vs. Pending assignments tracker.
- **Class Leaderboard Rank**: Real-time rank position (`#1 Batch Topper` / `#3 Honor Roll`).

#### 2. Interactive Homework Submissions
- **Active Assignment List**: Card deck with status pills (`Pending Submission` / `Graded`).
- **"Submit Homework" Modal**:
  - View assignment prompt and teacher instructions.
  - Textarea for typing textual answers and solutions.
  - File / Cloudinary attachment URL input for scanned PDF/images.
  - Instant submission status feedback.

#### 3. Real-Time Peer Leaderboard & Gamification
- **Rank Tier Badges**:
  - 🥇 **#1 Gold Trophy**: Batch Topper.
  - 🥈 **#2 & #3 Silver/Bronze**: Honor Roll Scholars.
  - 🎖️ **Scholars Tier**: Rest of the batch ranking list.
- **Composite Score Bar**: Dynamic progress bar visualizing the composite score formula ($70\%$ Test Marks + $30\%$ Attendance).

#### 4. 🤖 AI-Powered Personalized Study Planner
- **Interactive Configuration Form**:
  - **Target Goal / Exam**: Input box (e.g., `Term Board Examination`).
  - **Daily Study Time**: Interactive numeric hours selector (1 to 8 hours/day).
  - **Weak Subjects**: Multi-select subject tags (e.g., `Mathematics`, `Science`, `Physics`).
  - **"✨ Generate AI Plan" Action Button**: Calls Google Gemini 1.5 Flash API with spinner loading animation.
- **7-Day Dynamic Schedule Output Display**:
  - Day-by-day accordion/cards (Day 1 through Day 7).
  - Time allocation, focus chapters, difficulty badges (`High`, `Medium`, `Low`), and cognitive study tips.

#### 5. Interactive Knowledge Booster & Daily Quiz
- **5-Question Interactive Quiz Modal**:
  - Multiple choice questions with single-select radio options.
  - Question pagination tracker (`Question 1 of 5`).
  - Instant result calculation with celebratory confetti explosion (`canvas-confetti`).

---

### 4.5 👨‍👩‍👦 Parent Dashboard (Guardian & Fee Portal)

**Route**: `/dashboard/parent/*`  
**Sub-routes**: `/attendance`, `/fees`, `/reports`  
**Component**: `ParentDashboard.jsx`

#### 1. Multi-Ward Switcher Bar
- Horizontal ward switcher tabs with children's names and classes (e.g., `[ Aarav Sharma (10) | Diya Sharma (7) ]`).
- Switching tabs immediately re-fetches attendance, fees, and report cards with zero IDOR leaks.

#### 2. Ward Attendance & Daily Presence Telemetry
- Comprehensive monthly presence summary card.
- Total days present, absent, late, and overall attendance percentage health badge.

#### 3. Instant Dynamic UPI Fee Settlement & Digital Receipt
- **Unpaid / Paid Invoices Table**:
  - Invoice month, fee type, amount in INR (`₹3,500`), due date, and payment status chip.
- **Interactive "Pay Now" Modal**:
  - **Step 1: Checkout & QR Generation**:
    - Generates dynamic vector UPI QR code encoding the standard `upi://pay` URI.
    - Displays Institutional Payee: `Kashvi SmartClass (kashvi.edu@icici)`.
    - One-click "Copy UPI Payment Link" button.
  - **Step 2: Verification**:
    - Simulates payment verification with instant cryptographic transaction ID generation.
  - **Step 3: Official Institutional Receipt**:
    - Displays formal receipt (`REC-2024-XXXXXX`) with student details, amount paid, timestamp, and print/download actions.

#### 4. Academic Term Report Cards
- **Term Selector**: `Term 1`, `Mid-Term`, `Final Board Examination`.
- **Subject Grades Matrix**:
  - Table displaying Subject Name, Marks Obtained, Max Marks, Grade (`A+`, `A`, `B`), and Teacher Remarks.
  - Overall Percentage Score and Grade Point Average (GPA) summary card.

---

## 📱 5. UI Component Hierarchy & Design Patterns

```
Frontend Component Architecture
│
├── App.jsx (Route Controller & Protected Routes)
│   ├── /login -> Login.jsx
│   ├── /dashboard/admin -> AdminDashboard.jsx
│   ├── /dashboard/teacher -> TeacherDashboard.jsx
│   ├── /dashboard/student -> StudentDashboard.jsx
│   └── /dashboard/parent -> ParentDashboard.jsx
│
├── components/
│   ├── Layout.jsx (Desktop Sidebar, Top Navbar, Mobile Drawer, Sign Out)
│   └── ProtectedRoute.jsx (Role Guard & Token Verification)
│
├── context/
│   └── AuthContext.jsx (Authentication state, user object, token management)
│
└── services/
    └── api.js (Axios instance with JWT bearer interceptors & 401 handler)
```

---

## ♿ 6. Accessibility, SEO & Usability Highlights

1. **High Contrast Ratios**: Dark slate backgrounds (`#020617`, `#0F172A`) paired with bright white (`#FFFFFF`) and slate-200 (`#E2E8F0`) text to exceed WCAG AA standards.
2. **Keyboard Navigable Modals**: All modal overlays support Escape key dismissals and distinct focus rings (`focus:ring-2 focus:ring-indigo-500`).
3. **Visual Feedback States**:
   - Disabled states on buttons during async API calls with animated spinners.
   - Toast notifications with custom role-based emoji/icons for success, warnings, and errors.
4. **Responsive Breakpoints**:
   - Mobile (`< 768px`): Stacked single-column cards, collapsible mobile drawer, touch-friendly tap targets.
   - Tablet / Desktop (`>= 1024px`): Multi-column grid metrics, fixed sidebar navigation, side-by-side data tables.

---
*Documentation generated for Kashvi SmartClass UI/UX Architecture.*
