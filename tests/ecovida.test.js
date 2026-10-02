const fs = require("fs");

console.log("=================================");
console.log("PRUEBA DE INTEGRACIÓN ECOVIDA");
console.log("=================================");

const archivo = "JS/ecovida.js";

if (!fs.existsSync(archivo)) {
    throw new Error("No se encontró JS/ecovida.js");
}

console.log("✓ Archivo JS/ecovida.js encontrado");

const codigo = fs.readFileSync(archivo, "utf8");

const funciones = [
    "agregarProducto",
    "mostrarCarrito",
    "vaciarCarrito",
    "guardarPedido"
];

funciones.forEach((funcion) => {
    if (!codigo.includes(`function ${funcion}`)) {
        throw new Error(`No se encontró la función ${funcion}`);
    }

    console.log(`✓ Función ${funcion} encontrada`);
});

if (!codigo.includes("localStorage")) {
    throw new Error("No se encontró el uso de localStorage");
}

console.log("✓ Uso de localStorage encontrado");

console.log("---------------------------------");
console.log("✓ PRUEBA DE INTEGRACIÓN EXITOSA");
console.log("---------------------------------");

// ==============================================================
// 🔑 MICROSERVICIO DE AUTENTICACIÓN REAL (PYTHON + MONGODB)
// ==============================================================

const API_AUTH_URL = "http://localhost:5000/api/login";

/**
 * Procesa el inicio de sesión real enviando datos al backend de Python
 */
function iniciarSesionReal(email, password) {
    let credenciales = {
        correo: email,
        contrasena: password
    };

    fetch(API_AUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credenciales)
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    // Captura el mensaje de error real enviado desde Python y MongoDB Atlas
                    throw new Error(data.error || "Fallo en la autenticación");
                }
                return data;
            });
        })
        .then(function (data) {
            console.log("[JWT] Token de sesión real recibido de Python:", data.token);
            alert("🔑 ¡Bienvenido, " + data.usuario.nombre + "!");

            // Guardamos el token y datos reales de manera persistente en el navegador
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("usuarioLogueado", JSON.stringify(data.usuario));

            // Redirección real a la pantalla principal tras un login exitoso
            window.location.href = "index.html";
        })
        .catch(function (error) {
            console.error("[AUTH ERROR]:", error.message);
            alert("❌ Error de acceso: " + error.message);
        });
}

/**
 * Manejador del evento que captura el envío del formulario HTML de login
 */
function manejarFormularioLogin(evento) {
    evento.preventDefault(); // Evita que la página se recargue por defecto

    let email = document.getElementById("loginEmail").value;
    let contrasena = document.getElementById("loginPassword").value;

    iniciarSesionReal(email, contrasena);
}
