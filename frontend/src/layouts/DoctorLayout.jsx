import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorNavbar from '../components/doctor/Navbar';

const DoctorLayout = () => {
  return (
    <>
      <DoctorNavbar />
      <Outlet />
    </>
  );
};

export default DoctorLayout;