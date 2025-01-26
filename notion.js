const axios = require("axios");
const express = require("express");
const cors = require("cors");

const NOTION_TOKEN = "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";
const databases = {
  programas: "1802d422723480acaa35ccb1b45f4d67",
};

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

const obtenerProgramas = async (numPages = null) => {
  const url = `https://api.notion.com/v1/databases/${databases.programas}/query`;
  const getAll = numPages === null;
  const pageSize = getAll ? 100 : numPages;
  let results = [];
  let hasMore = true;
  let startCursor = null;
  try {
    while (hasMore) {
      const payload = {
        page_size: pageSize,
        ...(startCursor && { start_cursor: startCursor }),
      };
      const response = await axios.post(url, payload, { headers });
      const data = response.data;
      results = results.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
      if (!getAll) break;
    }
    return results;
  } catch (error) {
    console.error(
      "Error fetching pages:",
      error.response?.data || error.message
    );
  }
};

const app = express();
app.use(cors());

app.get("/programas", async (req, res) => {
  const pages = await obtenerProgramas();
  const datos = await pages.map((page) => {
    const props = page.properties;
    const title = props.title;
    const image = props.imagenes;
    const paragraph = props.paragraph;
    console.log("leyedo datos de notion");
    return {
      title: title?.title[0]?.text?.content ? title.title[0].text.content : "",
      image: image?.files[0]?.file?.url ? image.files[0].file.url : "",
      paragraph: paragraph?.rich_text[0]?.text?.content
        ? paragraph.rich_text[0].text.content
        : "",
    };
  });
  res.send(datos);
});

app.listen(3000, () => {
  console.log("Servicio en funcionamiento");
});
