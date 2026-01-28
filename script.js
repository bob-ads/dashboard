const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZl7YOoSW_-yJL6soErQpaCCvY0An7-5CEBNxRESyT6ZEeOnf80ORs4JcvU1Lx9Ib3m0bdcMQhHgzv/pub?output=csv';

async function displayData() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        // 1. Split text into rows and then columns
        const rows = csvText.trim().split(/\r?\n/).map(row => row.split(','));
        
        if (rows.length === 0) {
            document.getElementById('table-container').innerHTML = "No data found.";
            return;
        }

        // 2. Build the Table HTML string
        let tableHtml = '<table><thead><tr>';
        
        // Create Headers
        rows[0].forEach(header => {
            tableHtml += `<th>${header.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        
        // Create Data Rows
        for (let i = 1; i < rows.length; i++) {
            tableHtml += '<tr>';
            rows[i].forEach(cell => {
                tableHtml += `<td>${cell.trim()}</td>`;
            });
            tableHtml += '</tr>';
        }
        
        tableHtml += '</tbody></table>';
        
        // 3. Inject into the page
        document.getElementById('table-container').innerHTML = tableHtml;

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('table-container').innerHTML = "Error loading data. Make sure your Google Sheet is 'Published to Web' as a CSV.";
    }
}

displayData();
