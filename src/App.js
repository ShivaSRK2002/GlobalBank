import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminDashboard from './pages/AdminDashboard'; // Admin Dashboard component
import CustomerDashboard from './pages/CustomerDashboard'; // Customer Dashboard component
import CreateBankAccount from './pages/CreateBankAccount'; // Import the CreateBankAccount component
import LoanApplicationPage from './pages/LoanApplicationPage'; // Loan Application component
import MoneyTransferPage from './pages/MoneyTransferPage'; // Money Transfer component
import PortfolioPage from './pages/PortfolioPage'; // Portfolio component
import TransactionHistoryPage from './pages/TransactionHistoryPage'; // Transaction History component
import { auth } from './firebaseConfig'; // Firebase authentication to track login state
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [user, setUser] = useState(null); // To track logged-in user state
  const [loading, setLoading] = useState(true); // Loading state while checking auth status

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // Stop loading once we have the user state
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    if (loading) {
      return <div>Loading...</div>; // Show loading spinner while waiting for auth status
    }

    if (!user) {
      navigate('/login'); // Redirect to login if not authenticated
      return null;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected routes for admin and customer */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Add Create Bank Account route */}
        <Route
          path="/create-bank-account"
          element={
            <ProtectedRoute>
              <CreateBankAccount />
            </ProtectedRoute>
          }
        />

        {/* Add Money Transfer route */}
        <Route
          path="/money-transfer"
          element={
            <ProtectedRoute>
              <MoneyTransferPage />
            </ProtectedRoute>
          }
        />

        {/* Add Portfolio route */}
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />

        {/* Loan route */}
        <Route
          path="/loan-application"
          element={
            <ProtectedRoute>
              <LoanApplicationPage />
            </ProtectedRoute>
          }
        />

        {/* Add Transaction History route */}
        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <TransactionHistoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
