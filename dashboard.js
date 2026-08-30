document.addEventListener("DOMContentLoaded", () => {
    const semesters = [
        { key: "sem1", name: "Semester 1", link: "sem1.html" },
        { key: "sem2", name: "Semester 2", link: "sem2.html" },
        { key: "sem3", name: "Semester 3", link: "sem3.html" },
        { key: "sem4", name: "Semester 4", link: "sem4.html" },
        { key: "sem5", name: "Semester 5", link: "index.html" },
        { key: "sem6", name: "Semester 6", link: "sem6.html", upcoming: true }
    ];

    let overallEarnedPoints = 0;
    let overallCredits = 0;
    let overallObtainedMarks = 0;
    let overallMaxMarks = 0;

    const tbody = document.getElementById("dashboard-tbody");

    semesters.forEach(sem => {
        const tr = document.createElement("tr");
        
        const dataStr = localStorage.getItem(sem.key + "_data");
        if (dataStr) {
            const data = JSON.parse(dataStr);
            
            // Add to cumulatives
            overallEarnedPoints += data.earnedPoints;
            overallCredits += data.totalCredits;
            overallObtainedMarks += data.grandTotalObtained;
            overallMaxMarks += data.grandTotalMax;

            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-main);"><a href="${sem.link}" style="color: inherit; text-decoration: none;">${sem.name}</a></td>
                <td>${data.totalCredits}</td>
                <td style="color: var(--primary-color); font-weight: bold;">${data.sgpa.toFixed(2)}</td>
                <td>${data.percentage.toFixed(2)}%</td>
                <td><span class="status-badge status-complete">Completed</span></td>
                <td class="text-center">
                    <button class="delete-sem-btn" onclick="openDeleteModal('${sem.key}')" title="Delete ${sem.name}">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>
            `;
        } else if (sem.upcoming) {
            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-main);"><a href="${sem.link}" style="color: inherit; text-decoration: none;">${sem.name}</a></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><span class="status-badge status-upcoming" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2);">Coming Soon</span></td>
                <td></td>
            `;
        } else {
            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-main);"><a href="${sem.link}" style="color: inherit; text-decoration: none;">${sem.name}</a></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><span class="status-badge status-missing">No Data</span></td>
                <td></td>
            `;
        }

        tbody.appendChild(tr);
    });

    // ==========================================
    // BACKUP & SYNC (IMPORT / EXPORT)
    // ==========================================
    const exportBtn = document.getElementById("export-btn");
    const importTriggerBtn = document.getElementById("import-trigger-btn");
    const importFileInput = document.getElementById("import-file");
    const lastBackupText = document.getElementById("last-backup-text");
    const importModal = document.getElementById("import-modal");
    const importPreviewList = document.getElementById("import-preview-list");
    const confirmImportBtn = document.getElementById("confirm-import-btn");
    
    let pendingImportData = null;

    // Update Last Backup Text
    function updateLastBackupText() {
        const lastBackup = localStorage.getItem("cgpa_last_backup");
        if (lastBackup && lastBackupText) {
            lastBackupText.textContent = `Last backup: ${lastBackup}`;
        } else if (lastBackupText) {
            lastBackupText.textContent = "No backups made yet on this device.";
        }
    }
    updateLastBackupText();

    // Export Logic
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            const dataToExport = {
                app: "CGPA_Calculator",
                version: "1.0",
                timestamp: Date.now(),
                semesters: {}
            };
            
            let hasData = false;
            semesters.forEach(sem => {
                const dataStr = localStorage.getItem(sem.key + "_data");
                if (dataStr) {
                    try {
                        // Parse and re-stringify to ensure valid JSON and strip junk
                        dataToExport.semesters[sem.key] = JSON.parse(dataStr);
                        hasData = true;
                    } catch (e) {
                        console.error("Corrupted local data for " + sem.key);
                    }
                }
            });

            if (!hasData) {
                showToast("No data to export!", "error");
                return;
            }

            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `CGPA-Calculator-Backup-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const todayStr = `Today, ${timeStr}`;
            localStorage.setItem("cgpa_last_backup", todayStr);
            updateLastBackupText();
            showToast("Backup exported successfully!", "success");
        });
    }

    // Import Trigger
    if (importTriggerBtn && importFileInput) {
        importTriggerBtn.addEventListener("click", () => {
            importFileInput.click();
        });
        
        importFileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    // Safe parsing
                    const parsedData = JSON.parse(event.target.result);
                    
                    // Validation
                    if (!parsedData || parsedData.app !== "CGPA_Calculator" || !parsedData.semesters) {
                        throw new Error("Invalid or incompatible backup file.");
                    }
                    
                    pendingImportData = parsedData.semesters;
                    
                    // Build preview
                    let previewHTML = "";
                    let foundCount = 0;
                    for (const [key, value] of Object.entries(pendingImportData)) {
                        // Ensure key is a valid sem array key
                        const semObj = semesters.find(s => s.key === key);
                        if (semObj) {
                            previewHTML += `<div style="margin-bottom: 4px;">✅ ${semObj.name}</div>`;
                            foundCount++;
                        }
                    }
                    
                    if (foundCount === 0) {
                        throw new Error("No valid semester data found in backup.");
                    }
                    
                    importPreviewList.innerHTML = previewHTML;
                    importModal.style.display = "flex";
                    setTimeout(() => importModal.classList.add("active"), 10);
                    
                } catch (error) {
                    showToast(error.message || "Failed to read backup file.", "error");
                }
                importFileInput.value = ""; // Reset input
            };
            reader.readAsText(file);
        });
    }
    
    window.closeImportModal = function() {
        if (importModal) {
            importModal.classList.remove('active');
            setTimeout(() => { importModal.style.display = 'none'; }, 300);
            pendingImportData = null;
        }
    };
    
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener("click", () => {
            if (!pendingImportData) return;
            
            // 1. Create safety auto-backup of current data
            const currentBackup = {};
            semesters.forEach(sem => {
                const data = localStorage.getItem(sem.key + "_data");
                if (data) currentBackup[sem.key] = data;
            });
            if (Object.keys(currentBackup).length > 0) {
                localStorage.setItem("cgpa_safety_backup", JSON.stringify(currentBackup));
            }
            
            // 2. Overwrite data safely
            try {
                for (const [key, value] of Object.entries(pendingImportData)) {
                    if (semesters.find(s => s.key === key)) {
                        // Re-stringify parsed data to ensure it remains pure JSON without prototype injection
                        localStorage.setItem(key + "_data", JSON.stringify(value));
                    }
                }
                
                closeImportModal();
                showToast("Data imported successfully!", "success");
                
                // Reload dashboard
                setTimeout(() => window.location.reload(), 1000);
            } catch(e) {
                showToast("Error importing data.", "error");
            }
        });
    }


    // Update Top Level Cards
    if (overallCredits > 0) {
        const cgpa = overallEarnedPoints / overallCredits;
        document.getElementById("dash-cgpa").textContent = cgpa.toFixed(2);
    } else {
        document.getElementById("dash-cgpa").textContent = "0.00";
    }

    if (overallMaxMarks > 0) {
        const perc = (overallObtainedMarks / overallMaxMarks) * 100;
        document.getElementById("dash-perc").textContent = perc.toFixed(1) + "%";
        
        // Animate Ring
        const circle = document.querySelector('.progress-ring__circle');
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (perc / 100) * circumference;
            
            // Trigger reflow then animate
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, 100);
        }
    } else {
        document.getElementById("dash-perc").textContent = "0.0%";
        const circle = document.querySelector('.progress-ring__circle');
        if(circle) circle.style.strokeDashoffset = 301.59; // reset ring
    }

    document.getElementById("dash-credits").textContent = overallCredits;

    // Feature: Reset Data
    document.getElementById("reset-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all saved semester data? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Professional Toast Notification Function
    function showToast(message, type="error") {
        let toast = document.getElementById("pro-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "pro-toast";
            toast.className = "no-print";
            document.body.appendChild(toast);
        }
        
        toast.style.position = "fixed";
        toast.style.bottom = "24px";
        toast.style.right = "24px";
        toast.style.padding = "14px 24px";
        toast.style.borderRadius = "12px";
        toast.style.color = "#fff";
        toast.style.fontWeight = "600";
        toast.style.fontSize = "0.95rem";
        toast.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.2)";
        toast.style.transform = "translateY(150px) scale(0.9)";
        toast.style.opacity = "0";
        toast.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease";
        toast.style.zIndex = "9999";
        
        if (type === "error") {
            toast.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            toast.innerHTML = `⚠️ &nbsp; ${message}`;
        } else {
            toast.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
            toast.innerHTML = `✅ &nbsp; ${message}`;
        }
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = "translateY(0) scale(1)";
            toast.style.opacity = "1";
        }, 10);
        
        // Animate out
        setTimeout(() => {
            toast.style.transform = "translateY(150px) scale(0.9)";
            toast.style.opacity = "0";
        }, 3500);
    }

    // Feature: Print PDF
    const printBtn = document.getElementById("print-btn");
    
    // Visually disable button if no data
    if (overallCredits === 0) {
        printBtn.style.opacity = "0.5";
        printBtn.style.cursor = "not-allowed";
    }

    printBtn.addEventListener("click", () => {
        if (overallCredits === 0) {
            showToast("No data available! Save at least one semester to generate a report.", "error");
            return;
        }
        showToast("Generating professional report...", "success");
        setTimeout(() => {
            window.print();
        }, 800);
    });

    // Feature: Predictor Logic
    const targetInput = document.getElementById("target-cgpa");
    const totalCreditsInput = document.getElementById("total-credits-input");
    const predResult = document.getElementById("predictor-result");
    
    // Empty State Toggle
    if (overallCredits === 0) {
        document.getElementById("dashboard-table-element").style.display = "none";
        document.getElementById("empty-state-container").style.display = "block";
    }
    
    // Visually disable Predictor if no data (Professional Toast Version)
    if (overallCredits === 0) {
        // Use readOnly instead of disabled so we can still catch click events!
        targetInput.readOnly = true;
        totalCreditsInput.readOnly = true;
        
        targetInput.style.opacity = "0.6";
        totalCreditsInput.style.opacity = "0.6";
        targetInput.style.cursor = "not-allowed";
        totalCreditsInput.style.cursor = "not-allowed";
        
        predResult.textContent = ""; // Clear helper text
        
        // Show the professional toast when they click the locked inputs
        const showPredictorToast = (e) => {
            e.preventDefault();
            e.target.blur(); // instantly drop focus so mobile keyboard doesn't pop up
            showToast("Predictor locked! Save at least one semester to calculate targets.", "error");
        };
        
        targetInput.addEventListener("click", showPredictorToast);
        targetInput.addEventListener("focus", showPredictorToast);
        
        totalCreditsInput.addEventListener("click", showPredictorToast);
        totalCreditsInput.addEventListener("focus", showPredictorToast);
    }

    function calculatePrediction() {
        const targetCGPA = parseFloat(targetInput.value);
        const totalDegreeCredits = parseFloat(totalCreditsInput.value);

        if (!targetCGPA || !totalDegreeCredits || overallCredits === 0) {
            predResult.textContent = "";
            return;
        }

        const remainingCredits = totalDegreeCredits - overallCredits;
        
        if (remainingCredits <= 0) {
            predResult.textContent = "You have already completed all credits!";
            predResult.style.color = "var(--text-muted)";
            return;
        }

        const targetPoints = targetCGPA * totalDegreeCredits;
        const requiredPoints = targetPoints - overallEarnedPoints;
        const requiredSGPA = requiredPoints / remainingCredits;

        if (requiredSGPA > 10) {
            predResult.textContent = `Mathematically impossible. You'd need an average SGPA of ${requiredSGPA.toFixed(2)}.`;
            predResult.style.color = "var(--danger-color)";
        } else if (requiredSGPA <= 0) {
            predResult.textContent = `You've already secured this! Even with a 0 SGPA, your CGPA will stay above ${targetCGPA.toFixed(2)}.`;
            predResult.style.color = "var(--success-color)";
        } else {
            predResult.textContent = `You need an average SGPA of ${requiredSGPA.toFixed(2)} in your remaining ${remainingCredits} credits.`;
            predResult.style.color = "var(--primary-color)";
        }
    }

    targetInput.addEventListener("input", calculatePrediction);
    totalCreditsInput.addEventListener("input", calculatePrediction);

    // Feature: Chart.js Trajectory
    const ctx = document.getElementById('sgpaChart');
    if (ctx) {
        const labels = [];
        const dataPoints = [];

        semesters.forEach(sem => {
            const dataStr = localStorage.getItem(sem.key + "_data");
            if (dataStr) {
                const data = JSON.parse(dataStr);
                labels.push(sem.name);
                dataPoints.push(data.sgpa.toFixed(2));
            }
        });

        if (labels.length > 0) {
            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'SGPA',
                        data: dataPoints,
                        borderColor: '#a8c7fa',
                        backgroundColor: 'rgba(168, 199, 250, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: '#8ab4f8',
                        pointRadius: 5,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 4, max: 10, ticks: { color: '#9aa0a6' } },
                        x: { ticks: { color: '#9aa0a6' } }
                    }
                }
            });
        } else {
            ctx.parentElement.style.display = 'none';
        }
    }

});
// Custom Modal Delete Logic
let semesterToDelete = null;

window.openDeleteModal = function(semKey) {
    semesterToDelete = semKey;
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex';
    // Small delay to allow display:flex to apply before opacity transition
    setTimeout(() => modal.classList.add('active'), 10);
};

window.closeDeleteModal = function() {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300); // match transition duration
    semesterToDelete = null;
};

document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirm-delete-btn');
    if(confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if(semesterToDelete) {
                localStorage.removeItem(`${semesterToDelete}_data`);
                sessionStorage.setItem('toastMessage', `Semester data deleted.`);
                location.reload();
            }
        });
    }
});

// Check if we need to show a toast from a page reload (after deletion)
window.addEventListener('DOMContentLoaded', () => {
    const msg = sessionStorage.getItem('toastMessage');
    if(msg) {
        // Wait a tiny bit for UI to settle
        setTimeout(() => showToast(msg, 'success'), 300);
        sessionStorage.removeItem('toastMessage');
    }
});
