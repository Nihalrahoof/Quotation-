from flask import Flask, request, jsonify,send_from_directory
import os
import customers_dao
import quotation_dao
from sql_connection import get_sql_connection
import mysql.connector
import json
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from oauth2client.service_account import ServiceAccountCredentials

import products_dao
import uom_dao

app = Flask(__name__, static_folder='ui', static_url_path='')

connection = get_sql_connection()



@app.route('/')
def index():
    return send_from_directory('ui', 'index.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('ui/css', filename)



def auth():
    SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
    creds = None
    script_path = os.path.abspath(__file__)
    script_dir = os.path.dirname(script_path)

    # Path to your token.json file
    token_path = os.path.join(script_dir, 'token.json')
    # Path to your cred.json file
    cred_path = os.path.join(script_dir, 'cred.json')

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    return creds

@app.route('/sendtosheet', methods=['POST'])
def send_to_sheet():
    response = {}
    try:
        data = json.loads(request.form['data'])
        table_data = data.get('tableData', [])
        print(table_data)
        total_amount = data.get('totalAmount', '')
        print(total_amount)

        # Google Sheets information
        sheet_id = '158Riwo1EZS04kVVPqUWs0qpCtqTIbmR5fWAvMkivcB8'  # Replace with your Google Sheets ID
        range_name = 'Sheet1!A2'  # Starting cell for the table data, adjust as needed

        creds = auth()

        # Access the Google Sheets API
        service = build("sheets", "v4", credentials=creds)

        sheet = service.spreadsheets()

        # Clear the entire sheet before updating
        service.spreadsheets().values().clear(spreadsheetId=sheet_id, range="Sheet1!A2:Z").execute()


        # Prepare the data in the required format
        values = [list(row_data.values()) for row_data in table_data]

        # Calculate the row for the total amount
        total_row = len(values) + 2  # +2 because we start at A2 and want one row gap

        # Prepare the data for both updates
        updates = [
            {
                'range': range_name,
                'values': values
            },
            {
                'range': f'Sheet1!I{total_row}:J{total_row}',  # Column I for total amount
                'values': [['Total:', total_amount]]
            }
        ]

        # Prepare the body for the batchUpdate request
        body = {
            'valueInputOption': 'USER_ENTERED',
            'data': updates
        }

        # Execute the batchUpdate request
        result = sheet.values().batchUpdate(
            spreadsheetId=sheet_id,
            body=body
        ).execute()

        response['message'] = 'Data successfully updated in Google Sheets.'
        response['updatedCells'] = result.get('totalUpdatedCells')

    except HttpError as e:
        response['error'] = f"Google Sheets API error: {e}"
    except Exception as e:
        response['error'] = f"Internal error: {e}"

    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response




@app.route('/getUOM', methods=['GET'])
def get_uom():
    response = uom_dao.get_uoms(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getCustomers', methods=['GET'])
def get_customers():
    response = customers_dao.get_customers(connection)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getlists', methods=['GET'])
def get_lists():
    response = {}
    try:
        response['products'] = products_dao.get_all_products(connection)

        response['quotations'] = quotation_dao.get_all_quotation(connection)

    except Exception as e:
        response['error'] = str(e)
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
@app.route('/insertQuotations', methods=['POST'])
def insert_quotation():
    request_payload = json.loads(request.form['data'])
    quotation_id = quotation_dao.insert_new_quotation(connection, request_payload)
    response = jsonify({
        'quotation_id': quotation_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response





@app.route('/getProducts', methods=['GET'])
def get_products():
    response = products_dao.get_all_products(connection)
    response = jsonify(response)

    response.headers.add('Access-Control-Allow-Origin', '*')
    return response




@app.route('/insertProduct', methods=['POST'])
def insert_product():
    request_payload = json.loads(request.form['data'])
    product_id = products_dao.insert_new_product(connection, request_payload)
    response = jsonify({
        'product_id': product_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
@app.route('/insertCustomers', methods=['POST'])
def insert_customer():
    request_payload = json.loads(request.form['data'])
    customer_id = customers_dao.insert_new_customers(connection, request_payload)
    response = jsonify({
        'customer_id': customer_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response





@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    return_id = products_dao.delete_product(connection, request.form['product_id'])
    response = jsonify({
        'product_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
@app.route('/deleteQuotation', methods=['POST'])
def delete_quotation():
    return_id = quotation_dao.delete_quotation_from_db(connection, request.form['quotation_id'])
    response = jsonify({
        'quotation_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if PORT is not set
    print(f"Starting Python Flask Server For Grocery Store Management System on port {port}")
    app.run(host='0.0.0.0', port=port)


