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
  CircularProgress,
  Snackbar,
  TextField,
  Grid,
} from '@mui/material';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const TransactionHistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const userId = auth.currentUser.uid;

  const [filterType, setFilterType] = useState(''); // For filtering transaction types
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('senderId', '==', userId) // Fetch transactions where the user is the sender
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(transactionsQuery, async (querySnapshot) => {
      const transactionsData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const transaction = { id: doc.id, ...doc.data() };
          
          // Fetch sender's name
          const senderDoc = await getDocs(query(collection(db, 'bankAccounts'), where('userId', '==', transaction.senderId)));
          const recipientDoc = await getDocs(query(collection(db, 'bankAccounts'), where('userId', '==', transaction.recipientId)));

          const senderName = senderDoc.empty ? 'Unknown' : senderDoc.docs[0].data().name;
          const recipientName = recipientDoc.empty ? 'Unknown' : recipientDoc.docs[0].data().name;

          return {
            ...transaction,
            senderName,
            recipientName,
          };
        })
      );

      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData); // Set initial filtered transactions
      setLoading(false); // Set loading to false after fetching data
    }, (error) => {
      console.error('Error fetching transactions:', error);
      setSnackbarMessage('Failed to fetch transaction history.');
      setSnackbarOpen(true);
      setLoading(false); // Set loading to false on error
    });

    // Cleanup function to unsubscribe from listener
    return () => unsubscribe();
  }, [userId]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleFilterChange = (event) => {
    const { value } = event.target;
    setFilterType(value);

    // Filter transactions based on selected type
    const filtered = transactions.filter((transaction) =>
      transaction.type.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '50px' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Transaction History
          </Typography>

          <Grid container spacing={2} style={{ marginBottom: '20px' }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Filter by Type"
                variant="outlined"
                fullWidth
                value={filterType}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>

          {filteredTransactions.length === 0 ? (
            <Typography>No transactions found.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Sender Name</TableCell>
                    <TableCell>Recipient Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.senderName}</TableCell>
                      <TableCell>{transaction.recipientName}</TableCell>
                      <TableCell>₹{transaction.amount}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
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

export default TransactionHistoryPage;
