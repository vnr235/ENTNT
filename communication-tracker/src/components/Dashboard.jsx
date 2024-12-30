import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [meetingForm, setMeetingForm] = useState({
    date: "",
    type: "",
    notes: "",
  });
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addCompanyForm, setAddCompanyForm] = useState({
    name: "",
    location: "",
    linkedin: "",
    email: "",
    phone: "",
    comments: "",
    communicationPeriodicity: "2 weeks",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/companies");
        const companiesData = response.data;

        const meetingPromises = companiesData.map(async (company) => {
          const meetingResponse = await axios.get(
            `http://localhost:5000/api/communications/${company._id}/meetings`
          );
          return { [company._id]: meetingResponse.data };
        });

        const meetingsData = await Promise.all(meetingPromises);
        const meetingsMap = Object.assign({}, ...meetingsData);

        setCompanies(companiesData);
        setMeetings(meetingsMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching companies and meetings:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddMeeting = (companyId) => {
    setSelectedCompany(companyId);
    setMeetingForm({ date: "", type: "", notes: "" });
  };

  const handleEditMeeting = (companyId, meeting) => {
    setSelectedCompany(companyId);
    setMeetingForm(meeting);
  };

  const handleSaveMeeting = async () => {
    try {
      const { date, type, notes, _id } = meetingForm;

      if (!date || !type) {
        alert("Date and Type are required");
        return;
      }

      if (_id) {
        // Edit existing meeting
        const response = await axios.put(
          `http://localhost:5000/api/communications/${_id}`,
          { date, type, notes }
        );
        const updatedMeeting = response.data;

        // Update meetings state
        setMeetings((prevMeetings) => ({
          ...prevMeetings,
          [selectedCompany]: prevMeetings[selectedCompany].map((meeting) =>
            meeting._id === _id ? updatedMeeting : meeting
          ),
        }));
        alert("Meeting updated successfully");
      } else {
        // Add a new meeting
        const response = await axios.post(
          `http://localhost:5000/api/communications/${selectedCompany}/next-meeting`,
          { date, type, notes }
        );
        const newMeeting = response.data;

        // Add new meeting to the state
        setMeetings((prevMeetings) => ({
          ...prevMeetings,
          [selectedCompany]: [...(prevMeetings[selectedCompany] || []), newMeeting],
        }));
        alert("Meeting added successfully");
      }

      setSelectedCompany(null); // Close the form
    } catch (error) {
      console.error("Error saving meeting:", error);
      alert("Failed to save the meeting.");
    }
  };

  const handleSaveCompany = async () => {
    try {
      const { name, location, linkedin, email, phone, comments, communicationPeriodicity } =
        addCompanyForm;

      if (!name || !email || !phone) {
        alert("Name, Email, and Phone Number are required");
        return;
      }
      const response = await axios.post("http://localhost:5000/api/companies/add", {
        name,
        location,
        linkedin,
        email,
        phone,
        comments,
        communicationPeriodicity,
        lastCommunications: [],
      });
      const newCompany = response.data;

      setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
      alert("Company added successfully");
      setShowAddCompany(false);
    } catch (error) {
      console.error("Error adding company:", error);
      alert("Failed to add the company.");
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return; 
    }
  
    try {
      await axios.delete(`http://localhost:5000/api/companies/delete/${companyId}`);
      setCompanies((prevCompanies) =>
        prevCompanies.filter((company) => company._id !== companyId)
      );
      setMeetings((prevMeetings) => {
        const { [companyId]: _, ...remainingMeetings } = prevMeetings;
        return remainingMeetings;
      });
  
      alert("Company deleted successfully!");
    } catch (error) {
      console.error("Error deleting the company:", error);
      alert("Failed to delete the company.");
    }
  };
  

  return (
    <div className={`dashboard-container ${selectedCompany || showAddCompany ? "dimmed" : ""}`}>
      <div className="dashboard-header">
        <h1>Company Communication Dashboard</h1>
        <button onClick={() => setShowAddCompany(true)}>Add Company</button>
      </div>

      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Last 5 Communications</th>
              <th>Scheduled Meetings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const companyMeetings = meetings[company._id] || [];

              return (
                <tr key={company._id}>
                  <td>{company.name}</td>
                  <td>
                    {company.lastCommunications.slice(0, 5).map((comm, index) => (
                      <div key={index}>
                        {comm.type} ({new Date(comm.date).toLocaleDateString()})
                      </div>
                    ))}
                  </td>
                  <td>
                    {companyMeetings.map((meeting, index) => (
                      <div key={index}>
                        {meeting.type} ({new Date(meeting.date).toLocaleDateString()}){" "}
                        {meeting.notes && `- ${meeting.notes}`}
                      </div>
                    ))}
                  </td>
                  <td>
                    <button
                      style={{ backgroundColor: "lightblue" }}
                      onClick={() => handleAddMeeting(company._id)}
                    >
                      Add
                    </button>
                    {companyMeetings.map((meeting, index) => (
                      <button
                        style={{ backgroundColor: "lightblue", marginLeft: "20px" }}
                        key={index}
                        onClick={() => handleEditMeeting(company._id, meeting)}
                      >
                        Edit
                      </button>

                    ))}
                    <button
                      onClick={() => handleDeleteCompany(company._id)}
                      style={{ background: 'red', color: 'white', fontSize: 'large', marginLeft: '20px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Add/Edit Meeting Form */}
      {selectedCompany && (
        <div className="meeting-form-overlay">
          <div className="meeting-form">
            <h2>{meetingForm._id ? "Edit Meeting" : "Add Meeting"}</h2>
            <form className="formm"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveMeeting();
              }}
            >
              <label>
                Date:
                <input
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, date: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={meetingForm.type}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, type: e.target.value })
                  }
                  required
                />
              </label>
              <label style={{ display: 'flex' }}>
                Notes:
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, notes: e.target.value })
                  }
                />
              </label>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setSelectedCompany(null)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Form */}
      {showAddCompany && (
        <div className="add-company-overlay">
          <div className="add-company-form">
            <h2>Add Company</h2>
            <form className="formm"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCompany();
              }}
            >
              <label>
                Name:
                <input
                  type="text"
                  value={addCompanyForm.name}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  value={addCompanyForm.location}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, location: e.target.value })
                  }
                />
              </label>
              <label>
                LinkedIn Profile:
                <input
                  type="url"
                  value={addCompanyForm.linkedin}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, linkedin: e.target.value })
                  }
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={addCompanyForm.email}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, email: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Phone Number:
                <input
                  type="tel"
                  value={addCompanyForm.phone}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, phone: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Comments:
                <textarea
                  value={addCompanyForm.comments}
                  onChange={(e) =>
                    setAddCompanyForm({ ...addCompanyForm, comments: e.target.value })
                  }
                />
              </label>
              <label>
                Communication Periodicity:
                <input
                  type="text"
                  value={addCompanyForm.communicationPeriodicity}
                  onChange={(e) =>
                    setAddCompanyForm({
                      ...addCompanyForm,
                      communicationPeriodicity: e.target.value,
                    })
                  }
                  placeholder="e.g., 2 weeks"
                />
              </label>
              <button type="submit">Save</button>
              <button type="button" onClick={() => setShowAddCompany(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
