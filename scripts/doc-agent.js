const fs = require('fs').promises;
const path = require('path');
const { parse } = require('@babel/parser');
const simpleGit = require('simple-git');

// --- CONFIGURATION ---
const DOCS_FILE = 'README.md';
const SOURCE_CODE_PATTERN = 'src/**/*.js'; // Pattern to find source files
const GIT_REPO_PATH = process.cwd();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MAX_RETRIES = 3; // Number of times to retry the API call

/**
 * A helper function to wait for a specified amount of time.
 * @param {number} ms The number of milliseconds to wait.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * A robust function to call the Gemini API with retry logic.
 * @param {string} prompt The prompt to send to the model.
 * @returns {Promise<string>} The generated text from the model.
 */
async function generateWithGemini(prompt) {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
        },
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                // Don't retry on client-side errors (like 400), but do retry on server errors (5xx) or rate limits (429)
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                     console.error(`Gemini API Error: Status ${response.status}\nResponse Body:\n${errorBody}`);
                     throw new Error(`API call failed with status ${response.status}. This is a client-side error and will not be retried.`);
                }
                 console.warn(`Attempt ${attempt} failed with status ${response.status}. Retrying...`);
                 await sleep(1000 * Math.pow(2, attempt)); // Exponential backoff
                 continue; // Go to the next attempt
            }

            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        } catch (error) {
            console.error(`An exception occurred during the Gemini API call on attempt ${attempt}:`, error.message);
            if (attempt === MAX_RETRIES) {
                throw new Error(`API call failed after ${MAX_RETRIES} attempts. Last error: ${error.message}`);
            }
            await sleep(1000 * Math.pow(2, attempt)); // Wait before retrying
        }
    }
    throw new Error("API call failed after all retries.");
}


/**
 * Finds all JavaScript files that have changed in the last commit.
 * Handles the case where there is only one commit in the history.
 * @returns {Promise<string[]>} A list of modified file paths.
 */
async function getChangedFiles() {
    const git = simpleGit(GIT_REPO_PATH);
    try {
        const log = await git.log({ n: 2 });
        if (log.total < 2) {
            console.warn("Only one commit found. Analyzing all files in the project.");
            return await getAllSourceFiles();
        }
        const diffSummary = await git.diffSummary(['HEAD~1', 'HEAD']);
        return diffSummary.files
            .map(file => file.file)
            .filter(file => file.endsWith('.js') && file.startsWith('src/'));
    } catch (error) {
        console.error("Error getting changed files, falling back to all files:", error);
        return await getAllSourceFiles();
    }
}

/**
 * Finds all source code files matching the configured pattern.
 * Used as a fallback when git diff fails.
 * @returns {Promise<string[]>} A list of all source file paths.
 */
async function getAllSourceFiles() {
    console.log(`Searching for all files matching: ${SOURCE_CODE_PATTERN}`);
    const files = await require('glob').glob(SOURCE_CODE_PATTERN);
    return files;
}

/**
 * Extracts exported functions from a JavaScript file using an AST.
 * @param {string} filePath The path to the JavaScript file.
 * @returns {Promise<{name: string, code: string}[]>} An array of objects with function name and source code.
 */
async function extractExportedFunctions(filePath) {
    const code = await fs.readFile(filePath, 'utf-8');
    const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
    const exportedFunctions = [];

    ast.program.body.forEach(node => {
        if (node.type === 'ExportNamedDeclaration' && node.declaration && node.declaration.type === 'FunctionDeclaration') {
            const func = node.declaration;
            const functionName = func.id.name;
            const functionCode = code.substring(func.start, func.end);
            exportedFunctions.push({ name: functionName, code: functionCode });
        }
    });

    return exportedFunctions;
}


/**
 * Creates a detailed prompt for the AI to generate documentation.
 * @param {string} functionName The name of the function.
 * @param {string} functionCode The source code of the function.
 * @returns {string} The formatted prompt.
 */
function createDocumentationPrompt(functionName, functionCode) {
    return `
    You are an expert technical writer. Your task is to generate clear, concise, and user-friendly documentation in Markdown format for the given JavaScript function.

    **Function Name:** \`${functionName}\`
    
    **Function Source Code:**
    \`\`\`javascript
    ${functionCode}
    \`\`\`

    **Instructions:**
    1.  **Description:** Write a brief, one-paragraph description of what the function does.
    2.  **Parameters:** List each parameter in a table with columns for "Parameter", "Type", and "Description". Infer the type if not explicit.
    3.  **Returns:** Describe what the function returns.
    4.  **Example Usage:** Provide a clear, simple code block showing how to use the function.

    Generate only the Markdown content for the documentation. Do not include any headers like "Here is the documentation".
    `;
}

/**
 * Updates the documentation file with the newly generated content.
 * @param {string} functionName The name of the function being documented.
 * @param {string} newDocsContent The AI-generated Markdown content.
 */
async function updateDocsFile(functionName, newDocsContent) {
    const startMarker = `<!-- DOCS:START:${functionName} -->`;
    const endMarker = `<!-- DOCS:END:${functionName} -->`;

    let fileContent = await fs.readFile(DOCS_FILE, 'utf-8');

    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        console.warn(`Warning: Documentation markers for "${functionName}" not found in ${DOCS_FILE}. Skipping.`);
        return;
    }

    const contentBefore = fileContent.substring(0, startIndex + startMarker.length);
    const contentAfter = fileContent.substring(endIndex);
    
    const finalContent = `${contentBefore}\n${newDocsContent}\n${contentAfter}`;

    await fs.writeFile(DOCS_FILE, finalContent, 'utf-8');
    console.log(`Successfully updated documentation for "${functionName}".`);
}


/**
 * Main function to run the documentation agent.
 */
async function main() {
    console.log("Living Documentation Agent started...");
    try {
        const changedFiles = await getChangedFiles();

        if (changedFiles.length === 0) {
            console.log("No relevant source files changed. Exiting.");
            return;
        }

        console.log("Changed files:", changedFiles);

        for (const file of changedFiles) {
            const functions = await extractExportedFunctions(file);
            for (const func of functions) {
                console.log(`Found changed/new function: "${func.name}" in ${file}`);
                const prompt = createDocumentationPrompt(func.name, func.code);
                const newDocs = await generateWithGemini(prompt);
                await updateDocsFile(func.name, newDocs);
            }
        }
    } catch (error) {
        console.error("The agent encountered a fatal error:", error.message);
        process.exit(1); // Exit with a non-zero code to fail the GitHub Action
    }

    console.log("Living Documentation Agent finished.");
}

main();

