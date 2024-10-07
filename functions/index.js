const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Configure the email transport using nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Function to send email notifications
exports.sendAccountStatusNotification = functions.firestore
  .document('bankAccounts/{userId}')
  .onUpdate((change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the status has changed
    if (before.status !== after.status) {
      const email = after.email; // Get the customer's email from the account data
      const status = after.status; // New status of the account

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bank Account Application Status Update',
        text: `Dear ${after.name},\n\nYour bank account application status is now: ${status}.\n\nThank you!`,
      };

      // Send email
      return transporter.sendMail(mailOptions)
        .then(() => console.log('Email sent to:', email))
        .catch(error => console.error('Error sending email:', error));
    }

    return null; // Return null if status hasn't changed
  });

