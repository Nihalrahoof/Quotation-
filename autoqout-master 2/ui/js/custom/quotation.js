$(document).ready(function() {
    var productModal = $("#productModal");

    // Show customer modal on page load
    $("#addCustomerBtn").on("click", function() {
        $('#customerModal').modal('show');
    });

    // Save customer details
    $('#saveCustomer').on('click', function() {
        var data = $("#customerForm").serializeArray();
        var requestPayload = {
            customer_name: null,
            customer_number: null,
            discount_colour: null,
            customer_place: null
        };
        for (var i = 0; i < data.length; ++i) {
            var element = data[i];
            switch (element.name) {
                case 'customerName':
                    requestPayload.customer_name = element.value;
                    break;
                case 'customerNumber':
                    requestPayload.customer_number = element.value;
                    break;
                case 'discountColor':
                    requestPayload.discount_colour = element.value;
                    break;
                case 'customerPlace':
                    requestPayload.customer_place = element.value;
                    break;
                default:
                    break;
            }
        }
        callApi("POST", customerSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
        $('#customerModal').modal('hide');
    });

    // Load initial data (products and quotations) from backend
    $.get(quotationListApiUrl, function(response) {
        console.log(response); // Log the response to the console for inspection
        if (response) {
            // Populate products dropdown
            var productOptions = '<option value="">--Select Product--</option>';
            $.each(response.products, function(index, product) {
                productOptions += '<option value="' + product.id + '" data-price="' + product.price_per_unit + '" data-description="' + product.description + '" data-uoms="' + product.uom_name +'">' + product.name + '</option>';
            });
            $('#product').html(productOptions);

            // Populate quotations table
            if (response.quotations && response.quotations.length > 0) {
                var table = '';
                $.each(response.quotations, function(index, quotation) {
                    table += '<tr data-id="' + quotation.quotation_id + '" data-product-id="' + quotation.product_id + '">'
                        + '<td>' + (index + 1) + '</td>'
                        + '<td>' + quotation.product + '</td>'
                        + '<td>' + quotation.length + '</td>'
                        + '<td>' + quotation.height + '</td>'
                        + '<td>' + quotation.depth + '</td>'
                        + '<td>' + quotation.location + '</td>'
                    + '<td class="description-column">' + quotation.description + '</td>'
                        + '<td>NOS</td>' // Default value for unit
                        + '<td>' + quotation.quantity + '</td>'
                        + '<td class="price-column"> ₹ ' + quotation.total_price + '</td>'
                        + '<td class="action-column">'
                        + '<button class="btn btn-sm btn-warning edit-product">Edit</button> '
                        + '<button class="btn btn-sm btn-danger delete-product">Delete</button>'
                        + '</td>'
                    + '</tr>';
                });
                $('#quotationTableBody').html(table);
                updateTotalPrice();
            } else {
                console.log('No quotations found.');
            }
        } else {
            console.log('Response is empty.');
        }
    });

    // Update description when product is selected
    $('#product').on('change', function() {
        var selectedDescription = $('#product option:selected').data('description');
        $('#description').val(selectedDescription);
        var selectedUoms = $('#product option:selected').data('uoms');
        console.log(selectedUoms)
        if (selectedUoms === 'Each') {
            $("#lengthc").hide();
            $("#heightc").hide();
            $("#depthc").hide();
        }
        else  {
            $("#lengthc").show();
            $("#heightc").show();
            $("#depthc").show();


        }
    });

    // Save product to quotation
    $('#saveProduct').on('click', function() {
        var data = $("#productForm").serializeArray();
        var requestPayload = {
            quotation_id: 0,
            product_id: null,
            product: null,
            length: 0, // Default length value
            height: 0, // Default height value
            depth: 0, // Default depth value
            location: null,
            description: null,
            discount_colour: null,
            total_price: null,
            quantity: 1 // Default quantity value
        };
        var unitPrice = 0;
        for (var i = 0; i < data.length; ++i) {
            var element = data[i];
            switch (element.name) {
                case 'product':
                    requestPayload.product_id = element.value;
                    requestPayload.product = $("#product option:selected").text();
                    unitPrice = $("#product option:selected").data('price');
                    requestPayload.description = $("#product option:selected").data('description');
                    requestPayload.uoms = $("#product option:selected").data('uoms');
                    break;
                case 'length':
                    requestPayload.length = element.value ? element.value : 0; // Set default if not inputted
                    break;
                case 'height':
                    requestPayload.height = element.value ? element.value : 0; // Set default if not inputted
                    break;
                case 'depth':
                    requestPayload.depth = element.value ? element.value : 0; // Set default if not inputted
                    break;
                case 'location':
                    requestPayload.location = element.value;
                    break;
                case 'description':
                    requestPayload.description = element.value; // Ensure this is set properly
                    break;
                case 'discountColor':
                    requestPayload.discount_colour = element.value;
                    break;
                case 'quantity':
                    requestPayload.quantity = element.value ? element.value : 1; // Set default if not inputted
                    break;
                default:
                    break;
            }
        }

        requestPayload.total_price = calculatePrice(unitPrice, requestPayload.length, requestPayload.height,requestPayload.discount_colour,requestPayload.quantity,requestPayload.uoms);

        callApi("POST", quotationSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });

        updateTotalPrice();
        $('#productModal').modal('hide');
    });

    // Edit product in quotation
    $(document).on('click', '.edit-product', function() {
        var row = $(this).closest('tr');
        var productId = row.data('product-id');
        var quotationId = row.data('id');
        var productData = {
            quotation_id: quotationId,
            product_id: productId,
            product: row.find('td:eq(1)').text(),
            length: row.find('td:eq(2)').text(),
            height: row.find('td:eq(3)').text(),
            depth: row.find('td:eq(4)').text(),
            location: row.find('td:eq(5)').text(),
            description: row.find('td:eq(6)').text(),
            discountColor: row.find('td:eq(7)').text()
        };

        // Populate the form with existing product details
        $('#product').val(productData.product_id);
        $('#length').val(productData.length ? productData.length : 0); // Set default if not inputted
        $('#height').val(productData.height ? productData.height : 0); // Set default if not inputted
        $('#depth').val(productData.depth ? productData.depth : 0); // Set default if not inputted
        $('#location').val(productData.location);
        $('#description').val(productData.description);
        $('#productDiscountColor').val(productData.discountColor);
        $('#quantity').val(productData.quantity ? productData.quantity : 1); // Set default if not inputted


        // Set quotation ID if needed
        $('#quotation_id').val(quotationId);

        // Show the product modal

        $('#saveProduct').off('click').on('click', function() {
            var data = $("#productForm").serializeArray();
            var requestPayload = {
                quotation_id: quotationId,
                product_id: productId,
                product: null,
                length: 0, // Default length value
                height: 0, // Default height value
                depth: 0, // Default depth value
                location: null,
                description: null,
                discount_colour: null,
                total_price: null,
                quantity: 1 // Default quantity value
            };
            var unitPrice = 0;
            for (var i = 0; i < data.length; ++i) {
                var element = data[i];
                switch (element.name) {
                    case 'product':
                        requestPayload.product_id = element.value;
                        requestPayload.product = $("#product option:selected").text();
                        unitPrice = $("#product option:selected").data('price');
                        requestPayload.description = $("#product option:selected").data('description');
                        requestPayload.uoms = $("#product option:selected").data('uoms');
                        break;
                    case 'length':
                        requestPayload.length = element.value ? element.value : 0; // Set default if not inputted
                        break;
                    case 'height':
                        requestPayload.height = element.value ? element.value : 0; // Set default if not inputted
                        break;
                    case 'depth':
                        requestPayload.depth = element.value ? element.value : 0; // Set default if not inputted
                        break;
                    case 'location':
                        requestPayload.location = element.value;
                        break;
                    case 'description':
                        requestPayload.description = element.value; // Ensure this is set properly
                        break;
                    case 'discountColor':
                        requestPayload.discount_colour = element.value;
                        break;
                     case 'quantity':
                        requestPayload.quantity = element.value ? element.value : 1; // Set default if not inputted
                        break;

                    default:
                        break;
                }
            }

            requestPayload.total_price = calculatePrice(unitPrice, requestPayload.length, requestPayload.height, requestPayload.discount_colour,requestPayload.quantity,requestPayload.uoms);

            callApi("POST", quotationSaveApiUrl, {
                'data': JSON.stringify(requestPayload)
            });

            row.find('td:eq(1)').text(requestPayload.product);
            row.find('td:eq(2)').text(requestPayload.length);
            row.find('td:eq(3)').text(requestPayload.height);
            row.find('td:eq(4)').text(requestPayload.depth);
            row.find('td:eq(5)').text(requestPayload.location);
            row.find('td:eq(6)').text(requestPayload.description);
            row.find('td:eq(7)').text('NOS');
            row.find('td:eq(8)').text(1);
            row.find('td:eq(9)').text(requestPayload.total_price);

            updateTotalPrice();
            $('#productModal').modal('hide');
        });

        productModal.modal('show');
    });

    // Delete product from quotation
    $(document).on('click', '.delete-product', function() {
        var tr = $(this).closest('tr');
        var data = {
            quotation_id: tr.data('id') // Added quotation_id for delete function
        };
        console.log(data);
        var isDelete = confirm("Are you sure to delete " + tr.find('td:eq(1)').text() + " item?");
        if (isDelete) {
            callApi("POST", quotationDeleteApiUrl, data);
        }
    });

    function updateSiNumbers() {
        $('#quotationTableBody tr').each(function(index, tr) {
            $(tr).find('td:first').text(index + 1);
        });
    }

    function calculatePrice(unitPrice, length, height, discountColor,quantity,uoms) {
        var price = unitPrice;
        console.log(quantity)
        if (uoms === 'Each') {
            price = unitPrice * quantity;
        }
        else  {
            price *= (length * height) * 0.001076 * quantity ;
        }
        switch (discountColor.toLowerCase()) {
            case 'red':
                price *= 0.80; // 20% discount
                break;
            case 'green':
                price *= 1.0; // No discount
                break;
            case 'orange':
                price *= 0.90; // 10% discount
                break;
            case 'ultra red':
                price *= 0.70; // 30% discount
                break;
            case 'ultra violet':
                price *= 0.60; // 40% discount
                break;
            // Add more colors and discounts as needed
            default:
                break;
        }
            return parseFloat(price.toFixed(2));

    }

    function updateTotalPrice() {
    var totalPrice = 0;
    $('#quotationTableBody tr').each(function() {
        var priceText = $(this).find('td:eq(9)').text();
        var price = parseFloat(priceText.replace(/[^\d.-]/g, '')); // Remove non-numeric characters
        totalPrice += isNaN(price) ? 0 : price;
    });
    $('#totalPrice').text("₹ " + totalPrice.toFixed(2));
    return totalPrice.toFixed(2);
}

function collectTableData() {
    var tableData = [];
    $('#quotationTableBody tbody tr').each(function() {
        var row = {};
        $(this).find('td').each(function(index) {
            row['column' + index] = $(this).text();
        });
        tableData.push(row);
    });

    return {
        'tableData': tableData,
        'totalAmount': updateTotalPrice() // Assuming you have this function to calculate the total
    };
}





    // Function to handle "Print" button click
    $('#printTableBtn').on('click', function() {
        var tableData = collectTableData(); // Collect the table data
        sendDataToGoogleSheet(tableData); // Send data to Flask backend for updating Google Sheet
    });

    // Function to collect table data
    function collectTableData() {
        var tableData = [];
        $('#quotationTableBody tr').each(function() {
            var row = {};
            $(this).find('td').each(function(index) {
                row['column' + index] = $(this).text();
            });
            tableData.push(row);
        });

        return {
            'tableData': tableData,
            'totalAmount': updateTotalPrice() // Assuming you have this function to calculate the total
        };
    }

    // Function to send data to Google Sheet via Flask backend
    function sendDataToGoogleSheet(tableData) {
        callApi("POST", printApiUrl, {
                'data': JSON.stringify(tableData)
            });
        alert("Data send to google docs for prinitng ");
    }




});
