import { Outlet } from "react-router-dom";
import PatientNavbar from "../components/patient/Navbar";
import Footer from "../components/Footer";

const PatientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      <PatientNavbar />

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default PatientLayout;