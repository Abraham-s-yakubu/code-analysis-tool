# Code Analysis Tool

A Node.js-based code analysis tool that uses Abstract Syntax Tree (AST) parsing to analyze JavaScript codebases.

## Features

- JavaScript code parsing using Babel parser
- AST-based function detection (more reliable than regex)
- File discovery using glob patterns
- Git integration for version control operations
- Environment variable support for API keys

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

## Installation

```bash
npm install
```

## Dependencies

- `@babel/parser`: JavaScript parser for creating Abstract Syntax Trees
- `glob`: File pattern matching utility
- `simple-git`: Lightweight Git wrapper
- `dotenv`: Environment variable management

## Usage

```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory with your configuration:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Project Structure

```
code-analysis-tool/
├── scripts/
│   └── doc-agent.js    # Living documentation agent
├── src/
│   ├── parser.js       # AST parsing logic
│   ├── analyzer.js     # Code analysis functions
│   └── sample.js       # Sample code for testing
├── .github/
│   └── workflows/
│       └── living_docs.yml  # GitHub Actions workflow
├── .env                # Environment variables
├── .gitignore         # Git ignore rules
├── package.json       # Project configuration
└── README.md          # This file
```

## Living Documentation

This project features an automated living documentation system that:
- 🔍 Analyzes code changes automatically via GitHub Actions
- 🤖 Generates AI-powered documentation using Google's Gemini API
- 📚 Updates this README with function documentation
- 🚀 Runs on every push to keep docs current

### Sample Function Documentation

<!-- DOCS:START:calculateArea -->
*Documentation will be auto-generated here*
<!-- DOCS:END:calculateArea -->

<!-- DOCS:START:formatUserName -->
*Documentation will be auto-generated here*
<!-- DOCS:END:formatUserName -->

<!-- DOCS:START:fetchUserData -->
*Documentation will be auto-generated here*
<!-- DOCS:END:fetchUserData -->

## License

ISC
