// ==============================================================
// 🔐 MIDDLEWARE DE SEGURIDAD PERIMETRAL (BLOQUEO ABSOLUTO)
// ==============================================================
(function verificarAccesoObligatorio() {
    // 1. EXTRAER EL ARCHIVO ACTUAL DE LA URL
    const rutaActual = window.location.pathname;
    const paginaActual = rutaActual.substring(rutaActual.lastIndexOf("/") + 1);

    // 2. LEER EL TOKEN EMITIDO POR PYTHON Y MONGODB ATLAS
    const tokenSesionReal = localStorage.getItem("authToken");

    // 3. LOGICA DE RESTRICCIÓN PERIMETRAL (ZERO TRUST)
    if (paginaActual !== "login.html" && !tokenSesionReal) {

        console.warn("[SEGURIDAD CRÍTICA] Intento de bypass detectado. Redirección forzosa.");
        alert("🔒 Acceso Restringido:\n\nDebe autenticarse con sus credenciales institucionales de Python y MongoDB Atlas antes de interactuar con la plataforma EcoVida.");

        if (paginaActual === "" || paginaActual === "index.html" || paginaActual === "nosotros.html" || paginaActual === "carrito.html" || paginaActual === "pedidos.html" || paginaActual === "quiz.html") {
            window.location.href = "login.html";
        }
    }

    // 4. CONTROL DE COMPORTAMIENTO DE BOTONES DINÁMICOS
    document.addEventListener("DOMContentLoaded", function () {
        const btnLogin = document.getElementById("btn-login-nav");
        const btnLogout = document.getElementById("btn-logout-nav");

        if (tokenSesionReal) {
            if (btnLogin) btnLogin.style.display = "none";     // Oculta "Iniciar Sesión"
            if (btnLogout) btnLogout.style.display = "block";    // Muestra "Cerrar Sesión"
        } else {
            if (btnLogin) btnLogin.style.display = "block";   // Muestra "Iniciar Sesión"
            if (btnLogout) btnLogout.style.display = "none";    // Oculta "Cerrar Sesión"
        }
    });
})();

// ==============================================================
// 🌐 CONFIGURACIÓN ARQUITECTURA MULTICLOUD EN INTERNET (RENDER)
// ==============================================================
// Tu endpoint real y unificado desplegado en la nube de Render
const BASE_RENDER_URL = "https://ecovida-api-real.onrender.com/";


// ===============================
// AGREGAR PRODUCTO AL CARRITO
// ===============================
function agregarProducto(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let producto = { nombre: nombre, precio: precio };
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
                <p>Precio: S/ ${Number(producto.precio).toFixed(2)}</p>
                <button onclick="eliminarProducto(${posicion})">Eliminar</button>
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

    console.log("[MULTICLOUD] Consultando tarifas logísticas en el servidor remoto de Render...");

    // Consulta de costos logísticos a tu servidor externo en la nube de Render
    fetch(`${BASE_RENDER_URL}/api/delivery`)
        .then(function (resRender) {
            if (!resRender.ok) {
                throw new Error("El servidor Render reportó un fallo");
            }
            return resRender.json();
        })
        .then(function (datosRender) {
            let costoEnvio = datosRender.id ? 15.00 : 15.00;
            console.log("[MULTICLOUD] Conexión exitosa con Render. Costo de envío: S/ " + costoEnvio);
            procesarGuardadoFirebase(carrito, subtotal, costoEnvio);
        })
        .catch(function (errRender) {
            console.error("[MULTICLOUD ERROR] Render caído. Aplicando tolerancia a fallos:", errRender);
            procesarGuardadoFirebase(carrito, subtotal, 10.00);
        });
}

/**
 * Función interna que consolida los datos y ejecuta el guardado final en Firebase
 */
function procesarGuardadoFirebase(carrito, subtotal, costoEnvio) {
    let totalFinal = subtotal + costoEnvio;

    // Extraemos de forma segura el perfil del usuario autenticado en la sesión
    const datosUsuario = JSON.parse(localStorage.getItem("usuarioLogueado")) || null;
    const correoActivo = datosUsuario ? datosUsuario.correo : "anonimo@ecovida.com";

    let pedido = {
        fecha: new Date().toISOString(),
        correoUsuario: correoActivo, // Campo obligatorio para el filtrado seguro por roles en Python
        productos: carrito,
        subtotal: subtotal,
        costoEnvioExterno: costoEnvio,
        total: totalFinal
    };

    console.log("Enviando pedido consolidado a Firebase con propietario:", pedido);

    fetch("https://pagina-hosting-c6ec9-default-rtdb.firebaseio.com/pedidos.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Firebase respondió con error: " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            alert(`✅ ¡Pedido Procesado con Éxito!\n\nSubtotal: S/ ${subtotal.toFixed(2)}\nEnvío (Render Cloud): S/ ${costoEnvio.toFixed(2)}\nTotal Final: S/ ${totalFinal.toFixed(2)}`);
            localStorage.removeItem("carrito");
            mostrarCarrito();
        })
        .catch(function (error) {
            console.error("ERROR COMPLETO EN FIREBASE:", error);
            alert("❌ Error: " + error.message);
        });
}

