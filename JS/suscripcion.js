
document.addEventListener('DOMContentLoaded', function () {
    const formulario = document.getElementById('formularioSuscripcion');
    const correoInput = document.getElementById('correoSuscripcion');
    const aceptoTerminos = document.getElementById('aceptoTerminos');
    const btnSuscribirse = document.getElementById('btnSuscribirse');
    const mensajeEl = document.getElementById('mensajeSuscripcion');

    if (!formulario || !correoInput || !aceptoTerminos ||
        !btnSuscribirse || !mensajeEl) {
        return;
    }

    formulario.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = correoInput.value.trim();

        if (!correoInput.validity.valid || !email) {
            mensajeEl.textContent = 'Por favor, ingresa un correo válido.';
            mensajeEl.style.color = '#c62828';
            return;
        }

        if (!aceptoTerminos.checked) {
            mensajeEl.textContent =
                'Debes aceptar los términos para suscribirte.';
            mensajeEl.style.color = '#c62828';
            return;
        }

        mensajeEl.textContent = 'Enviando tu suscripción...';
        mensajeEl.style.color = '#3465a4';
        btnSuscribirse.disabled = true;

        // Conserva aquí tu URL actual de Azure.
        const LOGIC_APP_URL = "https://prod-19.brazilsouth.logic.azure.com:443/workflows/c86a15a693324b12bc56fa75cfa59bbb/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=sBCUN1o-2yVMc2_z0KSRvkckklr7D5QQltZuJfbuocY";

        try {
            const response = await fetch(LOGIC_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                mensajeEl.textContent =
                    '¡Gracias por suscribirte a EcoVida!';
                mensajeEl.style.color = '#26743a';

                formulario.reset();
            } else {
                mensajeEl.textContent =
                    'No se pudo guardar la suscripción. Inténtalo nuevamente.';
                mensajeEl.style.color = '#c62828';
            }
            
        } catch (error) {
            console.error('Error al enviar la suscripción:', error);

            mensajeEl.textContent =
                'Error de conexión. Comprueba tu internet e inténtalo nuevamente.';
            mensajeEl.style.color = '#c62828';
        } finally {
            btnSuscribirse.disabled = false;
        }
    });
});
