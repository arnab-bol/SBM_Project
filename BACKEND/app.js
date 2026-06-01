
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const connectDB = require("./config/db");

const moodRoutes =
    require("./routes/moodRoutes");

const journalRoutes =
    require("./routes/journalRoutes");

const contactRoutes =
    require("./routes/contactRoutes");



const app = express();

connectDB();



app.use(cors({
    origin: true,
    credentials: true
}));





app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const authRoutes = require("./routes/auth.routes");

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("MindSpace Backend Running");
});
app.use("/api/auth", authRoutes);

app.use("/api/moods", moodRoutes);

app.use("/api/journals", journalRoutes);

app.use("/api/contacts", contactRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

