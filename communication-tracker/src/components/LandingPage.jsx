import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // Add styles if needed

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="header">
        <h1>Welcome to our Platform</h1>
        <p>Choose your role to proceed</p>
      </div>
      <div className="button-container">
        <button className="role-button admin-button" onClick={()=> navigate("/admin-dashboard")}>
          Admin
        </button>
        <button className="role-button user-button" onClick={()=> navigate("/user-dashboard")}>
          User
        </button>
      </div>
      <footer className="footer">
        <p>© 2025 Your Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;




