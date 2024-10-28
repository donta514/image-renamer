import fs from "fs-extra";
import path from "path";
import formidable from "formidable-serverless";
import axios from "axios";
import cheerio from "cheerio";

export const config = {
  api: {
    bodyParser: false, // Use formidable for parsing files
  },
};

const scrapeGettyImages = async (searchId) => {
  const searchUrl = `https://www.gettyimages.com/photos/${searchId}`;
  try {
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    const h1Text = $("h1.Jh6M4pCzh6pJwDPHwv7z").text().trim();
    return h1Text || null;
  } catch (error) {
    console.error(
      `Failed to retrieve data for ID ${searchId}: ${error.message}`
    );
    return null;
  }
};

const renameImageFile = async (filePath, imageId) => {
  const title = await scrapeGettyImages(imageId);
  if (title) {
    const titleWords = title.split(" ").slice(0, 5).join("-");
    const newFilename = `${titleWords}-GettyImages-${imageId}.jpg`;
    const newPath = path.join(path.dirname(filePath), newFilename);
    await fs.rename(filePath, newPath);
    return newFilename;
  }
  return null;
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: "File upload error" });
      return;
    }

    const file = files.file;
    const imageId = fields.imageId; // Pass image ID from the client if needed

    try {
      const renamedFile = await renameImageFile(file.path, imageId);
      res.status(200).json({ renamedFile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
