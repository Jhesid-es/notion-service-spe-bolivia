const axios = require("axios");
const express = require("express");

const NOTION_TOKEN = "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";
const DATABASE_ID = "1802d422723480acaa35ccb1b45f4d67";

const headers = {
  Authorization: `Bearer ${NOTION_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

const app = express();

const createPage = async (data) => {
  const createUrl = "https://api.notion.com/v1/pages";

  const payload = {
    parent: { database_id: DATABASE_ID },
    properties: data,
  };

  try {
    const res = await axios.post(createUrl, payload, { headers });
    return res.data;
  } catch (error) {
    console.error(
      "Error creating page:",
      error.response?.data || error.message
    );
  }
};

const title = "Test Title";
const description = "Test Description";
const publishedDate = new Date().toISOString();

const data = {
  URL: {
    title: [
      {
        text: { content: description },
      },
    ],
  },
  Titulo: {
    rich_text: [
      {
        text: { content: title },
      },
    ],
  },
  Publicado: {
    date: { start: publishedDate, end: null },
  },
};

app.get("/", async (req, res) => {
  const pages = await getPages();
  const datos = await pages.map((page) => {
    const props = page.properties;
    const title = props.title;
    const image = props.imagenes;
    const paragraph = props.paragraph;
    console.log("leyedo datos de notion")
    return {
      title: title.title[0].text.content,
      image: image.files[0].file.url,
      paragraph: paragraph.rich_text[0].text.content,
    };
  });
  res.send(`Welcome spe bolivia, ${datos[0].title}`);
});
const getPages = async (numPages = null) => {
  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
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

(async () => {
  const pages = await getPages();
  const datos = await pages.map((page) => {
    const props = page.properties;
    const title = props.title;
    const image = props.imagenes;
    const paragraph = props.paragraph;
    return {
      title: title.title[0].text.content,
      image: image.files[0].file.url,
      paragraph: paragraph.rich_text[0].text.content,
    };
  });
  console.log(datos);
})();

app.listen(3000, () => {
  console.log("Server escuchando");
});
