const subjects = [
    {
        name: "Software Engineering", type: "Theory", credits: 3,
        components: [{key: "cia", label: "CIA", max: 40}, {key: "see", label: "SEE", max: 60}],
        checkPass: (v) => (v.cia >= 16) && (v.see >= 24)
    },
    {
        name: "Software Engineering", type: "Lab", credits: 1,
        components: [{key: "tw", label: "Term Work", max: 25}, {key: "pr", label: "Pract/Oral", max: 25}],
        checkPass: (v) => (v.tw >= 10) && (v.pr >= 10)
    },
    {
        name: "Computer Network", type: "Theory", credits: 3,
        components: [{key: "cia", label: "CIA", max: 40}, {key: "see", label: "SEE", max: 60}],
        checkPass: (v) => (v.cia >= 16) && (v.see >= 24)
    },
    {
        name: "Computer Network", type: "Lab", credits: 1,
        components: [{key: "tw", label: "Term Work", max: 25}, {key: "pr", label: "Pract/Oral", max: 25}],
        checkPass: (v) => (v.tw >= 10) && (v.pr >= 10)
    },
    {
        name: "AI & Soft Computing", type: "Theory", credits: 3,
        components: [{key: "cia", label: "CIA", max: 40}, {key: "see", label: "SEE", max: 60}],
        checkPass: (v) => (v.cia >= 16) && (v.see >= 24)
    },
    {
        name: "AI & Soft Computing", type: "Lab", credits: 1,
        components: [{key: "tw", label: "Term Work", max: 25}, {key: "pr", label: "Pract/Oral", max: 25}],
        checkPass: (v) => (v.tw >= 10) && (v.pr >= 10)
    },
    {
        name: "Datawarehousing & Mining", type: "Theory", credits: 3,
        components: [{key: "cia", label: "CIA", max: 40}, {key: "see", label: "SEE", max: 60}],
        checkPass: (v) => (v.cia >= 16) && (v.see >= 24)
    },
    {
        name: "Datawarehousing & Mining", type: "Lab", credits: 1,
        components: [{key: "tw", label: "Term Work", max: 25}],
        checkPass: (v) => (v.tw >= 10)
    },
    {
        name: "Wireless & Mobile Comm", type: "Theory", credits: 3,
        components: [{key: "cia", label: "CIA", max: 40}, {key: "see", label: "SEE", max: 60}],
        checkPass: (v) => (v.cia >= 16) && (v.see >= 24)
    },
    {
        name: "Wireless & Mobile Comm", type: "Lab", credits: 1,
        components: [{key: "tw", label: "Term Work", max: 25}, {key: "pr", label: "Pract/Oral", max: 25}],
        checkPass: (v) => (v.tw >= 10) && (v.pr >= 10)
    },
    {
        name: "Cyber Digital Safety", type: "Theory", credits: 2,
        components: [{key: "cia", label: "CIA", max: 20}, {key: "see", label: "SEE", max: 30}],
        checkPass: (v) => (v.cia >= 8) && (v.see >= 12)
    },
    {
        name: "Indian Knowledge System", type: "Theory", credits: 2,
        components: [{key: "tw", label: "Term Work", max: 50}],
        checkPass: (v) => (v.tw >= 20)
    }
];

function getGrade(percentage) {
    if (percentage >= 90) return { grade: "O", point: 10 };
    if (percentage >= 80) return { grade: "A+", point: 9 };
    if (percentage >= 70) return { grade: "A", point: 8 };
    if (percentage >= 60) return { grade: "B+", point: 7 };
    if (percentage >= 55) return { grade: "B", point: 6 };
    if (percentage >= 50) return { grade: "C", point: 5 };
    if (percentage >= 40) return { grade: "P", point: 4 };
    return { grade: "F", point: 0 };
}

const tbody = document.getElementById("subjects-body");

