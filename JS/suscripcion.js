document.addEventListener('DOMContentLoaded', function () {
    const boton = document.getElementById('btnSuscribirse');
    if (!boton) return;

    boton.addEventListener('click', function () {
        const correo = document.getElementById('correoSuscripcion').value.trim();
        const acepto = document.getElementById('aceptoTerminos').checked;
        const mensaje = document.getElementById('mensajeSuscripcion');

        const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

        if (!formatoValido) {
            mensaje.textContent = 'Ingresa un correo válido.';
            return;
        }

        if (!acepto) {
            mensaje.textContent = 'Debes aceptar el uso de tu correo.';
            return;
        }

        mensaje.textContent = 'Correo recibido: ' + correo + ' (aún sin guardar)';
    });
});