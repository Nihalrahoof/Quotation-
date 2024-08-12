import os
import mysql.connector

__cnx = None

def get_sql_connection():
    print("Opening mysql connection")
    global __cnx

    if __cnx is None:
        __cnx = mysql.connector.connect(
            host="mysql.railway.internal",
            user="root",
            password="uczUSvprdjEqrnTuBMbsfTKnAphPAyeV",
            database="railway"
        )

    return __cnx
