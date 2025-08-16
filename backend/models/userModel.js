const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    required: true,
    enum: ['student', 'teacher'],
    lowercase: true
  },
  otp: {
    type: String,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});


userSchema.pre('save', function (next) {
  if (this.role) {
    this.role = this.role.toLowerCase();
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
