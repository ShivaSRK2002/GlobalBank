// src/pages/HomePage.js
import React from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory

const HomePage = () => {
  const navigate = useNavigate(); // Correctly using useNavigate

  return (
    <Container style={{ marginTop: '50px' }}>
      <Grid container spacing={4} justifyContent="center">
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Card elevation={3} style={{ padding: '30px', backgroundColor: '#f5f5f5' }}>
            <Typography variant="h3" gutterBottom align="center">
              Welcome to Global Bank
            </Typography>
            <Typography variant="h6" gutterBottom align="center" color="textSecondary">
              Empowering your financial future with smart, seamless banking solutions.
            </Typography>
          </Card>
        </Grid>

        {/* Card for Registration */}
        <Grid item xs={12} md={6}>
          <Card elevation={5} style={{ padding: '20px', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                New to Global Bank?
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Open an account with us today and experience hassle-free banking like never before!
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')} // Navigate to Register
                style={{ width: '100%' }}
              >
                Register Now
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Card for Login */}
        <Grid item xs={12} md={6}>
          <Card elevation={5} style={{ padding: '20px', textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Already a Member?
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Log in to access your account, manage your finances, and explore our banking services.
              </Typography>
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate('/login')} // Navigate to Login
                style={{ width: '100%' }}
              >
                Login
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
