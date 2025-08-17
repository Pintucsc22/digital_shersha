const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // 5 mins
  name: { type: String },  // store name here temporarily
  role: { type: String },  // store role here temporarily
});

module.exports = mongoose.model('Otp', otpSchema);
