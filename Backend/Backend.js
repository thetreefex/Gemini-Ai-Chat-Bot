import { GoogleGenAI } from "@google/genai"
import pg from "pg"
import express from "express"
import cors from "cors"
import * as dotenv from "dotenv"
dotenv.config()
const pool = new pg.Pool({
    user:"postgres",
    host:"localhost",
    database:"My_App",
    password:process.env.DB_PASSWORD,
    port:5432
})
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.log("Something went wrong:", err)
    } else {
        console.log("DataBase Connected:", res.rows[0])
    }
})
const app = express()
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})
app.use(cors())
app.use(express.json())
app.post("/chat", async(req,res) => {
    const {message,chatId,model} = req.body
    await pool.query(
        "INSERT INTO messages (chat_id, role, text) VALUES ($1,$2,$3)",
        [chatId,"user",message]
    )
    const Data = await pool.query(
        "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
        [chatId]
    )
    const history = Data.rows
    const formatted = history.map(row => ({
    role: row.role,
    parts: [{ text: row.text }]}))
    const response = await ai.models.generateContentStream({
        model: model || "gemini-2.5-flash",
        contents: formatted
    })
    console.log(model)
    let fulltext = ""
    res.setHeader("Content-Type", "text/plain")
    for await (const chunk of response) {
        fulltext += chunk.text
        res.write(chunk.text)
    }
    res.end()
    await pool.query(
        "INSERT INTO messages (chat_id, role, text) VALUES ($1,$2,$3)",
        [chatId,"model",fulltext]
    )
})
 app.listen(3000,() => {
        console.log("Сервер запущен")
    })