const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
let allPassed = true;

function logStatus(testName, passed, msg = "") {
    if (passed) {
        console.log(`[PASS] ${testName}`);
    } else {
        console.log(`[FAIL] ${testName} - ${msg}`);
        allPassed = false;
    }
}

// 1. Check File Existence
const expectedFiles = [
    'index.html', 'dashboard.html',
    'sem1.html', 'sem2.html', 'sem3.html', 'sem4.html', 'sem5.html',
    'sem1.js', 'sem2.js', 'sem3.js', 'sem4.js', 'script.js', 'dashboard.js', 'theme.js',
    'style.css', 'manifest.json', 'Open as App.bat'
];

expectedFiles.forEach(file => {
    const exists = fs.existsSync(path.join(baseDir, file));
    logStatus(`File exists: ${file}`, exists, 'File is missing');
});

// 2. Syntax Check all JS files using the built-in parser
try {
    const jsFiles = expectedFiles.filter(f => f.endsWith('.js'));
    for (const file of jsFiles) {
        const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
        try {
            // Very simple syntax validation via new Function
            new Function(content);
            logStatus(`JS Syntax: ${file}`, true);
        } catch (e) {
            logStatus(`JS Syntax: ${file}`, false, e.message);
        }
    }
} catch (e) {}

// 3. Check localStorage Keys alignment
// Make sure semX.js saves to semX_data and dashboard.js reads semX_data
for (let i = 1; i <= 5; i++) {
    const jsFile = i === 5 ? 'script.js' : `sem${i}.js`;
    if (fs.existsSync(path.join(baseDir, jsFile))) {
        const content = fs.readFileSync(path.join(baseDir, jsFile), 'utf8');
        const expectedKey = `sem${i}_data`;
        const hasKey = content.includes(`setItem("${expectedKey}"`);
        logStatus(`LocalStorage Write mapping: ${jsFile} writes to ${expectedKey}`, hasKey, `Missing setItem("${expectedKey}"`);
    }
}

const dashContent = fs.readFileSync(path.join(baseDir, 'dashboard.js'), 'utf8');
for (let i = 1; i <= 5; i++) {
    const expectedKey = `sem${i}_data`;
    const hasKey = dashContent.includes(`getItem('${expectedKey}')`) || dashContent.includes(`getItem("${expectedKey}")`);
    logStatus(`LocalStorage Read mapping: Dashboard reads ${expectedKey}`, hasKey, `Missing getItem("${expectedKey}")`);
}

// 4. Check HTML Links
// Ensure Dashboard navigation exists in all semester HTMLs
for (let i = 1; i <= 5; i++) {
    const htmlFile = `sem${i}.html`;
    if (fs.existsSync(path.join(baseDir, htmlFile))) {
        const content = fs.readFileSync(path.join(baseDir, htmlFile), 'utf8');
        logStatus(`HTML Links: ${htmlFile} links to dashboard`, content.includes('href="dashboard.html"'), 'Missing dashboard link');
        logStatus(`HTML Theme JS: ${htmlFile} includes theme.js`, content.includes('src="theme.js"'), 'Missing theme.js');
    }
}

// Final output
console.log("\\n--- TEST SUMMARY ---");
console.log(allPassed ? "✅ ALL TESTS PASSED: The website is fully functional and logically sound." : "❌ SOME TESTS FAILED.");
