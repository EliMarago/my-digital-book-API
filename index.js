import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import env from "dotenv";

import pg from "pg";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id DESC ");
    res.render("index.ejs", { book: result.rows }); //passa i libri alla view
  } catch (error) {
    console.error(error);
    res.send("Errore caricamento");
  }
});
app.get("/add", (req, res) => {
  res.render("add.ejs");
});
app.post("/add", async (req, res) => {
  const { title, author, dateOfCompletion, feedback, rating } = req.body;
  let coverUrl = "/images/default-cover.jpg";

  try {
    if (title) {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(
          title
        )}&author=${encodeURIComponent(author)}`
      );
      const data = await response.json();

      if (data.docs && data.docs.length > 0) {
        const bookData = data.docs[0];
        if (bookData.cover_i) {
          // cover_i è un numero interno
          coverUrl = `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`;
        } else if (bookData.cover_edition_key) {
          coverUrl = `https://covers.openlibrary.org/b/olid/${bookData.cover_edition_key}-L.jpg`;
        } else if (bookData.isbn && bookData.isbn.length > 0) {
          coverUrl = `https://covers.openlibrary.org/b/isbn/${bookData.isbn[0]}-L.jpg`;
        }
      }
    }

    await db.query(
      "INSERT INTO books (title, author, date_of_completion, feedback, rating, cover_url) VALUES ($1,$2,$3,$4,$5,$6)",
      [title, author, dateOfCompletion || null, feedback, rating || 0, coverUrl]
    );

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.send("Errore inserimento libri");
  }
});

app.post("/back", (req, res) => {
  res.redirect("/");
});
app.post("/book", async (req, res) => {
  let { id } = req.body; // prendi l'id nascosto dal form
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.send("libro non trovato"); // passi il libro alla view
    }
    const book = result.rows[0];
    res.render("book.ejs", { book });
  } catch (error) {
    console.error(error);
    res.send("Errore caricamento libro");
  }
});
app.post("/delete", async (req, res) => {
  const id = parseInt(req.body.id, 10);
  if (isNaN(id)) return res.status(400).send("ID non valido");

  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (error) {
    console.error("Errore", error);
    res.status(500).send("Errore server");
  }
});
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
