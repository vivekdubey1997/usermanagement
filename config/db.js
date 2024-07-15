const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = async () => {
    try {
        const mongodbURI = process.env.MONGODB_URI;

        if (!mongodbURI) {
            throw new Error('MongoDB URI not found in .env file');
        }

        await mongoose.connect(mongodbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error', error);
        process.exit(1);
    }
};

module.exports = connectDB;
