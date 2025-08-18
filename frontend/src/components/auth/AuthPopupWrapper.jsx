// import React from 'react';
// import PropTypes from 'prop-types';
// import RegisterChatBox from './RegisterChatBox';
// import LoginChatBox from './LoginChatBox';

// const AuthPopupWrapper = ({ type, onClose }) => {
//   if (type === 'register') {
//     return <RegisterChatBox onClose={onClose} />;
//   }

//   if (type === 'login') {
//     return <LoginChatBox onClose={onClose} />;
//   }

//   return null;
// };

// // ✅ Add PropTypes for type checking
// AuthPopupWrapper.propTypes = {
//   type: PropTypes.oneOf(['login', 'register']), // Only allow 'login' or 'register'
//   onClose: PropTypes.func.isRequired,           // onClose must be a function
// };

// export default AuthPopupWrapper;
