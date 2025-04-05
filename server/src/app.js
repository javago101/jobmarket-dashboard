const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const jobRoutes = require('./routes/jobs');
const apiConfig = require('./config/api.config');

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-rapidapi-key'];
    if (!apiKey || apiKey !== process.env.JSEARCH_API_KEY) {
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized - Invalid API Key',
            details: 'Please provide a valid RapidAPI key in the X-RapidAPI-Key header'
        });
    }
    next();
};

// Load environment variables
dotenv.config();

// Debug logging
console.log('Environment variables loaded:');
console.log('JSEARCH_API_KEY:', process.env.JSEARCH_API_KEY ? '***' + process.env.JSEARCH_API_KEY.slice(-4) : 'not set');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use('/api', validateApiKey);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobSearch', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/jobs', jobRoutes);

// Add root path handler
app.get('/', (req, res) => {
    res.json({ message: 'Job Market API is running' });
});

// Add static file serving for frontend
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Internal Server Error',
        details: err.message || 'Something went wrong!'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});