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

