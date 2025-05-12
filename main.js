const reciptNumber = document.getElementById('reciptNumber');
const dataA = document.getElementById('reciptDataA');
const dataB = document.getElementById('reciptDataB');

const saveButton = document.getElementById('save_recpit');
const addItemBtn = document.getElementById("add-item-btn");

// get reciptId every day 
const getReciptId = function () {
    let today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    let storedData = JSON.parse(localStorage.getItem('receiptNumbers')) || {};
    if (!storedData[today]) {
        storedData[today] = 1; // Start with 1 if no entry for today
    } else {
        storedData[today] += 1; // Increment for today
    }
    localStorage.setItem('receiptNumbers', JSON.stringify(storedData));
    return storedData[today];
}

reciptNumber.innerHTML = `<strong>رقم الفاتورة  :</strong> ${getReciptId()}`;
dataA.innerHTML = `<strong>التاريخ الهجري  :</strong> ${new Date().toLocaleDateString('ar-SA')}`;
dataB.innerHTML = `<strong>التاريخ الميلادي :</strong> ${new Date().toLocaleDateString('ar-EG')}`;

// create Row and append it in table 
const createRow = function () {
    const tableBody = document.querySelector('.table-responsive table tbody');
    const rows = tableBody.querySelectorAll('tr');
    const newRow = document.createElement('tr');
    const rowNumber = rows.length + 1;

    // Create cells for the new row
    const numberCell = document.createElement('td');
    const itemCell = document.createElement('td');
    const quantityCell = document.createElement('td');
    const priceCell = document.createElement('td');
    const totalCell = document.createElement('td');
    const actionCell = document.createElement('td');
    actionCell.className = 'text-center';

    // Set cell contents
    numberCell.textContent = rowNumber;

    itemCell.innerHTML = `<textarea class="form-control auto-expand" 
    rows="1"
    dir="rtl"
    style="text-align: right; overflow:hidden; resize:none;"></textarea>`;
    quantityCell.innerHTML = `<input type="number" class="form-control form-control-sm" min="1" value="1">`;
    priceCell.innerHTML = `<input type="number" step="0.1" class="form-control form-control-sm" min="0" value="0">`;
    totalCell.textContent = '0.0';
    actionCell.innerHTML = `<button class="btn btn-danger btn-sm p-0 px-1"><i class="bi bi-trash"></i></button>`;

    // Append cells to the row
    newRow.appendChild(numberCell);
    newRow.appendChild(itemCell);
    newRow.appendChild(quantityCell);
    newRow.appendChild(priceCell);
    newRow.appendChild(totalCell);
    newRow.appendChild(actionCell);

    // Append the new row to the table
    tableBody.appendChild(newRow);

    // Setup auto-expand for the new textarea
    setupAutoExpand(itemCell.querySelector('textarea'));

    // Add event listeners for quantity and price inputs to update the total
    const quantityInput = quantityCell.querySelector('input');
    const priceInput = priceCell.querySelector('input');

    function updateRowTotal() {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        totalCell.textContent = (quantity * price).toFixed(2);
        calculateTotals(); // Recalculate grand totals
    }

    quantityInput.addEventListener('input', updateRowTotal);
    priceInput.addEventListener('input', updateRowTotal);

    // Add delete functionality
    actionCell.querySelector('button').addEventListener('click', () => {
        newRow.remove();
        updateRowNumbers(); // Update row numbers after deletion
        calculateTotals(); // Recalculate totals
    });

    // Function to update row numbers
    function updateRowNumbers() {
        const allRows = tableBody.querySelectorAll('tr');
        allRows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }
}
createRow();
createRow();

// Add event listener add row item btn to add new row
addItemBtn.addEventListener('click', () => {
    createRow();
});
// Add event listener to tax-rate input field
document.getElementById("tax-rate").addEventListener('input', calculateTotals);

// Function to calculate and update totals
function calculateTotals() {
    const tableBody = document.querySelector('.table-responsive table tbody');
    const rows = tableBody.querySelectorAll('tr');
    let subtotal = 0;

    // Calculate subtotal from all rows
    rows.forEach(row => {
        const quantity = parseFloat(row.cells[2].querySelector('input').value) || 0;
        const price = parseFloat(row.cells[3].querySelector('input').value) || 0;
        const rowTotal = quantity * price;
        row.cells[4].textContent = rowTotal.toFixed(2); // Update row total
        subtotal += rowTotal;
    });

    // Calculate tax and total
    const taxRate = document.getElementById("tax-rate").value / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Update totals display
    document.querySelector('.totals-card tr:nth-child(1) td:nth-child(2)').textContent = subtotal.toFixed(2);
    document.querySelector('.totals-card tr:nth-child(2) td:nth-child(2)').textContent = tax.toFixed(2);
    document.querySelector('.totals-card tr:nth-child(3) td:nth-child(2)').textContent = total.toFixed(2);

}

// fuction to edit text area to be new lie
function setupAutoExpand(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';

    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}


// save button to save reipt as pdf 
saveButton.addEventListener('click', function () {
    const originalTitle = document.title;
    const receiptNumber = document.getElementById('reciptNumber').textContent.replace(/\D/g, ''); // Extract receipt number
    document.title = `Receipt_${receiptNumber}`;
    window.print();
    document.title = originalTitle; // Restore original title after printing
    window.addEventListener('afterprint', () => {
        location.reload();
    });
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            table {
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            thead {
                display: table-header-group;
            }
            tfoot {
                display: table-footer-group;
            }
        }
    `;
});
