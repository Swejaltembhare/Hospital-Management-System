## MediCare

MediCare is a full-stack web application designed to digitize and streamline hospital operations. The platform provides role-based portals for Patients, Doctors, and Administrators to manage appointments, medical records, billing, lab tests, and real-time analytics through a centralized and secure digital system.

## Features

- Secure authentication with role-based access control (Patient, Doctor, Admin)
- Admin dashboard with real-time hospital statistics and booking analytics
- Doctor portal for managing appointments, schedules, and patient histories
- Patient portal for booking appointments and viewing prescriptions
- Lab test tracking and management
- Billing and invoice generation
- System audit logs for security and compliance
- Data export functionality
- Public doctor directory for patients
- Responsive and intuitive user interface

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend User Interface |
| Vite | Frontend Build Tool |
| Node.js | Backend Runtime |
| Express.js | Server Framework |
| MongoDB | Database |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Axios | HTTP Client |
| JWT | Authentication |

## Project Structure

Hospital-Management-System/

├── backend/      # APIs and server logic

├── frontend/     # React frontend

└── README.md

## Installation & Setup

1. Clone the repository

git clone https://github.com/Swejaltembhare/Hospital-Management-System.git
cd Hospital-Management-System

2. Install dependencies

Backend

cd backend
npm install

Frontend

cd frontend
npm install

## Run the Project

Start Backend

cd backend
npm run dev

Start Frontend

cd frontend
npm run dev

## Environment Variables

Create a .env file inside the backend folder:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173

## API Endpoints

| Route | Description |
|---|---|
| /api/auth | Authentication (register, login, logout) |
| /api/admin | Admin operations and statistics |
| /api/doctors | Public doctor directory |
| /api/doctor | Doctor portal routes |
| /api/patients | Patient management |
| /api/lab-tests | Lab test records |
| /api/invoices | Billing and invoices |
| /api/analytics | Hospital analytics |
| /api/audit-logs | System audit logs |
| /api/export | Data exports |

## Future Improvements

- Mobile responsiveness
- Email and SMS appointment reminders
- Advanced analytics and reporting
- Prescription PDF generation

## Contributors

Swejal Tembhare

GitHub: https://github.com/Swejaltembhare

Web Link: https://hospital-management-system-swejal.vercel.app/

## Support

If you like this project, give it a ⭐ on GitHub.
