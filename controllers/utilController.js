import axios from "axios";
import * as cheerio from "cheerio";

export const getLinkPreview = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 5000,
    });

    const preview = {
      url,
      title: getMetaTag("og:title") || $("title").text() || "",
      description:
        getMetaTag("og:description") || getMetaTag("description") || "",
      image: getMetaTag("og:image") || "",
      siteName: getMetaTag("og:site_name") || "",
    };

    res.json(preview);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch preview" });
  }
};
