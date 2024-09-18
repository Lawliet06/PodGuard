// Import the SendGrid library
const sgMail = require('@sendgrid/mail');

// Set your API key from SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send confirmation email
const sendConfirmationEmail = async (email, name) => {
  const msg = {
    to: email,
    from: 'your-email@example.com', // Use your verified sender
    subject: 'Welcome to Our System',
    text: `Hello ${name}, welcome to our system!`,
    html: `<strong>Hello ${name}, welcome to our system!</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Confirmation email sent to', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendConfirmationEmail };
