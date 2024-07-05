const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploads statically

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// MongoDB setup
const mongoUri = process.env.DB_URI; // Use environment variable for MongoDB URI
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

// API Routes
app.post('/api/food', upload.single('foodImage'), async (req, res) => {
    try {
        const { foodName, foodTimestamp } = req.body;
        const newFood = new Food({
            name: foodName,
            image: req.file.filename,
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

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
