import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, CircularProgress, Grid, Snackbar, Alert } from '@mui/material';
import { db, storage, auth } from '../firebaseConfig'; // Import Firebase Firestore, Storage, and Auth
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage methods

const CreateBankAccount = () => {
  const [aadharNumber, setAadharNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [customerId, setCustomerId] = useState(null); // Customer ID
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // Store fetched customer details
  const [aadharImage, setAadharImage] = useState(null); // Aadhar image file
  const [panImage, setPanImage] = useState(null); // PAN image file
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity

  const ifscCode = "SRKBK000789"; // IFSC code for all accounts

  useEffect(() => {
    const fetchLastCustomerId = async () => {
      const lastCustomerDoc = await getDoc(doc(db, 'meta', 'lastCustomerId'));
      if (lastCustomerDoc.exists()) {
        const lastCustomerId = lastCustomerDoc.data().customerId;
        setCustomerId(lastCustomerId + 1); // Set next customer ID
      } else {
        setCustomerId(1); // Start from 1 if no previous ID exists
      }
    };

    const fetchUserInfo = async () => {
      const user = auth.currentUser; // Get the current authenticated user
      if (user) {
        const userDoc = await getDoc(doc(db, 'accounts', user.uid)); // Fetch user details from 'accounts' collection
        if (userDoc.exists()) {
          setUserInfo(userDoc.data()); // Set fetched user info
        } else {
          console.error('No user details found in accounts database.');
        }
      }
    };

    fetchLastCustomerId();
    fetchUserInfo(); // Fetch user details when component mounts
  }, []);

  // Handle Aadhar card image file input
  const handleAadharImageChange = (e) => {
    if (e.target.files[0]) {
      setAadharImage(e.target.files[0]);
    }
  };

  // Handle PAN card image file input
  const handlePanImageChange = (e) => {
    if (e.target.files[0]) {
      setPanImage(e.target.files[0]);
    }
  };

  const uploadFile = async (file, storagePath) => {
    const fileRef = ref(storage, storagePath); // Reference to the file in Firebase Storage
    await uploadBytes(fileRef, file); // Upload file
    return await getDownloadURL(fileRef); // Get and return the download URL
  };

  const handleCreateAccountRequest = async () => {
    if (!aadharNumber || !panNumber || customerId === null || !userInfo || !aadharImage || !panImage) {
      setSnackbarMessage("Please fill out all fields and upload required documents.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser; // Get current authenticated user
      if (user) {
        // Upload Aadhar and PAN images to Firebase Storage
        const aadharImageUrl = await uploadFile(aadharImage, `documents/${user.uid}/aadhar.jpg`);
        const panImageUrl = await uploadFile(panImage, `documents/${user.uid}/pan.jpg`);

        // Store the document URLs in Firestore 'documents' collection
        await setDoc(doc(db, 'documents', user.uid), {
          aadharImageUrl,
          panImageUrl,
          customerId, // Store customer ID in the documents collection as well
        });

        // Store the account request in the 'pendingAccounts' collection
        await setDoc(doc(db, 'pendingAccounts', user.uid), {
          aadharNumber,
          panNumber,
          customerId, // Use the generated customer ID
          ifscCode, // Add IFSC code for the account
          status: 'pending', // Set account status as 'pending'
          userId: user.uid, // Reference to the user ID
          name: userInfo.name, // Get name from userInfo
          email: userInfo.email, // Get email from userInfo
          phoneNumber: userInfo.phoneNumber, // Get phone number from userInfo
          aadharImageUrl, // Store Aadhar image URL
          panImageUrl, // Store PAN image URL
        });

        setSnackbarMessage('Account request submitted! Waiting for admin approval.');
        setSnackbarSeverity("success");
      }
    } catch (error) {
      console.error('Error submitting account request:', error);
      setSnackbarMessage('Failed to submit account request: ' + error.message);
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Request Bank Account Creation
      </Typography>

      {/* Display fetched user information */}
      {userInfo && (
        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h6">User Information</Typography>
          <Typography>Name: {userInfo.name}</Typography>
          <Typography>Email: {userInfo.email}</Typography>
          <Typography>Phone: {userInfo.phoneNumber}</Typography>
        </div>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Aadhar Number"
            variant="outlined"
            fullWidth
            value={aadharNumber}
            onChange={(e) => setAadharNumber(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="PAN Number"
            variant="outlined"
            fullWidth
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            fullWidth
            style={{ marginTop: '10px' }}
          >
            Upload Aadhar Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleAadharImageChange}
            />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            fullWidth
            style={{ marginTop: '10px' }}
          >
            Upload PAN Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePanImageChange}
            />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleCreateAccountRequest}
            style={{ marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Account Request'}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar for feedback */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateBankAccount;
