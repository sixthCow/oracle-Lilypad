require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();
const port = 3100;

app.use(cors());
app.use(express.json());

app.post('/run-command', (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        console.log('Prompt is required');
        return res.status(400).send('Prompt is required');
    }

    // Sanitize and extract fields
    let sanitizedPrompt;
    if (prompt.startsWith('Imagine')) {
        sanitizedPrompt = sanitizeImaginePrompt(prompt);
    } else {
        sanitizedPrompt = sanitizeAndExtractFields(prompt);
    }
    
    if (!sanitizedPrompt) {
        return res.status(400).send('Invalid prompt format');
    }

    // Escape quotes for the shell command
    const escapedPrompt = JSON.stringify(sanitizedPrompt);
    console.log(escapedPrompt)
    // return res.status(400).send('Invalid prompt format');
    const command = `lilypad run ollama-pipeline:llama3-8b-lilypad1 -i Prompt=${escapedPrompt} --web3-private-key "${process.env.WEB3_PRIVATE_KEY_LILYPAD}"`;

    console.log('Running command:', command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return res.status(500).send(`Error: ${error.message}`);
        }

        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
            return res.status(500).send(`Stderr: ${stderr}`);
        }

        console.log('Command stdout:', stdout);

        const resultDirMatch = stdout.match(/\/tmp\/lilypad\/data\/downloaded-files\/(\w+)/);
        if (resultDirMatch) {
            const resultDir = resultDirMatch[1];
            const resultFilePath = `/tmp/lilypad/data/downloaded-files/${resultDir}/stdout`;

            console.log('Result directory:', resultDir);
            console.log('Result file path:', resultFilePath);

            exec(`cat ${resultFilePath}`, (catError, catStdout, catStderr) => {
                if (catError) {
                    console.error(`Error reading result file: ${catError.message}`);
                    return res.status(500).send(`Error: ${catError.message}`);
                }

                if (catStderr) {
                    console.error(`Cat stderr: ${catStderr}`);
                    return res.status(500).send(`Stderr: ${catStderr}`);
                }

                console.log('Cat stdout:', catStdout);

                try {
                    const response = extractResponse(catStdout);
                    console.log('Extracted response:', response);
                    res.send(response);
                } catch (extractError) {
                    console.error(`Error extracting response: ${extractError.message}`);
                    res.status(500).send(`Error: ${extractError.message}`);
                }
            });
        } else {
            console.log('Result directory not found in output.');
            res.status(500).send('Result directory not found in output.');
        }
    });
});


function sanitizeImaginePrompt(prompt) {
    console.log('Sanitizing "Imagine" prompt');
    try {
        // Remove any backslashes and new line characters
        let sanitizedPrompt = prompt.replace(/\\n/g, ' ')
                                    .replace(/\\'/g, "'")
                                    .replace(/\\"/g, '"')
                                    .replace(/[\n\r]/g, ' ')
                                    .trim();
        return sanitizedPrompt;
    } catch (error) {
        console.error(`Error sanitizing "Imagine" prompt: ${error.message}`);
        return null;
    }
}

function sanitizeAndExtractFields(prompt) {
    console.log('Sanitizing and extracting fields');
    try {
        const createdAtRegex = /"created_at":"([^"]*)"/g;
        const screenNameRegex = /"screen_name":"([^"]*)"/g;
        const textRegex = /"text":"([^"]*)"/g;

        const createdAts = [];
        const screenNames = [];
        const texts = [];

        let match;

        // Extract created_at fields
        while ((match = createdAtRegex.exec(prompt)) !== null) {
            createdAts.push(match[1]);
        }

        // Extract screen_name fields
        while ((match = screenNameRegex.exec(prompt)) !== null) {
            screenNames.push(match[1]);
        }

        // Extract text fields and filter for English characters
        const englishTextRegex = /^[A-Za-z0-9\s.,!?'"-]*$/;

        while ((match = textRegex.exec(prompt)) !== null) {
            let text = match[1].replace(/"/g, '').replace(/[\n\r\\]/g, ' ');
            if (englishTextRegex.test(text)) {
                texts.push(text);
            }
        }

        // Create the desired cleaned output
        let cleanedOutput = 'Read this this timeline from Twitter: {timeline:[';
        for (let i = 0; i < createdAts.length; i++) {
            cleanedOutput += `{created_at:${createdAts[i]},screen_name:${screenNames[i]},text:${texts[i] ? texts[i].replace(/'/g, '') : ''}}, `;
        }
        cleanedOutput = cleanedOutput.slice(0, -2) + ']} Based on this timeline, generate a very detailed analysis as if you are a professional sentiment analyzer on these key categories. Provide at least 3-4 paragraphs each, incorporating specific details mentioned from the timeline data into your paragraphs. Be analytical and detailed, do not use lists only paragraphs in this format: [Background {brief history about event/topic?}, Relevant Locations and Dates, Summarization {summarize what the posts are discussing about the topic}, Trending Discussions {what key words were used? what did users talk about?}, Sentiment Analysis {compare views and emotions on the topic between users in the data}, Impact Assessment {what lasting impact does this event have?}. Be very detailed, professional, and descriptive in your response, in organized markdown format.';

        return cleanedOutput;
    } catch (error) {
        console.error(`Error sanitizing and extracting fields: ${error.message}`);
        return null;
    }
}


// function extractResponse(catOutput) {
//     console.log('Extracting response from cat output');
    
//     // Use regular expression to match the response field
//     const responseMatch = catOutput.match(/'response': "(.*?[^\\])", 'done':/s);
//     if (!responseMatch) {
//         throw new Error('Response not found in output.');
//     }

//     let response = responseMatch[1];

//     // Handle multiline response and unescape characters
//     response = response.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"');

//     return response;
// }


function extractResponse(catOutput) {
    console.log('Extracting response from cat output');

    // Match the response field using a more robust regex to handle escaped quotes
    let responseMatch = catOutput.match(/'response':\s*'(.*?)',\s*'done':\s*True/s);
    if (!responseMatch) {
        // If the single-quote pattern doesn't match, try the double-quote pattern
        responseMatch = catOutput.match(/'response':\s*"(.*?[^\\])",\s*'done':/s);
    }

    if (!responseMatch) {
        throw new Error('Response not found in output.');
    }

    let response = responseMatch[1];

    // Handle multiline response and unescape characters
    response = response.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\/'/g, "'");

    return response;
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