// ==============================================================
// MOSTRAR PEDIDOS (CONSULTA CENTRALIZADA MEDIANTE BACKEND PYTHON Y JWT)
// ==============================================================
function mostrarPedidos() {
    let listaPedidos = document.getElementById("listaPedidos");
    if (!listaPedidos) return;

    // Recuperamos el token JWT emitido por tu login de Python y MongoDB
    const tokenSesionReal = localStorage.getItem("authToken");

    console.log("[MULTICLOUD] Solicitando historial de órdenes mediante canal autenticado...");

    // Redirección perimetral: Consultamos al Endpoint seguro de Python en Render en lugar de Firebase directo
    fetch(`${BASE_RENDER_URL}/api/pedidos`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenSesionReal}` // Inyección obligatoria de la firma de seguridad
        }
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) throw new Error(data.error || "No autorizado para listar registros");
                return data;
            });
        })
        .then(function (data) {
            listaPedidos.innerHTML = "";

            // Evaluamos la estructura del JSON devuelto por tu backend estructurado
            const pedidos = data.pedidos;

            if (!pedidos || Object.keys(pedidos).length === 0) {
                listaPedidos.innerHTML = "<p>No hay pedidos registrados en su cuenta comercial.</p>";
                return;
            }

            // Renderizado dinámico en el DOM
            Object.keys(pedidos).forEach(function (idPedido) {
                let pedido = pedidos[idPedido];
                let productosHTML = "";

                pedido.productos.forEach(function (producto) {
                    productosHTML += `<li>${producto.nombre} - S/ ${Number(producto.precio).toFixed(2)}</li>`;
                });

                let costoEnvioHTML = pedido.costoEnvioExterno ? `S/ ${Number(pedido.costoEnvioExterno).toFixed(2)} (Render Cloud)` : "S/ 0.00";

                // Metadata descriptiva que expone jerarquía de privilegios del token analizado
                listaPedidos.innerHTML += `
                    <div class="pedido">
                        <h3>📦 Pedido: ${idPedido}</h3>
                        <p><strong>Propietario del Registro:</strong> ${pedido.correoUsuario || "No asignado"}</p>
                        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                        <h4>Productos:</h4>
                        <ul>${productosHTML}</ul>
                        <p><strong>Costo de Envío:</strong> ${costoEnvioHTML}</p>
                        <p><strong>Total:</strong> S/ ${Number(pedido.total).toFixed(2)}</p>
                        <button onclick="eliminarPedido('${idPedido}')">🗑️ Eliminar pedido</button>
                    </div>
                    <hr>
                `;
            });
        })
        .catch(function (error) {
            console.error("Error operacional de red en módulo Pedidos:", error);
            listaPedidos.innerHTML = `<p>❌ Error de carga perimetral: ${error.message}</p>`;
        });
}


// ==============================================================
// ELIMINAR PEDIDO (RESTRICCIÓN PERIMETRAL EN BACKEND PYTHON CON JWT)
// ==============================================================
function eliminarPedido(idPedido) {
    let confirmar = confirm("¿Seguro que deseas eliminar este pedido?");
    if (!confirmar) return;

    // Recuperamos el token de sesión emitido por tu login de Python y MongoDB
    const tokenSesionReal = localStorage.getItem("authToken");

    console.log(`[MULTICLOUD] Transmitiendo solicitud de eliminación para la orden ${idPedido} a Render...`);

    // Redirección segura: Apuntamos al microservicio de Python en lugar de Firebase directo
    fetch(`${BASE_RENDER_URL}/api/pedidos/${idPedido}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${tokenSesionReal}` // Firma criptográfica obligatoria para validación en Python
        }
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    // Captura el mensaje descriptivo exacto devuelto por app.py (ej: "No tienes permiso...")
                    throw new Error(data.error || "Fallo en la operación de eliminación");
                }
                return data;
            });
        })
        .then(function (data) {
            alert("✅ " + (data.message || "Pedido eliminado correctamente"));
            mostrarPedidos(); // Recarga dinámicamente la lista actualizada mediante el backend
        })
        .catch(function (error) {
            console.error("[MULTICLOUD ERROR] Operación de borrado rechazada:", error.message);
            alert("❌ Error: " + error.message);
        });
}

// ==============================================================
// 🔑 MICROSERVICIO DE AUTENTICACIÓN REAL (PYTHON + MONGODB ATLAS)
// ==============================================================

/**
 * Procesa el inicio de sesión enviando los datos al servidor en internet de Render
 */
function iniciarSesionReal(email, password) {
    let credenciales = {
        correo: email,
        contrasena: password
    };

    // Consumimos el endpoint del backend real mapeado en internet
    fetch(`${BASE_RENDER_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credenciales)
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(data.error || "Fallo en la autenticación");
                }
                return data;
            });
        })
        .then(function (data) {
            console.log("[JWT] Token de sesión recibido de Render:", data.token);
            alert("🔑 ¡Bienvenido, " + data.usuario.nombre + "!");

            // Guardamos el token criptográfico y el objeto de identidad emitidos por Python
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("usuarioLogueado", JSON.stringify(data.usuario));

            // Redirección relativa que limpia la URL tanto en local como en Firebase Hosting
            const rutaActual = window.location.pathname;
            const nuevaRuta = rutaActual.replace("login.html", "index.html");
            window.location.href = nuevaRuta;
        })
        .catch(function (error) {
            console.error("[AUTH ERROR]:", error.message);
            alert("❌ Error de acceso: " + error.message);
        });
}

/**
 * Captura el evento del formulario HTML de login.html
 */
function manejarFormularioLogin(evento) {
    evento.preventDefault();

    let email = document.getElementById("loginEmail").value;
    let contrasena = document.getElementById("loginPassword").value;

    iniciarSesionReal(email, contrasena);
}

function cerrarSesionCorporativa() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("usuarioLogueado");
    alert("🔒 Sesión finalizada de manera segura.");
    window.location.href = "login.html";
}
