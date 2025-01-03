import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserDashboard.css";
import { deleteCommunication } from "../services/url";
import { editcompany } from "../services/url";

const UserTableView = ({ userId }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetings, setMeetings] = useState({});
  const [popup, setPopup] = useState({ show: false, company: null, meeting: null });
  const [formData, setFormData] = useState({ date: "", notes: "", type: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://entnt-uz4q.onrender.com/api/companies");
        const companiesData = response.data;

        const meetingPromises = companiesData.map(async (company) => {
          const meetingResponse = await axios.get(
            `https://entnt-uz4q.onrender.com/api/communications/${company._id}/meetings`
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

  const handleDetails = (company) => {
    const content = `<strong>Name:</strong> ${company.name} <br/><br/> <strong>Email:</strong> ${company.emails} <br/><br /> <strong>Phone:</strong> ${company.phoneNumbers}`;
    setModalContent(content);
    setModalVisible(true);
  };

  const handleMarkCompleted = (company, meeting) => {
    setPopup({ show: true, company, meeting });
  };

  const handlePopupSubmit = async () => {
    const { company, meeting } = popup;
    try {
      const updatedCommunications = [
        ...company.lastCommunications,
        { date: formData.date, notes: formData.notes, type: formData.type },
      ];

      // Update the company with the new communication
      await editcompany(company._id, {
        lastCommunications: updatedCommunications,
      });

      // Delete the completed meeting
      await deleteCommunication(meeting._id);

      // Update the state
      setCompanies((prev) =>
        prev.map((comp) =>
          comp._id === company._id ? { ...comp, lastCommunications: updatedCommunications } : comp
        )
      );

      setMeetings((prev) => ({
        ...prev,
        [company._id]: prev[company._id].filter((m) => m._id !== meeting._id),
      }));

      setPopup({ show: false, company: null, meeting: null });
      setFormData({ date: "", notes: "", type: "" });
    } catch (error) {
      console.error("Error updating communication:", error);
    }
  };

  const getRowColor = (companyMeetings) => {
    const now = new Date();
    const today = now.toDateString();

    const hasPastMeeting = companyMeetings.some((meeting) => new Date(meeting.date) < now);
    const hasTodayMeeting = companyMeetings.some(
      (meeting) => new Date(meeting.date).toDateString() === today
    );

    if (hasTodayMeeting) return "light-yellow";
    return hasPastMeeting ? "light-red" : "light-green";
  };


  return (
    <div className="dashboard-container">
      <h1>Company Communication Dashboard</h1>
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
              const rowColorClass = getRowColor(companyMeetings);

              return (
                <tr key={company._id} className={rowColorClass}>
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
                    <button type="add" onClick={() => handleDetails(company)}>Details</button>
                    {companyMeetings.map((meeting, index) => (
                      <button type="add" key={index} onClick={() => handleMarkCompleted(company, meeting)}>
                        Mark Completed
                      </button>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {popup.show && (
        <div className="popup-layover">
          <div className="popup" >
            <h2>Mark Meeting as Completed</h2>
            <form
              className="formm"
              onSubmit={(e) => {
                e.preventDefault();
                handlePopupSubmit();
              }}
            >
              <label>
                Date:
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </label>
              <label>
                Notes:
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  required
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </label>
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => setPopup({ show: false, company: null, meeting: null })}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}



      {/* Modal for displaying company details */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Company Details</h2>
            <div dangerouslySetInnerHTML={{ __html: modalContent }} />
            <button type="delete" onClick={() => setModalVisible(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserTableView;
