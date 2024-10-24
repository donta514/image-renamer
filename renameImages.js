const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const scrapeGettyImages = async (searchId) => {
  const searchUrl = `https://www.gettyimages.com/photos/${searchId}`;
  try {
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    // Find the H1 element with the specified class
    const h1Text = $("h1.Jh6M4pCzh6pJwDPHwv7z").text().trim();
    return h1Text || null;
  } catch (error) {
    console.error(
      `Failed to retrieve data for ID ${searchId}: ${error.message}`
    );
    return null;
  }
};

const renameImages = async (directory) => {
  const files = await fs.readdir(directory);

  for (const filename of files) {
    const match = filename.match(/GettyImages-(\d+)\.jpg$/);
    if (match) {
      const imageId = match[1];
      const title = await scrapeGettyImages(imageId);

      if (title) {
        const titleWords = title.split(" ").slice(0, 5);
        const newFilename = `${titleWords.join("-")}-GettyImages-${imageId}.jpg`;

        const oldPath = path.join(directory, filename);
        const newPath = path.join(directory, newFilename);

        // Rename the file
        await fs.rename(oldPath, newPath);
        console.log(`Renamed: ${oldPath} to ${newPath}`);
      }
    }
  }
};

// Example usage
const directory = './Images';
renameImages(directory);
