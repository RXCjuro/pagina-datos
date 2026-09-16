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

// ===============================
// GUARDAR PEDIDO EN FIREBASE
// ===============================

function guardarPedido() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    let total = 0;

    carrito.forEach(function (producto) {
        total = total + Number(producto.precio);
    });

    let pedido = {
        fecha: new Date().toISOString(),
        productos: carrito,
        total: total
    };

    console.log("Enviando pedido:", pedido);

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

            console.log("Pedido guardado:", data);

            alert("✅ Pedido guardado correctamente");

            localStorage.removeItem("carrito");

            mostrarCarrito();
        })
        .catch(function (error) {

            console.error("ERROR COMPLETO:", error);

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