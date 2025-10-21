import React from 'react';
import './Header.css';

interface HeaderProps {
  userName: string;
  userEmail: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ userName, userEmail, userAvatar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button">
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <h1 className="header-title">Communications</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <div className="user-text">
            <span className="user-name">{userName}</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <div className="user-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} />
            ) : (
              <div className="avatar-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;