import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sessionLogic from "./sessionLogic";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Session API
app.use("/api/session-data", sessionLogic);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));