import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import WebHome from "./WebHome/WebHome.jsx";
import SignUp from "./SignUp/SignUp.jsx";
import LoginCard from "./Login/LoginCard.jsx";
import TransactionHistory from "./TransactionHistory/TransactionHistory.jsx";
import LoanHistory from "./LoanHistory/LoanHistory.jsx";
import ChatAnonymously from "./ChatAnonymously/ChatAnonymously.jsx";
import Board from "./Game/Board.jsx";
import GameLeaderboard from "./Game/GameLeaderboard.jsx";
import Notifications from "./Notifications/Notifications.jsx";
import Navigation from "./Navigation/Navigation.jsx";
import UserDashboard from "./UserDashboard/UserDashboard.jsx";
import FlatDashboard from "./FlatDashboard/FlatDashboard.jsx";
import ViewSharedExpense from "./ViewSharedExpense/ViewSharedExpense.jsx";
import AddSharedExpense from "./AddSharedExpense/AddSharedExpense.jsx";
import PartyFund from "./PartyFund/PartyFund.jsx";
import Loan from "./Loan/Loan.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import LeaderboardMain from "./Leaderboard/LeaderboardMain.jsx";
import MainPage from "./Home/Home.jsx";
import Task from "./FlatTask/Task.jsx";
import Footer from "./Footer/Footer.jsx";
import AddTask from "./AddTask/AddTask.jsx";
import ViewTasks from "./ViewTasks/ViewTasks.jsx";
import ViewLoan from "./ViewLoan/ViewLoan.jsx";
import ViewPartyFund from "./ViewPartyFund/ViewPartyFund.jsx";
import ManageProfile from "./ManageProfile/ManageProfile.jsx";
import EditSharedExpense from "./EditSharedExpense/EditSharedExpense.jsx";
import AboutUs from "./AboutUs/AboutUs.jsx";


// Helper components for clearing data on logout
function loggingout() {
  localStorage.clear();
  return <Navigate to="/" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <SignUp />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div className="main-content"><WebHome /></div>} />
        <Route path="/signup" element={<div className="main-content"><RegisterAndLogout /><Footer /></div>} />
        <Route path="/login"  element={ <div className="main-content"><LoginCard /><Footer /></div>} />
        <Route path="/logout" element={<loggingout />} />



        
        {/* Protected Routes */}
        
        <Route path="/flathome" element={<ProtectedRoute><div className="main-content"><MainPage /><Footer /></div></ProtectedRoute>} />
        <Route path="/gameleaderboard" element={<ProtectedRoute><div className="main-content"><Navigation /><GameLeaderboard /><Footer /></div></ProtectedRoute>} />
        
        <Route path="/editsharedexpense" element={<ProtectedRoute><div className="main-content"><Navigation /><EditSharedExpense /><Footer /></div></ProtectedRoute>} />
        <Route path="/flattask" element={<ProtectedRoute><div className="main-content"><Navigation /><Task /><Footer /></div></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><div className="main-content"><Navigation /><LeaderboardMain /><Footer /></div></ProtectedRoute>} />
        <Route path="/addtask" element={<ProtectedRoute><div className="main-content"><Navigation /><AddTask /><Footer /></div></ProtectedRoute>} />
        <Route path="/viewtasks" element={<ProtectedRoute><div className="main-content"><Navigation /><ViewTasks /><Footer /></div></ProtectedRoute>} />
        <Route path="/viewloan" element={<ProtectedRoute><div className="main-content"><Navigation /><ViewLoan /><Footer /></div></ProtectedRoute>} />
        <Route path="/transaction-history" element={<ProtectedRoute><div className="main-content"><Navigation /><TransactionHistory /><Footer /></div></ProtectedRoute>} />
        <Route path="/loan-history" element={<ProtectedRoute><div className="main-content"><Navigation /><LoanHistory /><Footer /></div></ProtectedRoute>} />
        <Route path="/chat-anonymously" element={<ProtectedRoute><div className="main-content"><Navigation /><ChatAnonymously /><Footer /></div></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><div className="main-content"><Navigation /><Board /><Footer /></div></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><div className="main-content"><Navigation /><Notifications /><Footer /></div></ProtectedRoute>} />

        <Route path="/aboutus" element={<ProtectedRoute><div className="main-content"><Navigation /><AboutUs /><Footer /></div></ProtectedRoute>} />
        <Route path="/manageprofile" element={<ProtectedRoute><div className="main-content"><Navigation /><ManageProfile /><Footer /></div></ProtectedRoute>} />
        {/* User Dashboard */}
        <Route path="/userdashboard" element={<ProtectedRoute><div className="main-content"><Navigation /><UserDashboard /><Footer /></div></ProtectedRoute>} />

        {/* Other Protected Routes */}
        <Route path="/flatdashboard" element={<ProtectedRoute><div className="main-content"><Navigation /><FlatDashboard /><Footer /></div></ProtectedRoute>} />
        <Route path="/viewsharedexpense" element={<ProtectedRoute><div className="main-content"><Navigation /><ViewSharedExpense /><Footer /></div></ProtectedRoute>} />
        <Route path="/addsharedexpense" element={<ProtectedRoute><div className="main-content"><Navigation /><AddSharedExpense /><Footer /></div></ProtectedRoute>} />
        <Route path="/partyfund" element={<ProtectedRoute><div className="main-content"><Navigation /><PartyFund /><Footer /></div></ProtectedRoute>} />
        <Route path="/viewpartyfund" element={<ProtectedRoute><div className="main-content"><Navigation /><ViewPartyFund /><Footer /></div></ProtectedRoute>} />
        <Route path="/loan" element={<ProtectedRoute><div className="main-content"><Navigation /><Loan /><Footer /></div></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
