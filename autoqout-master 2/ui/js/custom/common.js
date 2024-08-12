// Update your API URLs to match the deployed server
var baseApiUrl = 'https://autoquotation.up.railway.app';

var productListApiUrl = baseApiUrl + '/getProducts';
var uomListApiUrl = baseApiUrl + '/getUOM';
var productSaveApiUrl = baseApiUrl + '/insertProduct';
var productDeleteApiUrl = baseApiUrl + '/deleteProduct';
var customerSaveApiUrl = baseApiUrl + '/insertCustomers';
var quotationSaveApiUrl = baseApiUrl + '/insertQuotations';
var customerTotalsApiUrl = baseApiUrl + '/getCustomers';
var quotationListApiUrl = baseApiUrl + '/getlists';
var quotationDeleteApiUrl = baseApiUrl + '/deleteQuotation';
var printApiUrl = baseApiUrl + '/sendtosheet';

var productsApiUrl = 'https://fakestoreapi.com/products';

// For product drop in order
var productsApiUrl = 'https://fakestoreapi.com/products';


function callApi(method, url, data) {
    $.ajax({
        method: method,
        url: url,
        data: data
    }).done(function( msg ) {
        window.location.reload();
    });
}


function productParser(product) {
    return {
        id : product.id,
        name : product.employee_name,
        unit : product.employee_name,
        price : product.employee_name
    }
}

function productDropParser(product) {
    return {
        id : product.id,
        name : product.title
    }
}

//To enable bootstrap tooltip globally
// $(function () {
//     $('[data-toggle="tooltip"]').tooltip()
// });
