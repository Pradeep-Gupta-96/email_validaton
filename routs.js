import express from "express";
import multer from 'multer'
import {
    // checking,
    validate_email
} from "./controller.js";

export const routes = express.Router()

// Multer Configuration
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        // Delete the previous file
        if (req.file) {
            fs.unlinkSync('./public/uploads/' + req.file.filename);
        }

        // Generate a new filename
        const newFilename = file.originalname;

        cb(null, newFilename);
    }
});


const upload = multer({ storage });

//  admin Routes
routes.post('/validate_email', upload.single('file'), validate_email)
// routes.get('/checking', checking)
