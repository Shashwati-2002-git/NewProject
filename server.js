import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "apikey.env") });

// ✅ Serve static files (your HTML, JS, CSS) from project root
app.use(express.static(__dirname));

const dbConfig = {
  user: "sa", // change if needed
  password: "78792002CBb#", // your password
  server: "localhost",
  database: "SanctoMindDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("✅ Connected to SanctoMindDB");
    return pool;
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
}

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing. Check apikey.env file.");
}
else {
  console.log("✅ GEMINI_API_KEY loaded successfully.");
}

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Serve your HTML file when user visits root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Chat API
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Always send input as array
    const result = await model.generateContent([userMessage]);

    // Safely extract text reply
    const reply =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No reply received from Gemini.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error (full):", error);
    res.status(500).json({ reply: "⚠️ Sorry, something went wrong." });
  }
});

// ✅ Professionals API
app.get("/api/professionals", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.request().query(`
      SELECT HP_ID, HP_Name, HP_Sp_Field, HP_Profile_URL, WD_Timing, SD_Timing 
      FROM HP_Table
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);