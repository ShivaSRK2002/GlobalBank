// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Import Firebase config
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);

      // Fetch additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'accounts', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data from Firestore:', userData);

        // Check user role and redirect accordingly
        if (userData.role === 'admin') {
          navigate('/admin-dashboard'); // Navigate to Admin Dashboard
        } else if (userData.role === 'customer') {
          navigate('/customer-dashboard'); // Navigate to Customer Dashboard
        } else {
          console.error('Unknown role:', userData.role);
          toast.error('Login failed: Unknown user role.'); // Show error toast
        }
      } else {
        console.log('No such user document!');
        toast.error('No user data found in the system.'); // Show error toast
      }

      // Show success toast
      toast.success('Login successful!');
    } catch (error) {
      console.error('Error logging in:', error.message);
      toast.error('Login failed: ' + error.message); // Show error toast
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h4" gutterBottom align="center">
        Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ marginBottom: '15px' }} // Spacing below the email input
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={{ marginBottom: '15px' }} // Spacing below the password input
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
        style={{ marginTop: '20px', padding: '10px' }} // Optional: Add some space above the button
      >
        Login
      </Button>
      <ToastContainer /> {/* ToastContainer to display notifications */}
    </Container>
  );
};

export default LoginPage;
