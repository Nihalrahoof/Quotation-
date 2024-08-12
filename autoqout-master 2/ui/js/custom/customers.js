$(document).ready(function() {
    // Fetch customers from backend (replace with actual API URL)
    $.get(customerTotalsApiUrl, function(response) {
        if (response) {
            var tableBody = '';
            $.each(response, function(index, customer) {
                tableBody += '<tr>' +
                             '<td>' + customer.customer_name + '</td>' +
                             '<td>' + customer.total_price + '</td>' +
                             '<td><button class="btn btn-info btn-sm" onclick="viewCustomerDetails(\'' + customer.customer_id + '\')">View</button></td>' +
                             '</tr>';
            });
            $('#customerListTableBody').html(tableBody);
        } else {
            alert("Error fetching customer list!");
        }
    });

    // Function to sort table by date added
    function sortTableByDateAdded() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.querySelector("table");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[1]; // Change index based on your column structure
                y = rows[i + 1].getElementsByTagName("TD")[1]; // Change index based on your column structure
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    // Function to sort table by name
    function sortTableByName() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.querySelector("table");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[0]; // Change index based on your column structure
                y = rows[i + 1].getElementsByTagName("TD")[0]; // Change index based on your column structure
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    // Event listener for sorting by date added button
    $('#sortByDateAdded').click(function() {
        sortTableByDateAdded();
    });

    // Event listener for sorting by name button
    $('#sortByName').click(function() {
        sortTableByName();
    });

    // Example function to handle view button click
    window.viewCustomerDetails = function(customerId) {
        // Replace with your logic to handle viewing customer details
        alert('View details for customer: ' + customerId);
    };
});
