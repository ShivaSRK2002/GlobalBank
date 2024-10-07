import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const PortfolioPage = () => {
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser.uid;

  useEffect(() => {
    const accountRef = doc(db, 'bankAccounts', userId);
    
    // Real-time listener
    const unsubscribe = onSnapshot(accountRef, (accountSnap) => {
      if (accountSnap.exists()) {
        const data = accountSnap.data();
        setAccountDetails(data);
      } else {
        console.error('No account found for this user.');
      }
      setLoading(false); // Set loading to false after fetching data
    }, (error) => {
      console.error('Error fetching account details:', error);
      setLoading(false); // Stop loading on error
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [userId]);

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Your Portfolio
          </Typography>
          {accountDetails && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>{accountDetails.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>{accountDetails.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>{accountDetails.phoneNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Date of Birth</TableCell>
                    <TableCell>{accountDetails.dob}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aadhar Number</TableCell>
                    <TableCell>{accountDetails.aadharNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PAN Number</TableCell>
                    <TableCell>{accountDetails.panNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Balance</TableCell>
                    <TableCell>₹{accountDetails.balance}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Transfer Limit</TableCell>
                    <TableCell>{accountDetails.transferLimit}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default PortfolioPage;
