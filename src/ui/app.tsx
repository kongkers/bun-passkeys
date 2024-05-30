import React, { useState } from 'react';
import { Alert, Button } from '@chakra-ui/react';
import SignUpModal from './signup.modal';
import LoginModal from './login.modal';

export default function App() {
  const [signUpIsOpen, setSignupIsOpen] = useState(false);
  const [loginIsOpen, setLoginIsOpen] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const openSignUp = () => {
    setSignupIsOpen(true);
  }

  const openLogin = () => {
    setLoginIsOpen(true);
  }

  const onCloseLogin = () => {
    setLoginIsOpen(false);
  }

  const onCloseSignUp = () => {
    setSignupIsOpen(false);
  }

  const showSuccess = () => {
    setShowLoginSuccess(true);
  }

	return(
		<div className="app" role="main">
			<h1>Passkeys Demo</h1>
      <div className="mt-20">
        <h3>Click below to get started!</h3>
        <Button onClick={openSignUp}>Sign Up</Button>
      </div>
      <div className="mt-20">
        <Button onClick={openLogin}>Login</Button>
      </div>
      {
        showLoginSuccess && <div className="login-status">
          <Alert status="success">Login was successful.</Alert>
        </div>
      }
      <SignUpModal isOpen={signUpIsOpen} onClose={onCloseSignUp} />
      <LoginModal isOpen={loginIsOpen} onClose={onCloseLogin} showSuccess={showSuccess} />
		</div>
	)
}
