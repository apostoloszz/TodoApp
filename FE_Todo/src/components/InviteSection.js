import React from "react";
import { Button } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import "../styles/InviteSection.css";

const InviteSection = () => {
  return (
    <div className="invite-section">
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        className="invite-button"
      >
        Invite
      </Button>
      <div className="invited-users">
        <img src="/user1.png" alt="User 1" className="user-avatar" />
        <img src="/user2.png" alt="User 2" className="user-avatar" />
        <img src="/user3.png" alt="User 3" className="user-avatar" />
        <img src="/user4.png" alt="User 4" className="user-avatar" />
        <img src="/user5.png" alt="User 5" className="user-avatar" />
      </div>
    </div>
  );
};

export default InviteSection;
