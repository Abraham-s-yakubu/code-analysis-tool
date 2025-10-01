/**
 * JavaScript Parser Module
 * Uses Babel parser to create Abstract Syntax Trees for code analysis
 */

const { parse } = require('@babel/parser');
const fs = require('fs').promises;

/**
 * Parse JavaScript code and extract functions using AST
 * @param {string} code - The JavaScript code to parse
 * @returns {Array} Array of function information objects
 */
function extractFunctions(code) {
    try {
        const ast = parse(code, {
            sourceType: 'module',
            allowImportExportEverywhere: true,
            allowAwaitOutsideFunction: true,
            allowReturnOutsideFunction: true,
            plugins: [
                'jsx',
                'typescript',
                'decorators-legacy',
                'classProperties',
                'dynamicImport',
                'exportDefaultFrom',
                'exportNamespaceFrom',
                'functionBind',
                'nullishCoalescingOperator',
                'objectRestSpread',
                'optionalCatchBinding',
                'optionalChaining'
            ]
        });

        const functions = [];

        function traverse(node) {
            if (node && typeof node === 'object') {
                // Function declarations
                if (node.type === 'FunctionDeclaration') {
                    functions.push({
                        type: 'function',
                        name: node.id ? node.id.name : 'anonymous',
                        line: node.loc ? node.loc.start.line : null,
                        async: node.async,
                        generator: node.generator,
                        params: node.params.length
                    });
                }
                
                // Arrow functions and function expressions
                if (node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
                    functions.push({
                        type: node.type === 'ArrowFunctionExpression' ? 'arrow' : 'expression',
                        name: 'anonymous',
                        line: node.loc ? node.loc.start.line : null,
                        async: node.async,
                        generator: node.generator,
                        params: node.params.length
                    });
                }

                // Method definitions in classes
                if (node.type === 'MethodDefinition') {
                    functions.push({
                        type: 'method',
                        name: node.key.name || 'computed',
                        line: node.loc ? node.loc.start.line : null,
                        async: node.value.async,
                        generator: node.value.generator,
                        params: node.value.params.length,
                        kind: node.kind // 'method', 'constructor', 'get', 'set'
                    });
                }

                // Recursively traverse all child nodes
                for (const key in node) {
                    if (node[key] && typeof node[key] === 'object') {
                        if (Array.isArray(node[key])) {
                            node[key].forEach(traverse);
                        } else {
                            traverse(node[key]);
                        }
                    }
                }
            }
        }

        traverse(ast);
        return functions;

    } catch (error) {
        console.warn(`Parse error: ${error.message}`);
        return [];
    }
}

/**
 * Parse a JavaScript file and extract function information
 * @param {string} filePath - Path to the JavaScript file
 * @returns {Object} Object containing file info and functions
 */
async function parseFile(filePath) {
    try {
        const code = await fs.readFile(filePath, 'utf8');
        const functions = extractFunctions(code);
        
        return {
            filePath,
            functions,
            functionCount: functions.length,
            lineCount: code.split('\n').length,
            size: code.length
        };
    } catch (error) {
        console.warn(`Error reading file ${filePath}: ${error.message}`);
        return {
            filePath,
            functions: [],
            functionCount: 0,
            lineCount: 0,
            size: 0,
            error: error.message
        };
    }
}

module.exports = {
    extractFunctions,
    parseFile
};