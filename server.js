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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

const foodSchema = new mongoose.Schema({
    name: String,
    image: String,
    timestamp: { type: Date, default: Date.now }
});

const Food = mongoose.model('Food', foodSchema);

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Food Logger app!');
});

app.post('/api/food', upload.single('foodImage'), async (req, res) => {
    const { foodName } = req.body;
    const foodImage = req.file.filename;

    const newFood = new Food({ name: foodName, image: foodImage });
    try {
        await newFood.save();
        res.status(200).send('Food added');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/food', async (req, res) => {
    try {
        const foodEntries = await Food.find().sort({ timestamp: -1 });
        res.json(foodEntries);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
