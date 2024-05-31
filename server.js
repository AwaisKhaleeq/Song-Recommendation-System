const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const fs = require('fs');
const { type } = require('os');

const app = express();
const port = 3000;

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route handler for the root URL ("/")
app.get('/', async (req, res) => {
    try {
        // Connect to MongoDB
        await client.connect();
        
        // Access the "audio" collection and "fs.chunks" collection
        const db = client.db('Dataset');
        const collectionAudio = db.collection('audio');
        const collectionChunks = db.collection('fs.chunks');

        // Fetch data from the "audio" collection
        const audioDocuments = await collectionAudio.find().toArray();
        if (audioDocuments.length === 0) {
            console.log('No documents found in the "audio" collection.');
            return res.status(404).send('No audio documents found.');
        }

        // Extract the file IDs from the fetched documents under the "features" field
        const fileId = audioDocuments.map(doc => doc.features.file_id);
        console.log("FILE ID:", fileId); 

        // Query the "fs.chunks" collection
        const chunkDocuments = await collectionChunks.find().toArray();
        if (chunkDocuments.length === 0) {
            console.log('No documents found in the "fs.chunks" collection.');
            return res.status(404).send('No chunk documents found.');
        }
        
        const fileId1 = chunkDocuments.map(doc => doc.files_id);
        console.log("FILE ID 1:", fileId1); 

        // Check if the arrays fileId and fileId1 are equal
        const arraysAreEqual = fileId.every((value, index) => value === fileId1[index]);

        // Determine the minimum length between fileId and chunkDocuments
        const minLength = Math.min(fileId.length, chunkDocuments.length);

        // Process each file ID regardless of equality
        console.log('Processing each file ID...');
        for (let i = 0; i < minLength; i++) {
            console.log("INSIDE")
            const outputFilePath = `output${i}.mp3`;
            
            // Write the binary data to an MP3 file
            await fs.promises.writeFile(outputFilePath, chunkDocuments[i].data.buffer, 'binary');
            console.log(`MP3 file saved: ${outputFilePath}`);
        }

        console.log("HELLLLO");

        // Render the HTML template with the fetched data (chunkDocument)
        res.render(path.join(__dirname, 'index.ejs'), { message: 'MP3 file saved successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});