const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('Tip: Ensure MongoDB is running locally (default port 27017).');
        // Do not exit process, allows server to start for UI testing
    }
};

module.exports = connectDB;
