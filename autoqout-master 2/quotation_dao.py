from flask import Flask, request, jsonify
from sql_connection import get_sql_connection

app = Flask(__name__)

# Function to fetch all quotations from the database


# Endpoint to fetch all quotations

def get_all_quotation(connection):
    cursor = connection.cursor()
    query = (
        "SELECT quotation_id,product, length, height, depth, location, description, total_price,quantity "
        "FROM quotationlist"
    )
    cursor.execute(query)
    response = []
    for (quotation_id,product, length, height, depth, location, description, total_price,quantity) in cursor:
        response.append({
            'quotation_id': quotation_id,
            'product': product,
            'length': length,
            'height': height,
            'depth': depth,
            'location': location,
            'description': description,
            'total_price': total_price,
            'quantity': quantity
        })
    return response
# Function to insert a new quotation into the database
def insert_new_quotation(connection, quotation):
    cursor = connection.cursor()
    if quotation['quotation_id'] == '0' or quotation['quotation_id'] == 0:
        query = ("INSERT INTO quotationlist "
                 "(product, length, height, depth, location, description, discount_colour, total_price,quantity) "
                 "VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s)")
        data = (quotation['product'], quotation['length'], quotation['height'], quotation['depth'],
                quotation['location'], quotation['description'], quotation['discount_colour'], quotation['total_price'],quotation['quantity'])
        cursor.execute(query, data)
        connection.commit()
        return cursor.lastrowid
    else:
        query = ("UPDATE quotationlist SET product = %s, length = %s, height = %s, depth = %s, location = %s, "
                 "description = %s, discount_colour = %s, total_price = %s,quantity = %s WHERE quotation_id = %s")
        data = (quotation['product'], quotation['length'], quotation['height'], quotation['depth'],
                quotation['location'], quotation['description'], quotation['discount_colour'], quotation['total_price'],quotation['quantity'],
                quotation['quotation_id'])
        cursor.execute(query, data)
        connection.commit()
        return quotation['quotation_id']

def delete_quotation_from_db(connection, quotation_id):
    cursor = connection.cursor()
    query = "DELETE FROM quotationlist WHERE quotation_id = %s"
    cursor.execute(query, (quotation_id,))
    connection.commit()
    return cursor.lastrowid


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
