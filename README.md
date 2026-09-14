🏥 MediCare - Full-Stack Hospital Management System
A modern, responsive, and production-ready full-stack hospital management web application built to streamline healthcare workflows, patient appointments, doctor scheduling, and administrative operations.

🌟 Key Features
👨‍💼 Admin Portal
Operations Dashboard: Real-time overview of total doctors, patients, departments, and appointment analytics.
Management Suites: Complete CRUD capabilities for managing doctors, patient profiles, departments, and invoices.
Activity Audit Logs: Track system operations, audit logs, and status updates seamlessly.

👩‍⚕️ Doctor Portal
Schedule & Queue Management: View daily patient queues, confirm or manage appointment bookings.
Patient History Review: Access digital medical histories and treatment plans securely.
Availability Toggle: Real-time status switching between available and busy.

🧑 Patient Portal
Instant Booking: Browse available medical specialists and book consultation slots instantly.
Appointment Tracking: Monitor active, completed, or cancelled appointments with status indicators.
Digital Records: View prescriptions, medical notes, and invoice summaries.

🛠️ Tech Stack
Layer	Technologies
Frontend	React, Vite, Tailwind CSS, Lucide-React, Framer Motion, React Hot Toast, React Router
Backend	Node.js, Express.js, MongoDB, Mongoose, JWT Authentication
Build Tools	Vite / Rolldown, Axios for API integration

📁 Project Structure

Hospital-Management-System/
├── frontend/
│   ├── public/
│   │   └── images/              # Static hospital assets (hospital.png, hospital1.png, hospital2.png)
│   ├── src/
│   │   ├── components/          # Reusable UI components & Widgets
│   │   ├── context/             # Auth & Global context providers
│   │   ├── pages/               # Role-based views (Admin, Doctor, Patient, Home)
│   │   ├── services/            # Axios API collection modules
│   │   ├── App.jsx              # Root routing configuration
│   │   └── main.jsx             # React application entry point
│   ├── .env                     # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
└── backend/                     # Backend Node/Express API server
    ├── controllers/             # Route handler logic
    ├── models/                  # Mongoose schemas & models
    ├── routes/                  # Express route definitions
    ├── middleware/               # Auth & error-handling middleware
    ├── .env                     # Backend environment variables
    ├── server.js                # Application entry point
    └── package.json
🚀 Getting Started Locally
Follow these steps to set up and run the project locally on your machine.

Prerequisites
Node.js (v18+ recommended)
MongoDB database instance (local or Atlas cluster)
1. Clone the Repository
bash

git clone https://github.com/your-username/Hospital-Management-System.git
cd Hospital-Management-System
2. Backend Setup
Navigate to the backend directory, install dependencies, and configure environment variables.

bash

cd backend
npm install
Create a .env file in the backend/ root directory:

env

PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
Start the backend server:

bash

npm run dev
3. Frontend Setup
Open a new terminal tab, navigate to the frontend directory, and install dependencies.

bash

cd frontend
npm install
Create a .env file in the frontend/ root directory (optional if using Vite proxy):

env

VITE_API_URL=http://localhost:5000/api
Start the frontend development server:

bash

npm run dev
📦 Production Build
To build the frontend application for production deployment:

bash

cd frontend
npm run build
The optimized output will be generated in the frontend/dist/ directory, ready for deployment to any static hosting provider.

🔐 Environment Variables Reference
Backend (backend/.env)
Variable	Description	Example
PORT	Server port number	5000
MONGO_URI	MongoDB connection string	mongodb+srv://user:pass@cluster.mongodb.net/medicare
JWT_SECRET	Secret key for JWT token signing	your_super_secret_key
Frontend (frontend/.env)
Variable	Description	Example
VITE_API_URL	Backend API base URL	http://localhost:5000/api
🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the 
MIT License
.

📬 Contact
For questions, suggestions, or collaboration inquiries, feel free to reach out via GitHub Issues or connect directly.

