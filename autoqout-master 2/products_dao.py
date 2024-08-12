from flask import Flask, request, jsonify
from sql_connection import get_sql_connection
import os
app = Flask(__name__)


def get_all_products(connection):
    cursor = connection.cursor()
    query = (
        "SELECT products.product_id, products.name, products.uom_id, products.price_per_unit,products.description,  products.category, uom.uom_name "
        "FROM products INNER JOIN uom ON products.uom_id=uom.uom_id")
    cursor.execute(query)
    response = []
    for (product_id, name, uom_id, price_per_unit,description, category, uom_name) in cursor:
        response.append({
            'product_id': product_id,
            'name': name,
            'uom_id': uom_id,
            'price_per_unit': price_per_unit,
            'description': description,
            'category': category,
            'uom_name': uom_name
        })
    return response


def insert_new_product(connection, product):
    cursor = connection.cursor()
    if product['product_id'] == '0' or product['product_id'] == 0:
        query = ("INSERT INTO products "
                 "(name, uom_id, price_per_unit, description, category) "
                 "VALUES (%s, %s, %s, %s, %s)")
        data = (product['product_name'], product['uom_id'], product['price_per_unit'], product['description'],
                product['category'])
        cursor.execute(query, data)
        connection.commit()
        return cursor.lastrowid
    else:
        query = (
            "UPDATE products SET name = %s, uom_id = %s, price_per_unit = %s, description = %s, category = %s WHERE product_id = %s")
        data = (product['product_name'], product['uom_id'], product['price_per_unit'], product['description'],
                product['category'], product['product_id'])
        cursor.execute(query, data)
        connection.commit()
        return product['product_id']


def delete_product(connection, product_id):
    cursor = connection.cursor()
    query = ("DELETE FROM products where product_id=" + str(product_id))
    cursor.execute(query)
    connection.commit()

    return cursor.lastrowid


@app.route('/getProducts', methods=['GET'])
def get_products():
    connection = get_sql_connection()
    response = get_all_products(connection)
    return jsonify(response)
@app.route('/getQuotations', methods=['GET'])


@app.route('/insertProduct', methods=['POST'])
def insert_product():
    request_payload = request.json['data']
    connection = get_sql_connection()
    product_id = insert_new_product(connection, request_payload)
    return jsonify({
        'product_id': product_id
    })


@app.route('/deleteProduct', methods=['POST'])
def delete_product_route():
    request_payload = request.json
    connection = get_sql_connection()
    product_id = delete_product(connection, request_payload['product_id'])
    return jsonify({
        'product_id': product_id
    })


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
