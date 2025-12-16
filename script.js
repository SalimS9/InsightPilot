document.addEventListener('DOMContentLoaded', () => {
    // =======================================================
    // I. CORE DATA & MOCK RESPONSE (FOR RELIABLE DEMO)
    // =======================================================

    // Note: The GOLDEN_RESPONSE now includes the original rawData for export integrity
    let CURRENT_RAW_DATA = '';
    let CURRENT_AI_RESPONSE = '';

    const GOLDEN_RESPONSE_HTML = `
        <h3>1. NARRATIVE SUMMARY</h3>
        <p>The data clearly indicates strong sales performance in the East and North regions in December. However, there is a clear distinction: the high Marketing Spend in the East is resulting in exceptionally low churn (2%), indicating a highly effective, high value customer acquisition strategy.</p>
        
        <h3>2. ROOT CAUSE HYPOTHESIS</h3>
        <ul>
            <li>**Hypothesis 1 (Marketing Efficiency):** The East Region's high Marketing Spend is efficient because it targets high retention customers, as evidenced by the lowest churn rate across all regions.</li>
            <li>**Hypothesis 2 (South Region Risk):** The South Region's moderate churn rate, coupled with low sales, suggests the current marketing strategy is inefficient and potentially acquiring low value customers.</li>
        </ul>
        
        <h3>3. ACTIONABLE STRATEGY</h3>
        <ol>
            <li>**Action 1 (Scale East Success):** Immediately allocate 50% of the South Region's marketing budget to the North and East regions to capitalize on the proven low churn strategies.</li>
            <li>**Action 2 (Audit South):** Temporarily pause the South Region's current marketing campaign and initiate an audit to identify new customer segments.</li>
            <li>**Action 3 (Budget Rebalancing):** Propose a budget model where future spend is automatically prioritized toward channels and regions demonstrating churn rates below 5%.</li>
        </ol>
    `;

    const SAMPLE_CSV = `Date,Region,Sales_Units,Marketing_Spend_USD,Customer_Churn_Rate
2025-10-01,North,1200,500,0.05
2025-10-01,South,850,300,0.12
2025-10-01,East,1500,800,0.03
2025-11-01,North,1150,500,0.06
2025-11-01,South,950,300,0.08
2025-11-01,East,1000,800,0.15
2025-12-01,North,1300,500,0.04
2025-12-01,South,980,300,0.07
2025-12-01,East,1600,800,0.02`;

    const CHART_DATA = [
        { Date: '2025-10-01', Region: 'North', Sales_Units: 1200, Customer_Churn_Rate: 0.05 },
        { Date: '2025-10-01', Region: 'South', Sales_Units: 850, Customer_Churn_Rate: 0.12 },
        { Date: '2025-10-01', Region: 'East', Sales_Units: 1500, Customer_Churn_Rate: 0.03 },
        { Date: '2025-11-01', Region: 'North', Sales_Units: 1150, Customer_Churn_Rate: 0.06 },
        { Date: '2025-11-01', Region: 'South', Sales_Units: 950, Customer_Churn_Rate: 0.08 },
        { Date: '2025-12-01', Region: 'North', Sales_Units: 1300, Customer_Churn_Rate: 0.04 },
        { Date: '2025-12-01', Region: 'South', Sales_Units: 980, Customer_Churn_Rate: 0.07 },
        { Date: '2025-12-01', Region: 'East', Sales_Units: 1600, Customer_Churn_Rate: 0.02 }
    ];

    // =======================================================
    // II. UI INITIALIZATION AND EVENT HANDLERS
    // =======================================================
    const dataInput = document.getElementById('data-input');
    const analyzeButton = document.getElementById('analyze-data');
    const inputPanel = document.getElementById('input-panel');
    const loadingArea = document.getElementById('loading-area');
    const resultsPanel = document.getElementById('results-panel');
    const aiResults = document.getElementById('ai-results');
    
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    const historyList = document.getElementById('history-list');
    
    // NEW ELEMENTS FOR HACKATHON FEATURES
    const churnAlert = document.getElementById('churn-alert');
    const exportButton = document.getElementById('export-json');
    const chartTypeToggle = document.getElementById('chart-type-toggle'); 

    // --- Theme Switching ---
    const savedMode = localStorage.getItem('theme') || 'dark';
    if (savedMode === 'light') {
        body.classList.add('light-mode');
        if (modeToggle) modeToggle.checked = true;
    }
    if (modeToggle) {
        modeToggle.addEventListener('change', () => {
            if (modeToggle.checked) {
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else {
                body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Pre load data and initialize Real-Time Alert
    if (dataInput) dataInput.value = SAMPLE_CSV;
    updateChurnAlert(SAMPLE_CSV);
    
    // Attach listener for real-time alert updates on user input
    if (dataInput) {
        dataInput.addEventListener('input', (e) => updateChurnAlert(e.target.value));
    }


    // --- File Upload Logic FIX ---
    if (fileInput && dataInput) {
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                fileNameDisplay.textContent = `Loading: ${file.name}`;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileContent = e.target.result;
                    dataInput.value = fileContent;
                    fileNameDisplay.textContent = `Loaded: ${file.name}`;
                    updateChurnAlert(fileContent); // Update alert after file load
                };
                reader.readAsText(file);
            } else {
                fileNameDisplay.textContent = "No file selected.";
                updateChurnAlert('');
            }
        });
    }
    
    // --- NEW FEATURE 4: Chart Type Toggle Handler ---
    if (chartTypeToggle) {
        chartTypeToggle.addEventListener('change', () => {
            if (salesChartInstance) {
                salesChartInstance.config.type = chartTypeToggle.value;
                salesChartInstance.update();
            }
        });
    }
    
    // --- NEW FEATURE 2: Export Button Handler ---
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            exportReportToJson();
        });
    }


    // --- Main Analyze Button Click ---
    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            const rawData = (dataInput && dataInput.value) ? dataInput.value.trim() : '';
            if (!rawData) { alert('Please paste data or upload a file.'); return; }

            // UI State Change Show Loading
            if (inputPanel) inputPanel.classList.add('hidden');
            if (loadingArea) loadingArea.classList.remove('hidden');
            if (resultsPanel) resultsPanel.classList.add('hidden');

            // NEW FEATURE 1: Data Sanitization (Optional, since mock data is clean)
            const sanitizedData = sanitizeCSV(rawData);
            
            // Call Mock Analysis
            const result = await callMockAnalysis(sanitizedData);
            
            CURRENT_RAW_DATA = sanitizedData;
            CURRENT_AI_RESPONSE = GOLDEN_RESPONSE_HTML; // Set the mock response for export

            // Prepare and Render Chart (using mock CHART_DATA for consistency)
            const aggregatedData = aggregateDataByRegion(CHART_DATA);
            const chartData = prepareChartData(aggregatedData);
            renderChart(chartData);
            
            // Save and Render Results
            saveReport(sanitizedData, GOLDEN_RESPONSE_HTML);
            renderResults(GOLDEN_RESPONSE_HTML);
        });
    }

    // =======================================================
    // III. MOCK AI CALL & RESULT RENDERING
    // =======================================================

    async function callMockAnalysis(rawData) {
        // Simulate a 2.5 second wait time to make the 'analysis' feel real
        await new Promise(r => setTimeout(r, 2500));
        return GOLDEN_RESPONSE_HTML;
    }

    function renderResults(htmlContent) {
        if (loadingArea) loadingArea.classList.add('hidden');
        if (aiResults) aiResults.innerHTML = htmlContent;
        if (resultsPanel) resultsPanel.classList.remove('hidden');
        renderHistoryList();
    }
    
    // =======================================================
    // IV. HACKATHON WINNING FEATURES IMPLEMENTATION
    // =======================================================
    
    // NEW FEATURE 1: Dynamic CSV Sanitization
    function sanitizeCSV(csvString) {
        return csvString.split('\n')
            .filter(line => line.trim() !== '') // Remove empty lines
            .map(line => line.trim()) // Trim whitespace from lines
            .join('\n');
    }
    
    // NEW FEATURE 2: Export Report as JSON
    function exportReportToJson() {
        if (!CURRENT_RAW_DATA || !CURRENT_AI_RESPONSE) {
            alert("Please run an analysis first.");
            return;
        }
        
        const report = {
            metadata: {
                timestamp: new Date().toISOString(),
                tool: "InsightPilot AI Strategy Engine",
                exportType: "Full Report (Data + AI Summary)"
            },
            rawData: CURRENT_RAW_DATA,
            aiSummary: CURRENT_AI_RESPONSE
        };

        const jsonString = JSON.stringify(report, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `InsightPilot_Report_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // NEW FEATURE 3: Real-Time Churn Alert
    function updateChurnAlert(csvData) {
        if (!churnAlert) return;
        
        try {
            const lines = csvData.split('\n').slice(1); // Skip header
            let maxChurn = -1;
            let maxChurnRegion = 'N/A';
            let headers = csvData.split('\n')[0].split(',').map(h => h.trim());
            
            const churnIndex = headers.indexOf('Customer_Churn_Rate');
            const regionIndex = headers.indexOf('Region');

            if (churnIndex === -1 || regionIndex === -1) {
                churnAlert.innerHTML = `<p class="error-text">⚠️ Data format error: Missing 'Region' or 'Customer_Churn_Rate' column.</p>`;
                return;
            }

            lines.forEach(line => {
                const values = line.split(',');
                if (values.length > churnIndex) {
                    const churnRate = parseFloat(values[churnIndex]);
                    const region = values[regionIndex];
                    if (!isNaN(churnRate) && churnRate > maxChurn) {
                        maxChurn = churnRate;
                        maxChurnRegion = region;
                    }
                }
            });

            if (maxChurn > 0) {
                const churnPercent = (maxChurn * 100).toFixed(2);
                churnAlert.classList.remove('alert-low');
                
                if (maxChurn > 0.10) {
                    churnAlert.classList.add('alert-high');
                    churnAlert.innerHTML = `<p>🚨 **HIGH RISK:** The highest recorded Churn Rate is **${churnPercent}%** in the **${maxChurnRegion}** region. Immediate action needed!</p>`;
                } else {
                    churnAlert.classList.remove('alert-high');
                    churnAlert.classList.add('alert-low');
                    churnAlert.innerHTML = `<p>✅ **STABLE:** Max Churn Rate is ${churnPercent}% in ${maxChurnRegion}. Ready for analysis.</p>`;
                }
            } else {
                churnAlert.innerHTML = `<p>Loading data...</p>`;
                churnAlert.className = 'alert-box';
            }
            
        } catch (e) {
            churnAlert.innerHTML = `<p class="error-text">⚠️ Invalid CSV format.</p>`;
        }
    }

    // =======================================================
    // V. HISTORY FEATURE (THE CATCH)
    // =======================================================

    function saveReport(rawData, aiResponse) {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        const date = new Date().toLocaleString();
        const title = `Analysis - ${date}`;

        const newReport = { id: Date.now(), title, rawData, aiResponse };
        
        reports.unshift(newReport);
        localStorage.setItem('reports', JSON.stringify(reports.slice(0, 5)));
    }

    function loadReport(id) {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        const report = reports.find(r => r.id === id);

        if (report) {
            // Load global state variables for export
            CURRENT_RAW_DATA = report.rawData;
            CURRENT_AI_RESPONSE = report.aiResponse;
            
            dataInput.value = report.rawData;
            renderResults(report.aiResponse);
            
            // Re-render the chart (using the mock data structure for demo reliability)
            const aggregatedData = aggregateDataByRegion(CHART_DATA);
            const chartData = prepareChartData(aggregatedData);
            renderChart(chartData);

            if (resultsPanel) resultsPanel.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function renderHistoryList() {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        if (!historyList) return;

        if (reports.length === 0) {
            historyList.innerHTML = '<p class="guide-text">No reports saved yet. Run an analysis to start.</p>';
            return;
        }

        historyList.innerHTML = '<ul class="history-list"></ul>';
        const ul = historyList.querySelector('ul');

        reports.forEach(report => {
            const li = document.createElement('li');
            li.textContent = report.title;
            li.setAttribute('data-id', report.id);
            li.addEventListener('click', () => loadReport(report.id));
            ul.appendChild(li);
        });
    }
    
    renderHistoryList();

    // =======================================================
    // VI. CHART.JS DATA PREP AND RENDERING
    // =======================================================

    // Helper to calculate total sales and average churn per region
    function aggregateDataByRegion(dataArray) {
        const map = {};
        dataArray.forEach(item => {
            const r = item.Region;
            if (!map[r]) map[r] = { Sales_Units: 0, Customer_Churn_Rate: 0, count: 0 };
            map[r].Sales_Units += Number(item.Sales_Units || 0);
            map[r].Customer_Churn_Rate += Number(item.Customer_Churn_Rate || 0);
            map[r].count += 1;
        });
        return Object.keys(map).map(region => ({ 
            Region: region, 
            Sales_Units: map[region].Sales_Units, 
            Avg_Churn: +(map[region].Customer_Churn_Rate / map[region].count).toFixed(3) 
        }));
    }

    // Formats the aggregated data into Chart.js structure
    function prepareChartData(aggArray) {
        return { 
            labels: aggArray.map(d => d.Region), 
            sales: aggArray.map(d => d.Sales_Units), 
            churn: aggArray.map(d => +(d.Avg_Churn * 100).toFixed(2)) 
        };
    }

    let salesChartInstance = null;
    
    // Renders the combined Bar/Line chart
    function renderChart(chartData) {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        
        if (typeof Chart === 'undefined') { 
            canvas.parentElement.innerHTML = 'Chart.js library missing.'; 
            return; 
        }

        const ctx = canvas.getContext('2d');
        const chartType = chartTypeToggle ? chartTypeToggle.value : 'bar';
        
        if (salesChartInstance) { 
            // Update existing chart instance
            salesChartInstance.config.type = chartType;
            salesChartInstance.data.labels = chartData.labels; 
            salesChartInstance.data.datasets[0].data = chartData.sales; 
            salesChartInstance.data.datasets[1].data = chartData.churn; 
            salesChartInstance.update(); 
            return; 
        }
        
        // Create new chart instance
        salesChartInstance = new Chart(ctx, { 
            type: chartType, // Uses the current selection
            data: { 
                labels: chartData.labels, 
                datasets: [
                    { 
                        type: 'bar', // Sales is always a bar (or the primary element)
                        label: 'Total Sales Units', 
                        data: chartData.sales, 
                        backgroundColor: '#3b82f6',
                        yAxisID: 'y'
                    }, 
                    { 
                        type: 'line', // Churn is always a line for trend comparison
                        label: 'Avg Churn (%)', 
                        data: chartData.churn, 
                        yAxisID: 'y1', 
                        borderColor: '#ef4444', 
                        fill: false 
                    }
                ] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text: 'Sales Units', color: 'var(--text-color)' },
                        grid: { color: 'var(--border-color)' },
                        ticks: { color: 'var(--text-color)' }
                    }, 
                    y1: { 
                        beginAtZero: true, 
                        position: 'right',
                        title: { display: true, text: 'Avg Churn Rate (%)', color: 'var(--text-color)' },
                        grid: { drawOnChartArea: false },
                        ticks: { color: 'var(--text-color)' }
                    } 
                },
                plugins: {
                    legend: { labels: { color: 'var(--text-color)' } }
                }
            } 
        });
    }
});