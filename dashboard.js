document.addEventListener("DOMContentLoaded", () => {
    const semesters = [
        { key: "sem1", name: "Semester 1", link: "sem1.html" },
        { key: "sem2", name: "Semester 2", link: "sem2.html" },
        { key: "sem3", name: "Semester 3", link: "sem3.html" },
        { key: "sem4", name: "Semester 4", link: "sem4.html" },
        { key: "sem5", name: "Semester 5", link: "index.html" }
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
            `;
        } else {
            tr.innerHTML = `
                <td style="font-weight: 600; color: var(--text-main);"><a href="${sem.link}" style="color: inherit; text-decoration: none;">${sem.name}</a></td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td><span class="status-badge status-missing">No Data</span></td>
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
        document.getElementById("dash-perc").textContent = perc.toFixed(2) + "%";
    } else {
        document.getElementById("dash-perc").textContent = "0.00%";
    }

    document.getElementById("dash-credits").textContent = overallCredits;

    // Feature: Reset Data
    document.getElementById("reset-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all saved semester data? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Feature: Print PDF
    document.getElementById("print-btn").addEventListener("click", () => {
        window.print();
    });

    // Feature: Predictor Logic
    const targetInput = document.getElementById("target-cgpa");
    const totalCreditsInput = document.getElementById("total-credits-input");
    const predResult = document.getElementById("predictor-result");

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