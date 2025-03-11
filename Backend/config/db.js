const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/pdfUploader";

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected...");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
