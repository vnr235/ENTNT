import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notification.css"; // Add relevant styles here

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Notifications = ({ calendarData }) => {
  const [overdueCommunications, setOverdueCommunications] = useState([]);
  const [todaysCommunications, setTodaysCommunications] = useState([]);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  useEffect(() => {
    const now = new Date();
    const today = formatDate(now);

    // Overdue: Scheduled before today and still marked as scheduled
    const overdue = calendarData.filter(
      (comm) =>
         formatDate(comm.date) < today &&
        comm.status === "Scheduled"
    );

    // Today's: Scheduled for today
    const dueToday = calendarData.filter(
      (comm) => formatDate(comm.date) === today && comm.status === "Scheduled"
    );

    setOverdueCommunications(overdue);
    setTodaysCommunications(dueToday);
  }, [calendarData]);

  const toggleNotifications = () => {
    setIsNotificationsVisible((prevState) => !prevState);
  };

  const closeNotifications = () => {
    setIsNotificationsVisible(false);
  };

  return (
    <div className="notifications">
      <header className="notifications-header">
        {/* Show icon only when notifications are not visible */}
        {!isNotificationsVisible && (
          <span className="notification-icon" onClick={toggleNotifications}>
            🔔
            <span className="badge">
              {overdueCommunications.length + todaysCommunications.length}
            </span>
          </span>
        )}
      </header>

      {isNotificationsVisible && (
        <div className="notification-grids">
          <div className="notification-header">
            {/* <h2>Notifications</h2> */}
            {/* Cross button to close the notification list */}
            <span className="close-button" onClick={closeNotifications}>
              &times;
            </span>
          </div>

          <div className="notification-section overdue">
            <h3>Overdue Communications</h3>
            {overdueCommunications.length === 0 ? (
              <p>No overdue communications.</p>
            ) : (
              <ul>
                {overdueCommunications.map((comm, index) => (
                  <li key={index}>
                    <strong>{comm.companyName}</strong> - {comm.type} (
                    {formatDate(comm.date)})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="notification-section todays">
            <h3>Today's Communications</h3>
            {todaysCommunications.length === 0 ? (
              <p>No communications due today.</p>
            ) : (
              <ul>
                {todaysCommunications.map((comm, index) => (
                  <li key={index}>
                    <strong>{comm.companyName}</strong> - {comm.type} (
                    {formatDate(comm.date)})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
