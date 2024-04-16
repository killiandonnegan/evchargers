import React, { useEffect } from "react";

function Notification({ message, onClose }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 3000); // Set the duration (in milliseconds) for the notification to automatically close

    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="notification">
      <p>{message}</p>
    </div>
  );
}

export default Notification;
