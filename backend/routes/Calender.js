const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const Communication = require("../models/Communication");

// Fetch both last communications (past) and scheduled communications (future) for calendar
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find();
    const scheduledCommunications = await Communication.find();
   
    // Combine both last communications and scheduled communications
    const calendarData = [];

    // Last communications (past)
    companies.forEach((company) => {
      if (company.lastCommunications) {
        company.lastCommunications.forEach((comm) => {
          calendarData.push({
            date: comm.date,
            type: comm.type,
            notes: comm.notes,
            companyName: company.name,
            status:  "Completed" , // Completed if the meeting date is in the past
          });
        });
      }
    });


    // Scheduled communications (future)
    for (const comm of scheduledCommunications) {
      const company = await Company.findById(comm.companyId); // Wait for the promise to resolve
      calendarData.push({
        date: comm.date,
        type: comm.type,
        notes: comm.notes,
        companyName: comm.name, // Use the resolved company data
        status: "Scheduled",
      });
    }

    // Sort all communications by date
    calendarData.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(calendarData);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;