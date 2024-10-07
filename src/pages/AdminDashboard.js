import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import emailjs from 'emailjs-com'; // Import EmailJS

const AdminDashboard = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loanApplications, setLoanApplications] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch pending customer accounts for approval
  useEffect(() => {
    const fetchPendingAccounts = async () => {
      try {
        const pendingAccountsCollection = collection(db, 'pendingAccounts');
        const pendingAccountsSnapshot = await getDocs(pendingAccountsCollection);
        const pendingAccountsData = pendingAccountsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingAccounts(pendingAccountsData);
      } catch (error) {
        console.error('Error fetching pending accounts:', error);
        setSnackbarMessage('Failed to fetch pending accounts.');
        setSnackbarOpen(true);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchPendingAccounts();
  }, []);

  // Fetch all customer accounts
  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const bankAccountsCollection = collection(db, 'bankAccounts');
        const bankAccountsSnapshot = await getDocs(bankAccountsCollection);
        const allCustomersData = bankAccountsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllCustomers(allCustomersData);
      } catch (error) {
        console.error('Error fetching customer accounts:', error);
        setSnackbarMessage('Failed to fetch customer accounts.');
        setSnackbarOpen(true);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchAllCustomers();
  }, []);

  // Fetch loan applications
  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const loanApplicationsCollection = collection(db, 'loanApplications');
        const loanApplicationsSnapshot = await getDocs(loanApplicationsCollection);
        const loanApplicationsData = loanApplicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoanApplications(loanApplicationsData);
      } catch (error) {
        console.error('Error fetching loan applications:', error);
        setSnackbarMessage('Failed to fetch loan applications.');
        setSnackbarOpen(true);
      } finally {
        setLoadingLoans(false);
      }
    };

    fetchLoanApplications();
  }, []);

  // EmailJS send email function
  const sendEmail = (email, subject, message, accountName, accountNumber = '') => {
    const templateParams = {
      to_email: email,
      name: accountName,
      accountNumber: accountNumber, // Only for approval
      subject: subject,
      message: message,
    };

    emailjs
      .send(
        'service_p83d5ev', // Replace with your EmailJS service ID
        'template_u98x1pc', // Replace with your EmailJS template ID
        templateParams,
        'O20QoPYDvNwVjkXc-' // Replace with your EmailJS user ID
      )
      .then(
        (response) => {
          console.log('Email sent successfully!', response.status, response.text);
        },
        (error) => {
          console.error('Error sending email:', error);
        }
      );
  };

  // Handle account approval
  const handleApproveAccount = async (account) => {
    setLoadingAccounts(true);
    try {
      const generatedAccountNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      await setDoc(doc(db, 'bankAccounts', account.id), {
        ...account,
        accountNumber: generatedAccountNumber,
        balance: 100000,
        status: 'approved',
      });
      await deleteDoc(doc(db, 'pendingAccounts', account.id));
      setSnackbarMessage(`Account approved and created for ${account.name}`);
      setPendingAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== account.id));

      // Send email notification to user
      const subject = 'Your Account Has Been Approved';
      const message = `Dear ${account.name}, your account has been approved. Your new account number is ${generatedAccountNumber}. Welcome to our bank!`;
      sendEmail(account.email, subject, message, account.name, generatedAccountNumber);
    } catch (error) {
      console.error('Error approving account:', error);
      setSnackbarMessage('Failed to approve account.');
    } finally {
      setLoadingAccounts(false);
      setSnackbarOpen(true);
    }
  };

  // Handle account rejection
  const handleRejectAccount = async (accountId) => {
    setLoadingAccounts(true);
    try {
      const account = pendingAccounts.find(acc => acc.id === accountId);
      await deleteDoc(doc(db, 'pendingAccounts', accountId));
      setPendingAccounts((prevAccounts) => prevAccounts.filter((acc) => acc.id !== accountId));
      setSnackbarMessage('Account rejected successfully.');

      // Send email notification to user
      const subject = 'Your Account Application Has Been Rejected';
      const message = `Dear ${account.name}, we regret to inform you that your account application has been rejected. Please contact our support for more details.`;
      sendEmail(account.email, subject, message, account.name);
    } catch (error) {
      console.error('Error rejecting account:', error);
      setSnackbarMessage('Failed to reject account.');
    } finally {
      setLoadingAccounts(false);
      setSnackbarOpen(true);
    }
  };

  // Handle loan approval
  const handleApproveLoan = async (loan) => {
    try {
      await setDoc(doc(db, 'loanApplications', loan.id), {
        ...loan,
        status: 'approved',
      });
      setSnackbarMessage(`Loan approved for ${loan.userId}`);
      setLoanApplications((prevLoans) =>
        prevLoans.map((l) => (l.id === loan.id ? { ...l, status: 'approved' } : l))
      );
    } catch (error) {
      console.error('Error approving loan:', error);
      setSnackbarMessage('Failed to approve loan.');
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Handle loan rejection
  const handleRejectLoan = async (loanId) => {
    try {
      await deleteDoc(doc(db, 'loanApplications', loanId));
      setLoanApplications((prevLoans) => prevLoans.filter((loan) => loan.id !== loanId));
      setSnackbarMessage('Loan rejected successfully.');
    } catch (error) {
      console.error('Error rejecting loan:', error);
      setSnackbarMessage('Failed to reject loan.');
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Close Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard - Account & Loan Management
      </Typography>

      {/* Pending Accounts Section */}
      <Typography variant="h6">Pending Customer Accounts for Approval</Typography>
      {loadingAccounts ? (
        <CircularProgress />
      ) : pendingAccounts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Aadhar Number</TableCell>
                <TableCell>PAN Number</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.customerId}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phoneNumber}</TableCell>
                  <TableCell>{account.aadharNumber}</TableCell>
                  <TableCell>{account.panNumber}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApproveAccount(account)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRejectAccount(account.id)}
                      style={{ marginLeft: '10px' }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No pending accounts.</Typography>
      )}

      {/* All Customers Section */}
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        All Customer Accounts
      </Typography>
      {loadingCustomers ? (
        <CircularProgress />
      ) : allCustomers.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Customer ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.customerId}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.accountNumber}</TableCell>
                  <TableCell>{customer.balance}</TableCell>
                  <TableCell>{customer.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No customers found.</Typography>
      )}

      {/* Loan Applications Section */}
      <Typography variant="h6" style={{ marginTop: '20px' }}>
        Loan Applications
      </Typography>
      {loadingLoans ? (
        <CircularProgress />
      ) : loanApplications.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loanApplications.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.id}</TableCell>
                  <TableCell>{loan.userId}</TableCell>
                  <TableCell>{loan.amount}</TableCell>
                  <TableCell>{loan.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApproveLoan(loan)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleRejectLoan(loan.id)}
                      style={{ marginLeft: '10px' }}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No loan applications found.</Typography>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AdminDashboard;
