import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./UserMenu.css";

const UserMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-menu">
      <button className="user-trigger" onClick={() => setOpen(!open)}>
        <img src="/avatar.png" alt="User" className="user-avatar" />
        <div className="user-info">
          <p className="user-name">shadcn</p>
          <p className="user-email">m@example.com</p>
        </div>
        <FaChevronDown className={`chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-header">
            <img src="/avatar.png" alt="User" className="user-avatar" />
            <div>
              <p className="user-name">shadcn</p>
              <p className="user-email">m@example.com</p>
            </div>
          </div>
          <hr />
          <button>Upgrade to Pro</button>
          <button>Account</button>
          <button>Billing</button>
          <button>Notifications</button>
          <hr />
          <button className="logout">Log out</button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
