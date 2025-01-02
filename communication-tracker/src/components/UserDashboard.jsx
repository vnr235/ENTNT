import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import Notifications from './NotificationPanel';
import UserTableView from "./UserTableView"; // Import the new UserTableView component
import "./UserDashboard.css";
import { Link } from "react-router-dom";
import { getcalendar } from "../services/url";


const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); 
  const day = String(d.getDate()).padStart(2, '0'); 

  return `${year}-${month}-${day}`;
};

const UserDashboard = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetingData, setMeetingData] = useState([]);
  const [isHovered, setIsHovered] = useState(false); 


  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await getcalendar();
        setCalendarData(response.data);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };

    fetchCalendarData();
  }, []);

 
  const getCommunicationsForDate = (date) => {
    const formattedDate = formatDate(date); // Format date as YYYY-MM-DD
    return calendarData.filter((comm) => {
      const meetingDate = formatDate(comm.date);
      return meetingDate === formattedDate;
    }).map((comm) => ({
      companyName: comm.companyName,
      type: comm.type,
      notes: comm.notes,
      date: comm.date,
      status: new Date(comm.date) < new Date() ? "Completed" : "Scheduled"
    }));
  };

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setMeetingData(getCommunicationsForDate(date)); // Set the meetings data for the selected date
  };

  // Custom tile content to display meetings on each date block
  const tileContent = ({ date }) => {
    const meetingsForDay = getCommunicationsForDate(date);
    if (meetingsForDay.length > 0) {
      return (
        <div className="meeting-summary">
          {meetingsForDay.map((meeting, index) => (
            <div key={index} className="meeting-item">
              <span>{meeting.type} - {meeting.status}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Function to determine tile class based on the date
  const tileClassName = ({ date, view }) => {
    // Highlight today's date
    if (formatDate(date) === formatDate(new Date())) {
      return "highlight-today";
    }

    // Add other classes for meetings if needed (optional)
    const meetingsForDay = getCommunicationsForDate(date);
    if (meetingsForDay.length > 0) {
      return "meeting-date";
    }

    return null;
  };

  return (
    <div className="user-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <h1>User</h1>
        <Notifications calendarData={calendarData} />
      </div>

      <div className="calendar-container">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
        />

        {meetingData.length > 0 && (
          <div 
            className={`meeting-details ${isHovered ? "hovered" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h2>Meetings for {selectedDate.toDateString()}</h2>
            {meetingData.map((meeting, index) => (
              <div key={index} className="meeting-item">
                <p><strong>Company:</strong> {meeting.companyName}</p>
                <p><strong>Type:</strong> {meeting.type}</p>
                <p><strong>Notes:</strong> {meeting.notes}</p>
                <p><strong>Status:</strong> {meeting.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Table View (without Edit/Add functionality) */}
      <UserTableView userId={1} /> {/* Assuming userId or any other needed prop */}
      <Link to="/report">
        <button>view Communication Frequency Report</button>
      </Link>
    </div>
  );
};

export default UserDashboard;
