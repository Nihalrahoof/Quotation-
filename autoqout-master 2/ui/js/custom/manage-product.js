var productModal = $("#productModal");

$(function () {
    function sortTable(columnIndex) {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("productTable");
        switching = true;
        while (switching) {
            switching = false;
            rows = table.rows;
            for (i = 1; i < (rows.length - 1); i++) {
                shouldSwitch = false;
                x = rows[i].getElementsByTagName("TD")[columnIndex];
                y = rows[i + 1].getElementsByTagName("TD")[columnIndex];
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

    // Add event listeners for sorting buttons
    $('#sortByName').click(function() {
        sortTable(0); // Sort by Name (column index 0)
    });

    $('#sortByUnit').click(function() {
        sortTable(1); // Sort by Unit (column index 1)
    });

    $('#sortByPrice').click(function() {
        sortTable(2); // Sort by Price (column index 2)
    });

    $('#sortByCategory').click(function() {
        sortTable(3); // Sort by Category (column index 3)
    });

    $.get(quotationListApiUrl, function (response) {
        if(response) {
            var table = '';
            $.each(response.products, function(index, product) {
                table += '<tr data-id="'+ product.product_id +'" data-name="'+ product.name +'" data-unit="'+ product.uom_id +'" data-price="'+ product.price_per_unit +'" data-category="'+ product.category +'" data-description="'+ product.description +'">' +
                    '<td>'+ product.name +'</td>'+
                    '<td>'+ product.uom_name +'</td>'+
                    '<td>'+ product.price_per_unit +'</td>'+
                    '<td>'+ product.category +'</td>'+
                    '<td>'+ product.description +'</td>'+
                    '<td><button class="btn btn-sm btn-primary edit-product" data-id="'+ product.product_id +'">Edit</button> '+
                    '<button class="btn btn-sm btn-danger delete-product">Delete</button></td>'+
                    '</tr>';
            });
            $("#productTable tbody").html(table);
        }
    });

    // Save or update product
    $("#saveProduct").click(function () {
        var data = $("#productForm").serializeArray();
        var requestPayload = {
            product_id: $('#id').val(),
            product_name: null,
            uom_id: null,
            price_per_unit: null,
            category: null,
            description: null
        };
        for (var i=0; i<data.length; ++i) {
            var element = data[i];
            switch(element.name) {
                case 'name':
                    requestPayload.product_name = element.value;
                    break;
                case 'uoms':
                    requestPayload.uom_id = element.value;
                    break;
                case 'price':
                    requestPayload.price_per_unit = element.value;
                    break;
                case 'category':
                    if(element.value === 'Other') {
                        requestPayload.category = $('#custom_category').val();
                    } else {
                        requestPayload.category = element.value;
                    }
                    break;
                case 'description':
                    requestPayload.description = element.value;
                    break;
            }
        }

        callApi("POST", productSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
    });

    // Handle edit button click
    $(document).on("click", ".edit-product", function () {
        var tr = $(this).closest('tr');
        var product_id = $(this).data('id');
        var product_name = tr.data('name');
        var uom_id = tr.data('unit');
        var price_per_unit = tr.data('price');
        var category = tr.data('category');
        var description = tr.data('description');

        // Populate the form with existing product details
        $("#id").val(product_id);
        $("#name").val(product_name);
        $("#uoms").val(uom_id);
        $("#price").val(price_per_unit);
        $("#category").val(category);
        $("#description").val(description);

        if (category === 'Low' || category === 'Medium' || category === 'High') {
            $("#custom_category").hide();
        } else {
            $("#category").val('Other');
            $("#custom_category").val(category).show();
        }

        productModal.find('.modal-title').text('Edit Product');
        productModal.modal('show');
    });

    $(document).on("click", ".delete-product", function () {
        var tr = $(this).closest('tr');
        var data = {
            product_id: tr.data('id')
        };
        console.log(data);

        var isDelete = confirm("Are you sure to delete " + tr.data('name') + " item?");
        if (isDelete) {
            callApi("POST", productDeleteApiUrl, data);
        }
    });

    productModal.on('hide.bs.modal', function () {
        $("#id").val('0');
        $("#name, #uoms, #price, #category, #description, #custom_category").val('');
        productModal.find('.modal-title').text('Add New Product');
        $(".length-breadth").hide();
        $("#custom_category").hide();
    });

    productModal.on('show.bs.modal', function () {
        $("#uoms").on("change", function () {
            if ($(this).val() == 2) {
                $(".length-breadth").show();
            } else {
                $(".length-breadth").hide();
            }
        });
    });

    $("#category").on("change", function() {
        if ($(this).val() === 'Other') {
            $("#custom_category").show();
        } else {
            $("#custom_category").hide();
        }
    });

    productModal.on('show.bs.modal', function () {
        $.get(uomListApiUrl, function (response) {
            if (response) {
                var options = '<option value="">--Select--</option>';
                $.each(response, function (index, uom) {
                    options += '<option value="' + uom.uom_id + '">' + uom.uom_name + '</option>';
                });
                $("#uoms").empty().html(options);
            }
        });
    });
});
