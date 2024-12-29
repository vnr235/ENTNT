const express = require("express");
const router = express.Router();
const Company = require("../models/Company"); // Assuming this is your Company model
const Communication = require("../models/Communication");

// Get past communications for calendar
router.get("/", async (req, res) => {
  try {
    const companies = await Company.find();
    const communication = await Communication.find();

    const calendarData = [];

    companies.forEach((company) => {
      if (company.lastCommunications) {
        company.lastCommunications.forEach((comm) => {
          calendarData.push({
            date: comm.date,
            type: comm.type,
            notes: comm.notes,
            companyName: company.name,
          });
        });
      }
    });

    if (Array.isArray(communication)) {
      communication.forEach((comm) => {
        calendarData.push({
          date: comm.date,
          type: comm.type,
          notes: comm.notes,
          companyName: "company", // Adjust this if needed
        });
      });
    }

    res.json(calendarData);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
