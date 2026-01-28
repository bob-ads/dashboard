// Google Sheets CSV link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZl7YOoSW_-yJL6soErQpaCCvY0An7-5CEBNxRESyT6ZEeOnf80ORs4JcvU1Lx9Ib3m0bdcMQhHgzv/pub?output=csv';

async function fetchData() {
    try {
        const response = await fetch(csvUrl);
        const rawData = await response.text();
        
        // 1. Split by any newline format and remove empty lines
        const rows = rawData.trim().split(/\r?\n/).filter(r => r.trim() !== '');
        
        // 2. Clean up headers (trim whitespace/hidden characters)
        const headers = rows[0].split(',').map(h => h.trim());

        const labels = [];
        const datasets = [];

        // Initialize datasets based on headers (skipping the first column 'Date Start')
        for (let i = 1; i < headers.length; i++) {
            datasets.push({
                label: headers[i],
                data: [],
                borderColor: `hsl(${(i - 1) * (360 / (headers.length - 1))}, 70%, 50%)`,
                backgroundColor: `hsla(${(i - 1) * (360 / (headers.length - 1))}, 70%, 50%, 0.2)`,
                tension: 0.3,
                fill: false
            });
        }

        // 3. Process data rows (reverse them so they are in chronological order)
        const dataRows = rows.slice(1).reverse(); 

        dataRows.forEach(row => {
            const cols = row.split(',').map(c => c.trim());
            labels.push(cols[0]); // Date

            // Only loop up to the number of datasets we have to prevent crashes
            for (let i = 1; i < headers.length; i++) {
                // Remove currency symbols or commas if they exist
                const val = cols[i] ? cols[i].replace(/[$,]/g, '') : "0";
                datasets[i - 1].data.push(parseFloat(val) || 0);
            }
        });

        return { labels, datasets };
    } catch (error) {
        console.error("Error fetching or parsing data:", error);
    }
}

async function renderChart() {
    const data = await fetchData();
    if (!data) return;

    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

renderChart();
