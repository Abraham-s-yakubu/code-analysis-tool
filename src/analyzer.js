/**
 * Code Analyzer Module
 * Orchestrates the analysis of JavaScript codebases using glob patterns and AST parsing
 */

const glob = require('glob');
const path = require('path');
const { parseFile } = require('./parser');

/**
 * Find JavaScript files in the current directory
 * @param {string} rootDir - Root directory to search (defaults to current directory)
 * @param {Array} patterns - Glob patterns to match files
 * @returns {Promise<Array>} Array of file paths
 */
async function findJavaScriptFiles(rootDir = process.cwd(), patterns = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx']) {
    const options = {
        cwd: rootDir,
        ignore: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            '.git/**',
            '**/*.min.js',
            '**/*.test.js',
            '**/*.spec.js'
        ]
    };

    const allFiles = [];
    
    for (const pattern of patterns) {
        try {
            const files = await new Promise((resolve, reject) => {
                glob(pattern, options, (err, matches) => {
                    if (err) reject(err);
                    else resolve(matches);
                });
            });
            allFiles.push(...files);
        } catch (error) {
            console.warn(`Error with pattern ${pattern}: ${error.message}`);
        }
    }

    // Remove duplicates and convert to absolute paths
    const uniqueFiles = [...new Set(allFiles)];
    return uniqueFiles.map(file => path.resolve(rootDir, file));
}

/**
 * Analyze multiple JavaScript files
 * @param {Array} filePaths - Array of file paths to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeFiles(filePaths) {
    const results = {
        files: [],
        summary: {
            totalFiles: filePaths.length,
            successfullyParsed: 0,
            totalFunctions: 0,
            totalLines: 0,
            totalSize: 0,
            errors: []
        }
    };

    console.log(`📄 Analyzing ${filePaths.length} files...`);

    for (const filePath of filePaths) {
        try {
            console.log(`   Parsing: ${path.basename(filePath)}`);
            const fileAnalysis = await parseFile(filePath);
            results.files.push(fileAnalysis);

            if (fileAnalysis.error) {
                results.summary.errors.push({
                    file: filePath,
                    error: fileAnalysis.error
                });
            } else {
                results.summary.successfullyParsed++;
                results.summary.totalFunctions += fileAnalysis.functionCount;
                results.summary.totalLines += fileAnalysis.lineCount;
                results.summary.totalSize += fileAnalysis.size;
            }
        } catch (error) {
            console.warn(`Failed to analyze ${filePath}: ${error.message}`);
            results.summary.errors.push({
                file: filePath,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Generate analysis report
 * @param {Object} analysisResults - Results from analyzeFiles
 * @returns {string} Formatted report
 */
function generateReport(analysisResults) {
    const { files, summary } = analysisResults;
    
    let report = '\\n=== CODE ANALYSIS REPORT ===\\n\\n';
    
    // Summary
    report += `📊 SUMMARY:\\n`;
    report += `   Total files: ${summary.totalFiles}\\n`;
    report += `   Successfully parsed: ${summary.successfullyParsed}\\n`;
    report += `   Total functions: ${summary.totalFunctions}\\n`;
    report += `   Total lines: ${summary.totalLines.toLocaleString()}\\n`;
    report += `   Total size: ${(summary.totalSize / 1024).toFixed(2)} KB\\n\\n`;
    
    // Function distribution
    report += `⚙️  FUNCTION BREAKDOWN:\\n`;
    const functionsByType = {};
    files.forEach(file => {
        file.functions.forEach(func => {
            functionsByType[func.type] = (functionsByType[func.type] || 0) + 1;
        });
    });
    
    Object.entries(functionsByType).forEach(([type, count]) => {
        report += `   ${type}: ${count}\\n`;
    });
    
    // Top files by function count
    report += `\\n📁 TOP FILES BY FUNCTION COUNT:\\n`;
    const sortedFiles = files
        .filter(f => !f.error)
        .sort((a, b) => b.functionCount - a.functionCount)
        .slice(0, 10);
        
    sortedFiles.forEach(file => {
        const relativePath = path.relative(process.cwd(), file.filePath);
        report += `   ${relativePath}: ${file.functionCount} functions\\n`;
    });
    
    // Errors
    if (summary.errors.length > 0) {
        report += `\\n❌ ERRORS (${summary.errors.length}):\\n`;
        summary.errors.forEach(error => {
            const relativePath = path.relative(process.cwd(), error.file);
            report += `   ${relativePath}: ${error.error}\\n`;
        });
    }
    
    return report;
}

/**
 * Main function to analyze a codebase
 * @param {string} rootDir - Root directory to analyze
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeCodebase(rootDir = process.cwd()) {
    try {
        console.log(`🔍 Searching for JavaScript files in: ${rootDir}`);
        
        const files = await findJavaScriptFiles(rootDir);
        console.log(`✅ Found ${files.length} JavaScript files`);
        
        if (files.length === 0) {
            console.log('ℹ️  No JavaScript files found to analyze');
            return { fileCount: 0, functionCount: 0 };
        }
        
        const results = await analyzeFiles(files);
        const report = generateReport(results);
        
        console.log(report);
        
        return {
            fileCount: results.summary.successfullyParsed,
            functionCount: results.summary.totalFunctions,
            results
        };
        
    } catch (error) {
        console.error('Analysis failed:', error.message);
        throw error;
    }
}

module.exports = {
    findJavaScriptFiles,
    analyzeFiles,
    generateReport,
    analyzeCodebase
};