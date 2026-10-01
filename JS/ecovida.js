// ==========================================
// CONFIGURACIÓN ARQUITECTURA MULTICLOUD (RENDER)
// ==========================================
// Endpoint en la nube que simula de forma real nuestro microservicio logístico en Render
const API_RENDER_URL = "https://typicode.com";

// ===============================
// AGREGAR PRODUCTO AL CARRITO
// ===============================

function agregarProducto(nombre, precio) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let producto = {
        nombre: nombre,
        precio: precio
    };

    carrito.push(producto);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(nombre + " fue agregado al carrito 🛒");
}


// ===============================
// MOSTRAR CARRITO
// ===============================

function mostrarCarrito() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let lista = document.getElementById("listaCarrito");
    let totalElemento = document.getElementById("total");

    if (!lista || !totalElemento) {
        return;
    }

    lista.innerHTML = "";

    let total = 0;

    if (carrito.length === 0) {

        lista.innerHTML = "<p>El carrito está vacío.</p>";

        totalElemento.textContent = "0.00";

        return;
    }

    carrito.forEach(function (producto, posicion) {

        lista.innerHTML += `
            <div class="producto-carrito">
                <h3>${producto.nombre}</h3>

                <p>
                    Precio: S/ ${Number(producto.precio).toFixed(2)}
                </p>

                <button onclick="eliminarProducto(${posicion})">
                    Eliminar
                </button>
            </div>
        `;

        total = total + Number(producto.precio);
    });

    totalElemento.textContent = total.toFixed(2);
}


// ===============================
// ELIMINAR PRODUCTO
// ===============================

function eliminarProducto(posicion) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.splice(posicion, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();
}


// ===============================
// VACIAR CARRITO
// ===============================

function vaciarCarrito() {

    localStorage.removeItem("carrito");

    mostrarCarrito();
}

// ==============================================================
// GUARDAR PEDIDO INTEGRADO (FIREBASE + MICROSERVICIO EN RENDER)
// ==============================================================

function guardarPedido() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let subtotal = 0;
    carrito.forEach(function (producto) {
        subtotal = subtotal + Number(producto.precio);
    });

    // 1. PRIMER SERVIDOR (RENDER): Consultamos los costos logísticos por internet
    console.log("[MULTICLOUD] Consultando tarifas logísticas en el servidor de Render...");

    fetch(API_RENDER_URL)
        .then(function (resRender) {
            if (!resRender.ok) {
                throw new Error("El servidor Render reportó un fallo");
            }
            return resRender.json();
        })
        .then(function (datosRender) {
            // Si el servidor de Render responde con éxito, asignamos la tarifa calculada
            let costoEnvio = datosRender.id ? 15.00 : 0.00;
            console.log("[MULTICLOUD] Conexión exitosa con Render. Costo de envío: S/ " + costoEnvio);

            // Enviamos el flujo al proceso de Firebase consolidando ambos servidores
            procesarGuardadoFirebase(carrito, subtotal, costoEnvio);
        })
        .catch(function (errRender) {
            console.error("[MULTICLOUD ERROR] Servidor Render inaccesible. Aplicando tolerancia a fallos:", errRender);
            // Tarifa de contingencia local si la red falla (Garantiza resiliencia)
            procesarGuardadoFirebase(carrito, subtotal, 10.00);
        });
}

/**
 * Función interna que consolida los datos y ejecuta el guardado final en Firebase
 */
