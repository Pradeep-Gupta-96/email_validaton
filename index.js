import express from "express";
import cors from 'cors';
import { routes } from "./routs.js"; // Assuming you have defined your routes in a separate file
import {database} from './connection.js'
const app = express();

app.use(cors());

// Express automatically includes the JSON and URL-encoded body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
database()
// Mount your routes at the "/api" prefix
app.use("/api", routes);

// Define a simple root route for testing
app.get('/', (req, res) => {
    res.send("Welcome to the API");
});

const port = process.env.PORT || 4000; // Use the PORT environment variable if available
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
