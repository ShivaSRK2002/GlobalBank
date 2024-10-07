// src/pages/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { auth, db } from '../firebaseConfig'; // Ensure this imports your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const CustomerDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null); // Store account info
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = auth.currentUser; // Get the currently logged-in user
        if (user) {
          // Fetch user account info from Firestore
          const userDoc = await getDoc(doc(db, 'accounts', user.uid));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
            // Fetch the bank account info
            const accountDoc = await getDoc(doc(db, 'bankAccounts', user.uid));
            if (accountDoc.exists()) {
              setAccountInfo(accountDoc.data()); // Store bank account info
            } else {
              console.error('No bank account found for this user.');
            }
          } else {
            console.error('No such user document!');
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleViewTransactions = () => {
    navigate('/transaction-history'); // Redirect to transaction history page
  };

  const handleApplyForLoan = () => {
    navigate('/loan-application'); // Redirect to loan application page
  };

  const handleMoneyTransfer = () => {
    navigate('/money-transfer'); // Redirect to money transfer page
  };

  const handleViewPortfolio = () => {
    navigate('/portfolio'); // Redirect to portfolio management page
  };

  const handleCreateAccount = () => {
    navigate('/create-bank-account'); // Ensure this matches the route for CreateBankAccount.js
  };

  const handleLogout = async () => {
    await auth.signOut(); // Sign out the user
    navigate('/login'); // Redirect to login page
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading indicator while fetching user info
  }

  if (!userInfo) {
    return <div>No user info available.</div>; // Handle case where user info is not available
  }

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {userInfo.name}!
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">User Information</Typography>
          <Typography variant="body1"><strong>Name:</strong> {userInfo.name}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userInfo.email}</Typography>
          <Typography variant="body1"><strong>Date of Birth:</strong> {userInfo.dob}</Typography>
          <Typography variant="body1"><strong>Phone Number:</strong> {userInfo.phoneNumber}</Typography>
        </CardContent>
      </Card>

      {accountInfo ? (
        <Card style={{ marginTop: '20px' }}>
          <CardContent>
            <Typography variant="h6">Bank Account Information</Typography>
            <Typography variant="body1"><strong>Account Number:</strong> {accountInfo.accountNumber}</Typography>
            <Typography variant="body1"><strong>IFSC Code:</strong> {accountInfo.ifscCode}</Typography>
            <Typography variant="body1"><strong>Aadhar Number:</strong> {accountInfo.aadharNumber}</Typography>
            <Typography variant="body1"><strong>PAN Number:</strong> {accountInfo.panNumber}</Typography>
            <Typography variant="body1"><strong>Customer ID:</strong> {accountInfo.customerId}</Typography>
            <Typography variant="body1"><strong>Status:</strong> {accountInfo.status}</Typography>
            <Typography variant="body1"><strong>Balance:</strong> ₹{accountInfo.balance}</Typography>
            <Typography variant="body1"><strong>Transfer Limit:</strong> ₹{accountInfo.transferLimit}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          You do not have a bank account yet. Please create one.
        </Typography>
      )}

      <Grid container spacing={2} style={{ marginTop: '20px' }}>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleViewTransactions}>
            View Transaction History
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleApplyForLoan}>
            Apply for Loan
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleMoneyTransfer}>
            Money Transfer
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleViewPortfolio}>
            View Portfolio
          </Button>
        </Grid>

        {/* Conditionally render the "Create Bank Account" button */}
        {!accountInfo && (
          <Grid item xs={12} sm={6}>
            <Button variant="contained" color="primary" fullWidth onClick={handleCreateAccount}>
              Create Bank Account
            </Button>
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <Button variant="contained" color="primary" fullWidth onClick={handleLogout}>
            Log Out
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboard;
