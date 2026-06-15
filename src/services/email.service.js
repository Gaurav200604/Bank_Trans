
const nodemailer = require('nodemailer');

const requiredEmailEnv = ['EMAIL_USER', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'];
const missingEmailEnv = requiredEmailEnv.filter((key) => !process.env[key]);

if (missingEmailEnv.length) {
  console.warn(`Email service missing env variables: ${missingEmailEnv.join(', ')}`);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("VERIFY ERROR:");
    console.log(error);
  } else {
    console.log("Email server is ready");
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  if (missingEmailEnv.length) {
    throw new Error(`Missing email env variables: ${missingEmailEnv.join(', ')}`);
  }

  const info = await transporter.sendMail({
    from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log('Message sent: %s', info.messageId);
  return info;
};


async function sendregistrationEmail(useremail, name) {
    const subject = 'Welcome to Backend Ledger!';
    const text = `Hello ${name},\n\nWelcome to Backend Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Welcome to Backend Ledger! We're excited to have you on board. If you have any questions or need assistance, feel free to reach out.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
    await sendEmail(useremail, subject, text, html);

}

module.exports = {  sendregistrationEmail };
