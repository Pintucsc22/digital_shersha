const nodemailer = require('nodemailer');

const sendScorecard = async (req, res) => {
  const { email, name, score } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    to: email,
    subject: 'Exam Scorecard',
    html: `<h3>Hello ${name},</h3><p>Your exam score is: <strong>${score}</strong></p>`
  });

  res.json({ message: 'Email sent' });
};

module.exports = { sendScorecard };
