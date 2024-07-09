const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Configure multer for file uploads with in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MongoDB setup
const mongoUri = process.env.DB_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

const foodSchema = new mongoose.Schema({
    name: String,
    image: String,
    timestamp: Date
});

const Food = mongoose.model('Food', foodSchema);

app.post('/api/food', upload.single('foodImage'), async (req, res) => {
    try {
        const { foodName, foodTimestamp } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        const imageBuffer = req.file.buffer;
        const imageBase64 = imageBuffer.toString('base64');
        const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

        const newFood = new Food({
            name: foodName,
            image: imageDataUrl,
            timestamp: new Date(foodTimestamp)
        });

        await newFood.save();
        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ message: 'Failed to add food.' });
    }
});

app.get('/api/food', async (req, res) => {
    try {
        const foodEntries = await Food.find().sort({ timestamp: -1 });
        res.status(200).json(foodEntries);
    } catch (error) {
        console.error('Error fetching food entries:', error);
        res.status(500).json({ message: 'Failed to fetch food entries.' });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
