import express from 'express';
import dotenv from 'dotenv';
import userRoutes from "./routes/userRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";
import path from "path";
import cors from 'cors';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(cors({
    origin: "http://localhost:5173",  // your frontend dev server
    credentials: true                 // allow cookies / auth headers
}));
app.use('/api/users', userRoutes);
app.use('/api/editor', editorRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
