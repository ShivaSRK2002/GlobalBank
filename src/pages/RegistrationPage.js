// src/pages/RegistrationPage.js
import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig'; // Ensure this imports your Firebase config
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // Date of Birth
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone Number
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Basic validation to ensure fields are not empty
    if (!name || !dob || !phoneNumber || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user details in Firestore, setting the role as 'customer'
      await setDoc(doc(db, 'accounts', user.uid), {
        name,
        dob,
        phoneNumber,
        email,
        role: 'customer', // Store the role as 'customer' since this is a customer registration page
      });

      console.log('User registered and data stored:', user);

      // Redirect to the login page or home page after successful registration
      navigate('/login'); // Adjust the path as needed
    } catch (error) {
      console.error('Error registering user:', error);
      // Optionally show an alert or message to the user
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <TextField
        label="Name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <TextField
        label="Date of Birth"
        type="date"
        variant="outlined"
        fullWidth
        margin="normal"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        InputLabelProps={{ shrink: true }} // Ensure the label stays visible
        required
      />
      <TextField
        label="Phone Number"
        variant="outlined"
        fullWidth
        margin="normal"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
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
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleRegister}
        style={{ marginTop: '20px' }}
      >
        Register
      </Button>
    </Container>
  );
};

export default RegistrationPage;
