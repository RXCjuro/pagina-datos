document.addEventListener('DOMContentLoaded', function () {
    const btnSuscribirse = document.getElementById('btnSuscribirse');

    if (btnSuscribirse) {
        btnSuscribirse.addEventListener('click', async function () {
            const emailInput = document.getElementById('correoSuscripcion').value.trim();
            const aceptoTerminos = document.getElementById('aceptoTerminos').checked;
            const mensajeEl = document.getElementById('mensajeSuscripcion');

            // 1. Validaciones
            if (!emailInput || !emailInput.includes('@')) {
                mensajeEl.innerText = "Por favor, ingresa un correo válido.";
                mensajeEl.style.color = "red";
                return;
            }

            if (!aceptoTerminos) {
                mensajeEl.innerText = "Debes aceptar los términos para suscribirte.";
                mensajeEl.style.color = "red";
                return;
            }

            mensajeEl.innerText = "Guardando en Azure...";
            mensajeEl.style.color = "blue";

            // 2. URL de tu Logic App de Azure
            // REEMPLAZA ESTA CADENA POR LA HTTP POST URL GENERADA EN AZURE
            const LOGIC_APP_URL = "https://prod-19.brazilsouth.logic.azure.com:443/workflows/c86a15a693324b12bc56fa75cfa59bbb/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=sBCUN1o-2yVMc2_z0KSRvkckklr7D5QQltZuJfbuocY";

            try {
                // 3. Envío HTTP POST a la Logic App
                const response = await fetch(LOGIC_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailInput })
                });

                if (response.ok || response.status === 202) {
                    mensajeEl.innerText = "¡Gracias por suscribirte a EcoVida!";
                    mensajeEl.style.color = "green";
                    
                    // Limpiar el formulario
                    document.getElementById('correoSuscripcion').value = "";
                    document.getElementById('aceptoTerminos').checked = false;
                } else {
                    mensajeEl.innerText = "Error al conectar con Azure Table Storage.";
                    mensajeEl.style.color = "red";
                }
            } catch (err) {
                console.error(err);
                mensajeEl.innerText = "Error de red al intentar enviar los datos.";
                mensajeEl.style.color = "red";
            }
        });
    }
});