// src/pages/LoanApplicationPage.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const LoanApplicationPage = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyForLoan = async () => {
    if (!loanAmount || !loanPurpose) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;

      // Save the loan application to Firestore
      await setDoc(doc(db, 'loanApplications', userId), {
        loanAmount,
        loanPurpose,
        status: 'pending', // Default status to pending
        userId,
      });

      alert('Loan application submitted successfully! Waiting for admin approval.');
      setLoanAmount('');
      setLoanPurpose('');
    } catch (error) {
      console.error('Error applying for loan:', error);
      setError('Failed to apply for loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Apply for Loan
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Loan Amount"
        variant="outlined"
        fullWidth
        margin="normal"
        type="number"
        value={loanAmount}
        onChange={(e) => setLoanAmount(e.target.value)}
        required
      />
      <TextField
        label="Purpose of Loan"
        variant="outlined"
        fullWidth
        margin="normal"
        value={loanPurpose}
        onChange={(e) => setLoanPurpose(e.target.value)}
        required
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleApplyForLoan}
        style={{ marginTop: '20px' }}
        disabled={loading}
      >
        {loading ? 'Applying...' : 'Apply for Loan'}
      </Button>
    </Container>
  );
};

export default LoanApplicationPage;
