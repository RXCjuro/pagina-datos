import datetime
import os  # Inclusión obligatoria para consumir las Environment Variables de Render
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt

app = Flask(__name__)
# CORS habilitado de manera global para permitir peticiones HTTP distribuidas
CORS(app) 

# ==========================================================================
# CONFIGURACIÓN ARQUITECTURA CLOUD SEGURA (RENDER ENVIRONMENT)
# ==========================================================================
# Si el código corre en Render, leerá las KEYs del panel web. Si corre en local, usa el respaldo.
MONGO_URI = os.getenv(
    "MONGO_URI", 
    "mongodb+srv://gluuglee_db_user:Ecovida2025@cluster0.thne8oy.mongodb.net/?appName=Cluster0"
)
SECRET_KEY = os.getenv(
    "SECRET_KEY", 
    "LLAVE_SECRETA_SUPER_SEGURA_ECOVIDA"
)

try:
    # Inicialización del cliente de persistencia NoSQL apuntando a MongoDB Atlas
    client = MongoClient(MONGO_URI)
    db = client['ecovida_db']           
    usuarios_col = db['usuarios']       
    print("✅ Conexión exitosa y en producción con MongoDB Atlas.")
except Exception as e:
    print(f"❌ Error crítico de conexión a MongoDB Atlas: {e}")

# ==========================================
# ENDPOINT 1: ALTA DE IDENTIDADES (REGISTER)
# ==========================================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "No se recibieron datos en la petición"}), 400

        nombre = datos.get('nombre')
        email = datos.get('correo')
        password = datos.get('contrasena')

        if not nombre or not email or not password:
            return jsonify({"error": "Todos los campos son obligatorios"}), 400

        # Verificación perimetral en la nube de Atlas para mitigar registros duplicados
        if usuarios_col.find_one({"correo": email}):
            return jsonify({"error": "El correo ya se encuentra registrado"}), 400

        # Encriptación criptográfica asimétrica (Salt Hashing) usando bcrypt
        salt = bcrypt.gensalt()
        password_encriptada = bcrypt.hashpw(password.encode('utf-8'), salt)

        nuevo_usuario = {
            "nombre": nombre,
            "correo": email,
            "contrasena": password_encriptada # Se persiste el hash binario seguro
        }
        
        usuarios_col.insert_one(nuevo_usuario)
        return jsonify({"message": "Usuario registrado exitosamente en MongoDB Atlas"}), 201

    except Exception as e:
        return jsonify({"error": f"Error interno en el servidor: {str(e)}"}), 500

# ==========================================
# ENDPOINT 2: MÓDULO DE ACCESO JWT (LOGIN)
# ==========================================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        datos = request.json
        if not datos:
            return jsonify({"error": "No se recibieron credenciales"}), 400

        email = datos.get('correo')
        password = datos.get('contrasena')

        if not email or not password:
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        # Búsqueda indexada en el clúster NoSQL de Atlas
        usuario = usuarios_col.find_one({"correo": email})

        # Evaluación segura del Hash binario almacenado
        if usuario and bcrypt.checkpw(password.encode('utf-8'), usuario['contrasena']):
            
            # Generación del JSON Web Token real con tiempo de expiración (2 horas)
            payload = {
                'correo': usuario['correo'],
                'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=2)
            }
            
            # Codificación explícita en formato string (UTF-8) compatible con PyJWT moderno
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')

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
    # Lanzamiento del backend en el puerto operacional 5000 para mapeo local
    app.run(debug=True, port=5000)
