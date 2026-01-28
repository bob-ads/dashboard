// Google Sheets CSV link
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZl7YOoSW_-yJL6soErQpaCCvY0An7-5CEBNxRESyT6ZEeOnf80ORs4JcvU1Lx9Ib3m0bdcMQhHgzv/pub?output=csv';

// Fetch CSV data and parse
async function fetchData() {
    const response = await fetch(csvUrl);
    const data = await response.text();
    const rows = data.split('\n').filter(r => r.trim() !== ''); // remove empty rows
    const headers = rows[0].split(',');

    const labels = [];
    const datasets = [];

    // Initialize a dataset for each numeric column (skip first column, which is date)
    for (let i = 1; i < headers.length; i++) {
        datasets.push({
            label: headers[i],
            data: [],
            borderColor: `hsl(${i * 60}, 70%, 50%)`,
            backgroundColor: `hsla(${i * 60}, 70%, 50%, 0.2)`,
            tension: 0.3
        });
    }

    // Fill labels and datasets
    rows.slice(1).forEach(row => {
        const cols = row.split(',');
        labels.push(cols[0]); // first column = Date Start
        for (let i = 1; i < cols.length; i++) {
            datasets[i - 1].data.push(parseFloat(cols[i]) || 0);
        }
    });

    return { labels, datasets };
}

// Render chart
async function renderChart() {
    const { labels, datasets } = await fetchData();
    const ctx = document.getElementById('salesChart').getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

renderChart();
