import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from './components/landerpage';
import Signup from './components/Signup';
import Login from './components/loginpage';
import HomePage from './components/HomePage';
import PlaceholderPage from './components/PlaceholderPage';

import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Sessions from './components/Sessions';

import StudentSignup from './components/StudentSignup';
import AlumniSignup from './components/AlumniSignup';
import AdminSignup from './components/AdminSignup';


function App() {

  return (

    <BrowserRouter>

      <div className="App">

        <Routes>

          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Home Page */}
          <Route path="/home" element={<HomePage />} />

          {/* Navigation Placeholders and Actual Pages */}
          <Route path="/search" element={<PlaceholderPage title="Search" />} />
          <Route path="/messages" element={<PlaceholderPage title="Message Inbox" />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/progress" element={<PlaceholderPage title="Progress" />} />
          <Route path="/jobs" element={<PlaceholderPage title="Jobs" />} />
          <Route path="/communities" element={<PlaceholderPage title="Communities" />} />

          {/* Login Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />


          {/* Main Signup Role Selection */}
          <Route path="/signup" element={<Signup />} />


          {/* Role Based Signup Pages */}

          <Route path="/signup/student" element={<StudentSignup />} />

          <Route path="/signup/alumni" element={<AlumniSignup />} />

          <Route path="/signup/admin" element={<AdminSignup />} />


        </Routes>

      </div>

    </BrowserRouter>

  );

}

export default App;