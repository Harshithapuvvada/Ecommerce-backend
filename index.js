const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/user'); // Ensure this is the correct path
const run = require('./api/ai');
const app = express();
const port = 5000;

app.use(cors({
    origin: 'https://flames-proj-website-ecom.onrender.com',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(409).json({ message: "All fields are required" });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(405).json({ message: "User already exists" });
        }

        const user = new User({ name, email, password });
        await user.save();

        return res.status(201).json({ message: "User created" });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(409).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        if (password !== user.password) {
            return res.status(409).json({ message: "Incorrect password" });
        }

        return res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/api/genai', async (req, res) => {
    try {
        const { message } = req.body;
        const reply = await run(message);
        res.json({ reply });
    } catch (error) {
        console.error('Error fetching reply from GenAI:', error);
        res.status(500).json({ error: 'Failed to fetch reply from GenAI' });
    }
});

mongoose.connect('mongodb+srv://sudharshanreddydev:qoQHwe1Zd6hRyVzF@user-cred.igny5kr.mongodb.net/?retryWrites=true&w=majority&appName=user-cred')
    .then(() => console.log('db connected'))
    .catch((err) => console.log(err));

app.listen(port, () => console.log(`Listening on port ${port}`));
