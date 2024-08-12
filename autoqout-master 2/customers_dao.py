from flask import Flask, request, jsonify
from sql_connection import get_sql_connection

app = Flask(__name__)


def get_customers(connection):
    cursor = connection.cursor()
    query = ("SELECT customer_name, customer_total "
        "FROM customers")
    cursor.execute(query)
    response = []
    for (customer_name, customer_total) in cursor:
        response.append({
            'customer_name': customer_name,
            'description': customer_total
        })
    return response


def insert_new_customers(connection, customer):
    cursor = connection.cursor()


    query = ("INSERT INTO customers "
             "(customer_name, customer_number, discount_colour,customer_place)"
             "VALUES (%s, %s, %s,%s)")
    data = (customer['customer_name'], customer['customer_number'], customer['discount_colour'], customer['customer_place'],
            )




    cursor.execute(query, data)
    connection.commit()

    return cursor.lastrowid








if __name__ == '__main__':
    app.run(debug=True)
