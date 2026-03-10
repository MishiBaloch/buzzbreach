// Quick email test script
require('dotenv').config();
const { otpEmail } = require('./utils/otpEmail');

console.log('=== Email Configuration Test ===');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
console.log('EMAIL_HOST_USER:', process.env.EMAIL_HOST_USER || 'NOT SET');
console.log('EMAIL_HOST_PASSWORD:', process.env.EMAIL_HOST_PASSWORD ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
console.log('');

// Test sending email
otpEmail({
  firstName: 'Test',
  lastName: 'User',
  corporateEmail: process.env.EMAIL_HOST_USER || 'test@example.com',
  otp: '123456',
  isPasswordReset: true,
})
  .then(() => {
    console.log('✅ Email sent successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Email failed:', err);
    process.exit(1);
  });
