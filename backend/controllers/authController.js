const OtpModel = require('../models/otpModel');
const UserModel = require('../models/userModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateUserId } = require('../utils/generateUserId');

// 📧 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    await OtpModel.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    );

    await transporter.sendMail({
      from: `"Exam Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await OtpModel.findOne({ email });

    if (!record || record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  let { name, email, password, role, className } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  role = role.toLowerCase();

  if (!['student', 'teacher'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId(role);

    const newUser = new UserModel({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      className: role === 'student' ? className : undefined
    });

    await newUser.save();

    await transporter.sendMail({
      from: `"Exam Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Successful',
      html: `<p>Welcome ${name},</p><p>Your account has been created.</p><p><strong>User ID:</strong> ${userId}</p><p><strong>Password:</strong> [the one you entered]</p><p>Keep it safe.</p>`
    });

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ✅ Login user with JWT token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ✅ Generate JWT using your custom userId
    const token = jwt.sign(
      { id: user._id,userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      className: user.className || null
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
