import express from 'express';

const app = express();
const port = 5000;

app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from backend!' });
});

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
