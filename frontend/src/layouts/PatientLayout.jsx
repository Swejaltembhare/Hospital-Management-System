import { Outlet } from "react-router-dom";
import PatientNavbar from "../components/patient/Navbar";

const PatientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <PatientNavbar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;