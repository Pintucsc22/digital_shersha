// AuthPopupWrapper.js

import React from 'react';
import RegisterChatBox from './RegisterChatBox';
import LoginChatBox from './LoginChatBox';
// Later you'll also import LoginChatBox
// import LoginChatBox from './auth/LoginChatBox';

const AuthPopupWrapper = ({ type, onClose }) => {
  if (type === 'register') {
    return <RegisterChatBox onClose={onClose} />;
  }

  if (type === 'login') {
    return <LoginChatBox onClose={onClose} />;
    }

  return null;
};

export default AuthPopupWrapper;
