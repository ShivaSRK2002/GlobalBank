import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import { auth, db } from '../firebaseConfig'; // Import auth and db from Firebase
import { doc, getDoc, updateDoc, query, where, collection, getDocs, addDoc } from 'firebase/firestore';

const MoneyTransferPage = () => {
  const [phoneNumber, setPhoneNumber] = useState(''); // Use phone number for recipient
  const [recipientInfo, setRecipientInfo] = useState(null); // To store recipient details
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch recipient account details using phone number
  const handlePhoneNumberSearch = async () => {
    setError(''); // Reset error message
    setRecipientInfo(null); // Reset previous recipient info

    if (!phoneNumber) {
      setError('Please enter a phone number.');
      return;
    }

    setLoading(true);
    try {
      // Query the bankAccounts collection to find the account with the provided phone number
      const recipientQuery = query(collection(db, 'bankAccounts'), where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(recipientQuery);

      if (querySnapshot.empty) {
        setError('No account found with this phone number.');
        setLoading(false);
        return;
      }

      // Get recipient account data from Firestore
      const recipientDoc = querySnapshot.docs[0]; // Assume phone numbers are unique
      setRecipientInfo(recipientDoc.data()); // Set recipient info for display
    } catch (error) {
      console.error('Error fetching recipient details:', error);
      setError('Error fetching recipient details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setError(''); // Reset error message

    if (!amount || !recipientInfo) {
      setError('Please fill out the transfer amount and make sure recipient is selected.');
      return;
    }

    const transferAmount = parseFloat(amount); // Convert amount to a number
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    setLoading(true);
    try {
      const senderId = auth.currentUser.uid; // Get the current authenticated user ID

      const senderRef = doc(db, 'bankAccounts', senderId);
      const recipientRef = doc(db, 'bankAccounts', recipientInfo.userId); // Get the recipient's user ID from recipientInfo

      // Get sender and recipient account data
      const senderSnap = await getDoc(senderRef);
      const recipientSnap = await getDoc(recipientRef);

      if (!senderSnap.exists()) {
        setError('Sender account not found.');
        return;
      }

      if (!recipientSnap.exists()) {
        setError('Recipient account not found.');
        return;
      }

      const senderData = senderSnap.data();
      const recipientData = recipientSnap.data();

      // Check sender's balance and transfer limits
      if (transferAmount > senderData.balance) {
        setError('Insufficient balance.');
        return;
      }

      // Perform the transfer
      await updateDoc(senderRef, { balance: senderData.balance - transferAmount });
      await updateDoc(recipientRef, { balance: recipientData.balance + transferAmount });

      // Store the transaction details in a separate collection
      await addDoc(collection(db, 'transactions'), {
        senderId: senderId,
        recipientId: recipientInfo.userId,
        recipientName: recipientInfo.name, // Store recipient's name
        amount: transferAmount,
        date: new Date().toISOString(), // Store the date in ISO format
        status: 'Completed', // You can set different statuses based on your requirements
      });

      alert('Transfer successful!');
      setPhoneNumber('');
      setAmount('');
      setRecipientInfo(null); // Clear recipient details after successful transfer
    } catch (error) {
      console.error('Error transferring money:', error);
      setError('Transfer failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Money Transfer
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      
      {/* Input for Phone Number */}
      <TextField
        label="Recipient Phone Number"
        variant="outlined"
        fullWidth
        margin="normal"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePhoneNumberSearch}
        style={{ marginTop: '20px' }}
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Find Recipient'}
      </Button>

      {/* Display recipient info if available */}
      {recipientInfo && (
        <Card style={{ marginTop: '20px' }}>
          <CardContent>
            <Typography variant="h6">Recipient Information</Typography>
            <Typography variant="body1"><strong>Name:</strong> {recipientInfo.name}</Typography>
            <Typography variant="body1"><strong>Account Number:</strong> {recipientInfo.accountNumber}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {recipientInfo.email}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Input for Transfer Amount */}
      <TextField
        label="Amount"
        variant="outlined"
        fullWidth
        margin="normal"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        disabled={!recipientInfo} // Disable amount field until recipient is found
      />
      
      {/* Transfer Button */}
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleTransfer}
        style={{ marginTop: '20px' }}
        disabled={loading || !recipientInfo} // Disable transfer button if recipient info is not available
      >
        {loading ? 'Transferring...' : 'Transfer Money'}
      </Button>
    </Container>
  );
};

export default MoneyTransferPage;
