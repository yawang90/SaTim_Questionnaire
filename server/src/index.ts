import express from 'express';
import dotenv from 'dotenv';
import userRoutes from "./routes/userRoutes.js";
import editorRoutes from "./routes/editorRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/editor', editorRoutes);

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