// Generate table rows dynamically
subjects.forEach((sub, index) => {
    const tr = document.createElement("tr");
    
    let inputsHtml = sub.components.map(comp => `
        <div class="mark-group">
            <label>${comp.label} (/${comp.max})</label>
            <input type="number" min="0" max="${comp.max}" data-key="${comp.key}" data-max="${comp.max}" class="mark-input">
        </div>
    `).join('');

    tr.innerHTML = `
        <td>
            <div class="subject-name">${sub.name}</div>
            <div class="subject-type">${sub.type}</div>
        </td>
        <td class="text-center"><strong>${sub.credits}</strong></td>
        <td>
            <div class="marks-entry">
                ${inputsHtml}
            </div>
        </td>
        <td class="text-center">
            <div class="row-total text-gray-500">-</div>
        </td>
        <td class="text-center">
            <div class="grade-badge" id="grade-${index}">-</div>
        </td>
    `;
    tbody.appendChild(tr);
});

// Calculate SGPA on input change
document.getElementById("cgpa-form").addEventListener("input", function() {
    window.hasGlobalRangeError = false;
    let totalCredits = 0;
    let earnedPoints = 0;
    let hasFailed = false;
    let grandTotalObtained = 0;
    let grandTotalMax = 0;
    let allSubjectsFilled = true;

    subjects.forEach((sub, index) => {
        const row = tbody.children[index];
        const inputs = row.querySelectorAll('.mark-input');
        
        let vals = {};
        let rowTotal = 0;
        let rowMax = 0;
        let isRowComplete = true;
        let hasRangeError = false;

        inputs.forEach(input => {
            

            if (input.value === "") {
                isRowComplete = false;
                input.style.border = "";
                input.style.backgroundColor = "";
            } else {
                let maxVal = parseFloat(input.dataset.max);
                let currentVal = parseFloat(input.value);
                if (currentVal > maxVal || currentVal < 0) {
                    hasRangeError = true;
                    window.hasGlobalRangeError = true;
                    input.style.border = "2px solid var(--danger-color)";
                    input.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    input.previousElementSibling.style.color = "var(--danger-color)";
                } else {
                    input.style.border = "";
                    input.style.backgroundColor = "";
                    input.previousElementSibling.style.color = "";
                }
            }
            const val = parseFloat(input.value) || 0;
            vals[input.dataset.key] = val;
            rowTotal += val;
            rowMax += parseFloat(input.dataset.max);
        });

        const totalDiv = row.querySelector('.row-total');
        const gradeDiv = row.querySelector('.grade-badge');

        if (hasRangeError) {
            allSubjectsFilled = false;
            totalDiv.textContent = "Out of Range";
            totalDiv.style.color = "var(--danger-color)";
            gradeDiv.textContent = "Err";
            gradeDiv.className = "grade-badge grade-F";
            return;
        }

        if (!isRowComplete) {
            gradeDiv.textContent = "-";
            gradeDiv.className = "grade-badge";
            allSubjectsFilled = false;

            // WHAT-IF EXAM PLANNER
            const emptyInputs = Array.from(inputs).filter(inp => inp.value === "");
            if (emptyInputs.length === 1 && !sub.excludeFromPercentage) {
                let missingInput = emptyInputs[0];
                let missingKey = missingInput.dataset.key;
                let missingMax = parseFloat(missingInput.dataset.max);
                
                let minToPass = -1;
                for (let i = 0; i <= missingMax; i++) {
                    vals[missingKey] = i;
                    if (sub.checkPass(vals)) {
                        minToPass = i;
                        break;
                    }
                }
                
                if (minToPass !== -1) {
                    let targetForA = Math.ceil(0.7 * rowMax) - rowTotal;
                    targetForA = Math.max(minToPass, targetForA);
                    
                    let label = missingInput.previousElementSibling.textContent.split(' ')[0];
                    let msg = `Need ${minToPass} in ${label} to Pass`;
                    if (targetForA <= missingMax) {
                        msg += `<br><span style="color:var(--success-color)">Need ${targetForA} for an 'A'</span>`;
                    }
                    totalDiv.innerHTML = msg;
                    totalDiv.style.fontSize = "0.75rem";
                    totalDiv.style.lineHeight = "1.2";
                    totalDiv.style.color = "var(--primary-color)";
                } else {
                    totalDiv.textContent = "Fail (Internal too low)";
                    totalDiv.style.fontSize = "0.75rem";
                    totalDiv.style.color = "var(--danger-color)";
                }
            } else {
                totalDiv.textContent = "-";
                totalDiv.style.fontSize = "inherit";
                totalDiv.style.color = "var(--text-muted)";
            }
            return;
        }

        totalDiv.style.fontSize = "inherit";
        totalDiv.style.color = "var(--text-main)";
        totalDiv.textContent = `${rowTotal} / ${rowMax}`;

        let passed = sub.checkPass(vals);
        let percentage = (rowTotal / rowMax) * 100;
        
        let gradeInfo;
        if (!passed) {
            gradeInfo = { grade: "F", point: 0 };
        } else {
            gradeInfo = getGrade(percentage);
        }

        gradeDiv.textContent = gradeInfo.grade;
        gradeDiv.className = 'grade-badge grade-' + gradeInfo.grade.replace('+', '-plus');

        totalCredits += sub.credits;
        earnedPoints += (sub.credits * gradeInfo.point);

        if (!sub.excludeFromPercentage) {
            grandTotalObtained += rowTotal;
            grandTotalMax += rowMax;
        }
        
        if (gradeInfo.grade === "F") {
            hasFailed = true;
        }
    });

    const sgpaResult = document.getElementById("sgpa-result");
    const gradeRemark = document.getElementById("grade-remark");
    const percentageResult = document.getElementById("percentage-result");

    if (totalCredits === 0) {
        sgpaResult.textContent = "0.00";
        if (percentageResult) percentageResult.textContent = "0.00%";
        gradeRemark.textContent = "Enter your marks above to see your SGPA.";
        gradeRemark.style.color = "var(--text-muted)";
        return;
    }

    const sgpa = earnedPoints / totalCredits;
    sgpaResult.textContent = sgpa.toFixed(2);

    let perc = grandTotalMax > 0 ? (grandTotalObtained / grandTotalMax) * 100 : 0;
    if (percentageResult) percentageResult.textContent = perc.toFixed(2) + "%";
    
    if (hasFailed) {
        gradeRemark.textContent = "You failed in one or more components (ATKT).";
        gradeRemark.style.color = "var(--danger-color)";
        sgpaResult.style.color = "var(--danger-color)";
    } else {
        sgpaResult.style.color = "var(--primary-color)";
        if (sgpa >= 9) {
            gradeRemark.textContent = "Outstanding performance! You passed with flying colors!";
            gradeRemark.style.color = "var(--success-color)";
        } else if (sgpa >= 7) {
            gradeRemark.textContent = "Great job, you passed securely!";
            gradeRemark.style.color = "var(--success-color)";
        } else {
            gradeRemark.textContent = "You passed!";
            gradeRemark.style.color = "var(--primary-color)";
        }
    }

    
    // We update a global state object
    if (totalCredits > 0 && !hasFailed && allSubjectsFilled) {
        window.currentSemData = {
            totalCredits: totalCredits,
            earnedPoints: earnedPoints,
            grandTotalObtained: grandTotalObtained,
            grandTotalMax: grandTotalMax,
            sgpa: sgpa,
            percentage: perc
        };
    } else {
        window.currentSemData = null;
    }
});

// Save Button Logic
const saveBtn = document.getElementById("save-to-dashboard-btn");
if (saveBtn) {
    saveBtn.addEventListener("click", () => {
        if (window.currentSemData) {
            localStorage.setItem("sem5_data", JSON.stringify(window.currentSemData));
            
            // Visual feedback
            const originalText = saveBtn.textContent;
            saveBtn.textContent = "✅ Saved Successfully!";
            saveBtn.style.background = "#0f9d58";
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.style.background = "var(--success-color)";
            }, 2000);
            
        } else {
            alert("Please complete all subjects and ensure you have passed all components before saving to the Master Dashboard.");
        }
    });
}

// Allow pressing "Enter" to quickly move to the next input field for fast data entry
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.classList.contains('mark-input')) {
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('.mark-input'));
        const index = inputs.indexOf(e.target);
        if (index > -1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
            inputs[index + 1].select();
        }
    }
});

