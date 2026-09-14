// Mostrar mensaje de bienvenida
function mostrarMensaje() {
    alert("Bienvenido a EcoVida 🌱");
}


// Agregar producto al carrito
function agregarProducto(nombre, precio) {

    // Obtener el carrito guardado
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Crear producto
    let producto = {
        nombre: nombre,
        precio: precio
    };

    // Agregar producto
    carrito.push(producto);

    // Guardar carrito
    localStorage.setItem("carrito", JSON.stringify(carrito));

    alert(nombre + " fue agregado al carrito 🛒");
}


// Mostrar productos del carrito
function mostrarCarrito() {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let lista = document.getElementById("listaCarrito");

    let total = 0;

    lista.innerHTML = "";

    // Verificar si el carrito está vacío
    if (carrito.length === 0) {

        lista.innerHTML = "<p>El carrito está vacío.</p>";

        document.getElementById("total").textContent = "0.00";

        return;
    }


    // Mostrar cada producto
    carrito.forEach(function(producto, posicion) {

        lista.innerHTML += `
            <div class="producto-carrito">

                <h3>${producto.nombre}</h3>

                <p>Precio: S/ ${producto.precio.toFixed(2)}</p>

                <button onclick="eliminarProducto(${posicion})">
                    Eliminar
                </button>

            </div>

            <hr>
        `;

        total = total + producto.precio;

    });


    // Mostrar total
    document.getElementById("total").textContent = total.toFixed(2);
}


// Eliminar producto
function eliminarProducto(posicion) {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    carrito.splice(posicion, 1);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarCarrito();
}


// Vaciar todo el carrito
function vaciarCarrito() {

    localStorage.removeItem("carrito");

    mostrarCarrito();
}