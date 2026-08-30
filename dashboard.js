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
