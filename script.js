const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTZl7YOoSW_-yJL6soErQpaCCvY0An7-5CEBNxRESyT6ZEeOnf80ORs4JcvU1Lx9Ib3m0bdcMQhHgzv/pub?output=csv';

async function displayData() {
    const container = document.getElementById('table-container');
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const csvText = await response.text();
        const rows = csvText.trim().split(/\r?\n/);
        
        let html = '<table border="1" style="margin:auto; border-collapse:collapse;">';
        
        rows.forEach((row, index) => {
            html += '<tr>';
            const columns = row.split(',');
            columns.forEach(col => {
                const tag = (index === 0) ? 'th' : 'td';
                html += `<${tag} style="padding:10px;">${col.trim()}</${tag}>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = "Error: " + error.message + ". Check if the Sheet is Published to Web.";
    }
}

displayData();