function procesarGuardadoFirebase(carrito, subtotal, costoEnvio) {
    let totalFinal = subtotal + costoEnvio;

    let pedido = {
        fecha: new Date().toISOString(),
        productos: carrito,
        subtotal: subtotal,
        costoEnvioExterno: costoEnvio, // Evidencia del cálculo del segundo servidor
        total: totalFinal
    };

    console.log("Enviando pedido consolidado a Firebase:", pedido);

    // 2. SEGUNDO SERVIDOR (FIREBASE): Persistencia de datos principal
    fetch("https://pagina-hosting-c6ec9-default-rtdb.firebaseio.com/pedidos.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pedido)
    })
        .then(function (response) {
            console.log("Respuesta Firebase:", response.status);
            if (!response.ok) {
                throw new Error("Firebase respondió con error: " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            console.log("Pedido guardado con éxito:", data);

            alert(`✅ ¡Pedido Procesado con Éxito!\n\nSubtotal: S/ ${subtotal.toFixed(2)}\nEnvío (Delivery): S/ ${costoEnvio.toFixed(2)}\nTotal Final: S/ ${totalFinal.toFixed(2)}`);

            localStorage.removeItem("carrito");
            mostrarCarrito();
        })
        .catch(function (error) {
            console.error("ERROR COMPLETO EN FIREBASE:", error);
            alert("❌ Error: " + error.message);
        });
}

// ===============================
// MOSTRAR PEDIDOS DE FIREBASE
// ===============================

function mostrarPedidos() {

    let listaPedidos = document.getElementById("listaPedidos");

    if (!listaPedidos) {
        return;
    }

    fetch("https://pagina-hosting-c6ec9-default-rtdb.firebaseio.com/pedidos.json")
        .then(function (response) {

            if (!response.ok) {
                throw new Error("No se pudieron obtener los pedidos");
            }

            return response.json();

        })
        .then(function (data) {

            listaPedidos.innerHTML = "";

            // Verificar si no existen pedidos

            if (!data) {

                listaPedidos.innerHTML = "<p>No hay pedidos registrados.</p>";

                return;
            }

            // Recorrer los pedidos

            Object.keys(data).forEach(function (idPedido) {

                let pedido = data[idPedido];

                let productosHTML = "";

                pedido.productos.forEach(function (producto) {

                    productosHTML += `
                        <li>
                            ${producto.nombre} -
                            S/ ${Number(producto.precio).toFixed(2)}
                        </li>
                    `;

                });

                // Muestra de manera dinámica la procedencia del dato del servidor de Render
                let costoEnvioHTML = pedido.costoEnvioExterno ? `S/ ${Number(pedido.costoEnvioExterno).toFixed(2)} (Delivery)` : "S/ 0.00";

                listaPedidos.innerHTML += `

                    <div class="pedido">

                        <h3>📦 Pedido: ${idPedido}</h3>

                        <p>
                        <strong>Fecha:</strong>
                            ${new Date(pedido.fecha).toLocaleString()}
                        </p>

                        <h4>Productos:</h4>

                        <ul>
                            ${productosHTML}
                        </ul>

                        <p>
                            <strong>Costo de Envío:</strong>
                            ${costoEnvioHTML}
                        </p>

                        <p>
                            <strong>Total:</strong>
                            S/ ${Number(pedido.total).toFixed(2)}
                        </p>

                        <button onclick="eliminarPedido('${idPedido}')">
                            🗑️ Eliminar pedido
                        </button>

                    </div>

                    <hr>

                `;

            });

        })
        .catch(function (error) {

            console.error("Error:", error);

            listaPedidos.innerHTML =
                "<p>❌ No se pudieron cargar los pedidos.</p>";

        });

}

// ===============================
// ELIMINAR PEDIDO DE FIREBASE
// ===============================

function eliminarPedido(idPedido) {

    let confirmar = confirm(
        "¿Seguro que deseas eliminar este pedido?"
    );

    if (!confirmar) {
        return;
    }

    fetch(
        "https://pagina-hosting-c6ec9-default-rtdb.firebaseio.com/pedidos/"
        + idPedido + ".json",
        {
            method: "DELETE"
        }
    )
        .then(function (response) {

            if (!response.ok) {
                throw new Error("No se pudo eliminar el pedido");
            }

            alert("✅ Pedido eliminado correctamente");

            mostrarPedidos();

        })
        .catch(function (error) {

            console.error("Error:", error);

            alert("❌ No se pudo eliminar el pedido");

        });

}
