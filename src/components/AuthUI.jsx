import React, { useEffect } from 'react';
import {
  Show,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/react';
import { Loader, LogIn } from 'lucide-react';
import './AuthUI.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const SignedInProfile = () => {
  const { user } = useUser();

  return (
    <div className="auth-user-profile">
      <div className="auth-profile-container">
        {user?.imageUrl && (
          <img
            src={user.imageUrl}
            alt={user.fullName || 'User avatar'}
            className="auth-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="auth-user-info">
          <p className="auth-user-name">{user?.fullName || 'User'}</p>
          <p className="auth-user-email">{user?.primaryEmailAddress?.emailAddress || ''}</p>
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export const AuthUI = () => {
  useEffect(() => {
    const handleOutsideModalClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const modalBackdrop = target.closest('.cl-modalBackdrop');
      const modalCard = target.closest('.cl-card');
      if (!modalBackdrop || modalCard) return;

      const closeButton = document.querySelector('.cl-modalCloseButton');
      if (closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    };

    document.addEventListener('click', handleOutsideModalClick, true);
    return () => {
      document.removeEventListener('click', handleOutsideModalClick, true);
    };
  }, []);

  if (!clerkPublishableKey) {
    return (
      <div className="auth-signin-container">
        <button
          className="auth-sign-in-btn"
          type="button"
          title="Add VITE_CLERK_PUBLISHABLE_KEY to .env.local to enable Clerk login"
        >
          <LogIn className="auth-icon" size={16} />
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="auth-signin-container">
      <Show when="loading">
        <div className="auth-loading" role="status" aria-label="Loading authentication">
          <Loader className="auth-icon auth-icon-spin" size={20} />
        </div>
      </Show>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="auth-sign-in-btn" type="button" aria-label="Log in">
            <LogIn className="auth-icon" size={16} />
            Login
          </button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <SignedInProfile />
      </Show>
    </div>
  );
};

export default AuthUI;
