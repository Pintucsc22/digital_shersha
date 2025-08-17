module.exports.generateUserId = (role) => {
  const prefix = role === 'teacher' ? 'T' : 'STD';
  const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digit
  return `${prefix}${randomDigits}`;
};
