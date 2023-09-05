import isEmail from 'validator/lib/isEmail.js';
import { resolveMx } from 'dns/promises';
import XLSX from 'xlsx';
import fs from 'fs';
import emails from './model.js';

// Email verification function
async function verifyEmail(email) {
    try {

        // Syntax and Format Check
        if (!isEmail(email)) {
            return { success: false, message: 'Invalid email address format' };
        }

        // Domain Verification
        const domain = email.split('@')[1];
        try {
            await resolveMx(domain);
        } catch (error) {
            return { success: false, message: 'Invalid domain or domain does not exist' };
        }

        return { success: true, message: 'Email address is valid' };
    } catch (error) {
        console.error('Error in verifyEmail:', error);
        return { success: false, message: 'An error occurred during email verification' };
    }
}



// for only single email checking 
// export const validate_email = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const emailVerificationResult = await verifyEmail(email);

//         if (emailVerificationResult.success) {
//             return res.status(200).json({ message: emailVerificationResult.message });
//         } else {
//             return res.status(400).json({ error: emailVerificationResult.message });
//         }
//     } catch (error) {
//         console.error('Error in validate_email:', error);
//         res.status(500).json({ message: 'An error occurred on the server side' });
//     }
// };



//upload data on mongodb after that retrive data and checking email status and automaticatly add new field 
// uploading 

export const validate_email = async (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetNamelist = workbook.SheetNames;

        // Define a batch size for bulk insertion
        const batchSize = 100;

        const processSheetData = async (sheetName) => {
            const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            const updatedXlData = await Promise.all(xlData.map(async (item) => {
                return item;
            }));
            return updatedXlData;
        };

        const updatedXlDataArrays = await Promise.all(sheetNamelist.map(processSheetData));
        const updatedXlData = [].concat(...updatedXlDataArrays);

        // Create an array of XLData subdocuments with reference to Excel document
        const xlDataSubdocs = updatedXlData.map(item => ({
            ...item,
        }));

        // Insert XLData subdocuments in bulk
        await emails.insertMany(xlDataSubdocs);

        // Delete the existing file
        fs.unlinkSync(req.file.path);

        return res.json({ status: 200, success: true, msg: 'running' });
    } catch (error) {
        console.error('Error while updating and saving newExcelDocument:', error);
        res.status(500).json({ status: 500, success: false, msg: error.message });
    }
};


//checking amd downloading
export const checking = async (req, res) => {
    try {
        // Fetch data from MongoDB (replace with your MongoDB query)
        const emailss = await emails.find(); // Replace with your actual query

        // Create a data structure to store the results
        const emailData = [];

        // Iterate through the emails and verify them
        for (const emailRecord of emailss) {
            const email = emailRecord.email;
            const verificationResult = await verifyEmail(email);

            // Create an object that includes email, status, and any other relevant data
            const resultObject = {
                Email: email,
                Status: verificationResult.success ? 'Valid' : 'Invalid',
                reason: verificationResult.message
                // Add other data from the emailRecord object if needed
            };

            emailData.push(resultObject);
        }

        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(emailData);

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Verification');

        // Generate a unique file name for the output Excel file
        const timestamp = Date.now();
        const outputFilePath = `emailstatus_${timestamp}.xlsx`;

        // Write the modified Excel file
        XLSX.writeFile(workbook, outputFilePath);

        // Automatically trigger the download of the Excel file
        res.setHeader('Content-Disposition', `attachment; filename="${outputFilePath}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.download(outputFilePath);


    } catch (error) {
        console.error('Error in validateAndDownloadEmails:', error);
        res.status(500).json({ message: 'An error occurred on the server side' });
    }
};

