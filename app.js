const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const port = process.env.PORT || 3001;

const cors = require("cors");
const app = express();

const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");

// Allow requests from any origin
app.use(cors());

// Define an endpoint for the API

app.get("/api/scrape", async (req, res) => {
  try {
    // Extract the keyword from the query parameter
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword parameter is required" });
    }

    // Build the URL with the keyword
    const url = `https://www.jetphotos.com/photo/keyword/${encodeURIComponent(
      keyword
    )}`;

    // Fetch the webpage
    const response = await axios.get(url);

    // Load the HTML content using cheerio
    const $ = cheerio.load(response.data);

    // Find the first <a> tag with class "result__photoLink"
    const $photoLink = $(".result__photoLink").first();

    if (!$photoLink.length) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Extract the image source from the "src" attribute of the <img> tag within the <a> tag
    const imageSrc = $photoLink.find("img").attr("src").slice(2);

    if (!imageSrc) {
      return res.status(404).json({ error: "Image source not found" });
    }

    // Fetching aircraft info from Google Drive API

    //

    // Fetch the JSON file from Google Drive
    async function fetchGoogleDriveFile() {
      try {
        const token = fs.readFileSync("token.json"); // Save the access token after authentication
        oAuth2Client.setCredentials(JSON.parse(token));

        // Fetch the file content using Axios
        const response = await axios.get(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            headers: {
              Authorization: `Bearer ${oAuth2Client.credentials.access_token}`,
            },
          }
        );

        // Parse the JSON content
        const jsonData = JSON.parse(response.data);

        // Query the JSON data based on the ICAO number
        const icaoNumberToQuery = "7c6a63"; // Replace with the ICAO number you want to search for
        const aircraftData = jsonData.find(
          (aircraft) => aircraft.icao === icaoNumberToQuery
        );

        if (aircraftData) {
          console.log("Aircraft Registration:", aircraftData.registration);
        } else {
          console.log("Aircraft not found.");
        }
      } catch (error) {
        console.error("Error fetching Google Drive file:", error);
      }
    }

    fetchGoogleDriveFile();

    // End

    // Return the image source in the response
    res.json({ imageSrc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
