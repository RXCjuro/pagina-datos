import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt

app = Flask(__name__)
# CORS es obligatorio para permitir que tu login.html (Hosting/Local) se comunique con Python
CORS(app) 


MONGO_URI = "mongodb+srv://gluuglee_db_user:Ab123456$$ga@cluster0.thne8oy.mongodb.net/?appName=Cluster0"
SECRET_KEY = "LLAVE_SECRETA_SUPER_SEGURA_ECOVIDA" # Llave para firmar tus tokens JWT reales

try:
    # Inicializamos el cliente de MongoDB apuntando a la nube
    client = MongoClient(MONGO_URI)
    db = client['ecovida_db']           # Nombre de tu base de datos en Atlas
    usuarios_col = db['usuarios']       # Colección donde se guardarán los usuarios reales
    print("✅ Conexión exitosa y en producción con MongoDB Atlas.")
except Exception as e:
    print(f"❌ Error crítico de conexión a MongoDB Atlas: {e}")

# ==========================================
# ENDPOINT 1: REGISTRO DE USUARIOS REALES
# ==========================================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        datos = request.json
        nombre = datos.get('nombre')
        email = datos.get('correo')
        password = datos.get('contrasena')

        if not nombre or not email or not password:
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

        # Validación real en MongoDB Atlas para evitar correos duplicados
        if usuarios_col.find_one({"correo": email}):
            return jsonify({"error": "El correo ya se encuentra registrado"}), 400

        # Encriptación real y segura de la contraseña con bcrypt antes de guardarla
        salt = bcrypt.gensalt()
        password_encriptada = bcrypt.hashpw(password.encode('utf-8'), salt)

        nuevo_usuario = {
            "nombre": nombre,
            "correo": email,
            "contrasena": password_encriptada # Almacenamos el Hash binario seguro
        }
        
        usuarios_col.insert_one(nuevo_usuario)
        return jsonify({"message": "Usuario registrado exitosamente en MongoDB Atlas"}), 201

    except Exception as e:
        return jsonify({"error": f"Error interno en el servidor: {str(e)}"}), 500

# ==========================================
# ENDPOINT 2: INICIO DE SESIÓN REAL (LOGIN)
# ==========================================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        datos = request.json
        email = datos.get('correo')
        password = datos.get('contrasena')

        if not email or not password:
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        # Buscamos el documento del usuario en la nube de Atlas
        usuario = usuarios_col.find_one({"correo": email})

        # Comparamos la contraseña escrita con el Hash encriptado guardado
        if usuario and bcrypt.checkpw(password.encode('utf-8'), usuario['contrasena']):
            
            # Generamos un Token JWT real firmado digitalmente válido por 2 horas
            token = jwt.encode({
                'correo': usuario['correo'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
            }, SECRET_KEY, algorithm='HS256')

            return jsonify({
                "message": "Autenticación válida",
                "usuario": {
                    "nombre": usuario['nombre'],
                    "correo": usuario['correo']
                },
                "token": token
            }), 200
        else:
            return jsonify({"error": "Correo o contraseña incorrectos"}), 401

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500

if __name__ == '__main__':
    # Arranca el servidor local de Python en el puerto 5000
    app.run(debug=True, port=5000)
