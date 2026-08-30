const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log("\n🚀 Starting CGPA Calculator Test Suite...\n");

// Read the files we want to test
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const dashboardCode = fs.readFileSync(path.join(__dirname, 'dashboard.js'), 'utf8');

// Setup JSDOM
const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost" });
const window = dom.window;
const document = window.document;

// Mock localStorage and sessionStorage to prevent JSDOM errors
window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
window.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };
window.print = () => {};
window.confirm = () => true;

// We inject the script code manually
const scriptEl = document.createElement('script');
scriptEl.textContent = scriptCode;
document.body.appendChild(scriptEl);

const dashEl = document.createElement('script');
dashEl.textContent = dashboardCode;
document.body.appendChild(dashEl);

let passedCount = 0;
let failedCount = 0;

function runTest(name, testFn) {
    try {
        testFn();
        console.log(`✅ PASS: ${name}`);
        passedCount++;
    } catch (e) {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   ${e.message}`);
        failedCount++;
    }
}

function assertEqual(actual, expected, msg) {
    if (actual !== expected) {
        throw new Error(msg || `Expected ${expected}, but got ${actual}`);
    }
}

function assertClose(actual, expected, tolerance = 0.01, msg) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(msg || `Expected ${expected}, but got ${actual}`);
    }
}

// Allow time for DOM content to load and scripts to parse
setTimeout(() => {
    
    const getGrade = window.getGrade;
    
    // Core logic test implementations mirroring the app logic
    function testPredictorLogic(targetCGPA, totalDegreeCredits, currentEarnedPoints, currentCredits) {
        const targetPoints = targetCGPA * totalDegreeCredits;
        const remainingCredits = totalDegreeCredits - currentCredits;
        if (remainingCredits <= 0) return { possible: false, message: "No remaining credits" };
        const requiredSGPA = (targetPoints - currentEarnedPoints) / remainingCredits;
        if (requiredSGPA > 10) return { possible: false, required: requiredSGPA };
        if (requiredSGPA < 0) return { possible: true, required: 0 };
        return { possible: true, required: requiredSGPA };
    }
    
    function testSGPALogic(subjects) {
        let totalCredits = 0;
        let earnedPoints = 0;
        subjects.forEach(sub => {
            totalCredits += sub.credits;
            earnedPoints += (sub.credits * sub.point);
        });
        if (totalCredits === 0) return 0;
        return earnedPoints / totalCredits;
    }
    
    function testCGPALogic(semesters) {
        let totalCredits = 0;
        let earnedPoints = 0;
        semesters.forEach(sem => {
            totalCredits += sem.credits;
            earnedPoints += sem.points;
        });
        if (totalCredits === 0) return 0;
        return earnedPoints / totalCredits;
    }
    
    console.log("--- 1. Grade Boundaries ---");
    runTest("90 -> O -> 10", () => {
        const res = getGrade(90);
        assertEqual(res.grade, "O"); assertEqual(res.point, 10);
    });
    runTest("80 -> A+ -> 9", () => {
        const res = getGrade(80);
        assertEqual(res.grade, "A+"); assertEqual(res.point, 9);
    });
    runTest("70 -> A -> 8", () => {
        const res = getGrade(70);
        assertEqual(res.grade, "A"); assertEqual(res.point, 8);
    });
    runTest("60 -> B+ -> 7", () => {
        const res = getGrade(60);
        assertEqual(res.grade, "B+"); assertEqual(res.point, 7);
    });
    runTest("55 -> B -> 6", () => {
        const res = getGrade(55);
        assertEqual(res.grade, "B"); assertEqual(res.point, 6);
    });
    runTest("50 -> C -> 5", () => {
        const res = getGrade(50);
        assertEqual(res.grade, "C"); assertEqual(res.point, 5);
    });
    runTest("40 -> P -> 4", () => {
        const res = getGrade(40);
        assertEqual(res.grade, "P"); assertEqual(res.point, 4);
    });
    runTest("39.99 -> F -> 0", () => {
        const res = getGrade(39.99);
        assertEqual(res.grade, "F"); assertEqual(res.point, 0);
    });
    
    console.log("\n--- 2. SGPA Calculations ---");
    runTest("Multiple subjects with different credit values", () => {
        const sgpa = testSGPALogic([
            { credits: 3, point: 10 },
            { credits: 4, point: 8 },
            { credits: 2, point: 9 }
        ]);
        assertClose(sgpa, 8.888);
    });
    runTest("Zero credits handles division by zero safely", () => {
        const sgpa = testSGPALogic([]);
        assertEqual(sgpa, 0);
    });
    runTest("All subjects failed (F -> 0)", () => {
        const sgpa = testSGPALogic([{ credits: 3, point: 0 }, { credits: 4, point: 0 }]);
        assertEqual(sgpa, 0);
    });
    runTest("Mixed grades including decimals", () => {
        const sgpa = testSGPALogic([
            { credits: 3, point: getGrade(75.5).point },
            { credits: 2, point: getGrade(45.2).point }
        ]);
        assertClose(sgpa, 6.4);
    });

    console.log("\n--- 3. CGPA Calculations ---");
    runTest("One semester", () => {
        const cgpa = testCGPALogic([{ credits: 20, points: 180 }]);
        assertClose(cgpa, 9.0);
    });
    runTest("Multiple semesters with different credit loads", () => {
        const cgpa = testCGPALogic([{ credits: 20, points: 180 }, { credits: 24, points: 200 }]);
        assertClose(cgpa, 8.636);
    });
    runTest("Missing semester data handles cleanly", () => {
        const cgpa = testCGPALogic([{ credits: 20, points: 180 }, { credits: 0, points: 0 }]);
        assertClose(cgpa, 9.0);
    });

    console.log("\n--- 4. Target Predictor ---");
    runTest("Achievable target", () => {
        const res = testPredictorLogic(8.5, 160, 800, 100);
        assertEqual(res.possible, true);
        assertClose(res.required, 9.333);
    });
    runTest("Impossible target (> 10 required)", () => {
        const res = testPredictorLogic(9.5, 160, 800, 100);
        assertEqual(res.possible, false);
        assertEqual(res.required > 10, true);
    });
    runTest("Target already achieved (0 required)", () => {
        const res = testPredictorLogic(7.0, 160, 1200, 100);
        assertEqual(res.possible, true);
        assertEqual(res.required, 0);
    });
    runTest("Zero remaining credits", () => {
        const res = testPredictorLogic(8.0, 160, 1200, 160);
        assertEqual(res.possible, false);
        assertEqual(res.message, "No remaining credits");
    });
    runTest("Maximum possible CGPA calculation", () => {
        const res = testPredictorLogic(8.75, 160, 800, 100);
        assertEqual(res.possible, true);
        assertClose(res.required, 10);
    });

    console.log("\n--- 5. Input Validation (Edge Cases) ---");
    runTest("Blank / null input -> defaults to F (0)", () => {
        const res = getGrade(null);
        assertEqual(res.grade, "F");
    });
    runTest("Negative input -> defaults to F (0)", () => {
        const res = getGrade(-10);
        assertEqual(res.grade, "F");
    });
    runTest(">100 input -> handles gracefully", () => {
        const res = getGrade(105);
        assertEqual(res.grade, "O");
    });
    runTest("Letters / NaN input -> defaults to F (0)", () => {
        const res = getGrade(NaN);
        assertEqual(res.grade, "F");
    });
    runTest("Decimal boundaries exactly", () => {
        const res = getGrade(59.99);
        assertEqual(res.grade, "B");
        const res2 = getGrade(60.00);
        assertEqual(res2.grade, "B+");
    });
    runTest("Very large numbers (overflow prevention test)", () => {
        const res = getGrade(999999999);
        assertEqual(res.grade, "O");
    });

    console.log("\n=================================");
    console.log(`Total Tests: ${passedCount + failedCount}`);
    console.log(`Passed: ✅ ${passedCount}`);
    if (failedCount > 0) {
        console.log(`Failed: ❌ ${failedCount}`);
        process.exit(1);
    } else {
        console.log("All tests passed beautifully! 🎉\n");
        process.exit(0);
    }
}, 500);
