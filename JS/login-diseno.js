/* ==========================================================================
   INTERACTIVIDAD DE DISEÑO PREMIUM - ECOVIDA AUTH
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // 1. INICIALIZACIÓN DEL FONDO ANIMADO DE PARTÍCULAS (CANVAS)
    crearFondoParticulas();

    // 2. ANIMACIÓN DE TRANSICIÓN ULTRA FLUIDA PARA LAS PESTAÑAS (TABS)
    configurarTransicionesTabs();
});

/**
 * Genera un fondo animado de partículas matemáticas flotantes
 * imitando un ecosistema digital orgánico y sutil.
 */
function crearFondoParticulas() {
    // Creamos el lienzo dinámicamente para no ensuciar el HTML
    const canvas = document.createElement("canvas");
    canvas.id = "auth-bg-canvas";
    document.body.prepend(canvas);

    // Estilos inline obligatorios para fijar el lienzo al fondo total
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";
    canvas.style.backgroundColor = "#f8fafc"; // Color base de fondo

    const ctx = canvas.getContext("2d");
    let particulas = [];
    const numeroParticulas = 40;

    function ajustarDimensiones() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    ajustarDimensiones();
    window.addEventListener("resize", ajustarDimensiones);

    // Molde para cada partícula
    class Particula {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radio = Math.random() * 3 + 1;
            this.velocidadX = Math.random() * 0.4 - 0.2;
            this.velocidadY = Math.random() * 0.4 - 0.2;
            // Tonos verdes ecológicos translúcidos
            this.color = `rgba(16, 185, 129, ${Math.random() * 0.15 + 0.05})`;
        }
        dibujar() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        actualizar() {
            this.x += this.velocidadX;
            this.y += this.velocidadY;

            // Rebotar en los bordes de la pantalla
            if (this.x < 0 || this.x > canvas.width) this.velocidadX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.velocidadY *= -1;
        }
    }

    // Llenar el arreglo
    for (let i = 0; i < numeroParticulas; i++) {
        particulas.push(new Particula());
    }

    // Bucle de animación a 60fps nativos del navegador
    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particulas.forEach(p => {
            p.actualizar();
            p.dibujar();
        });
        requestAnimationFrame(animar);
    }
    animar();
}

/**
 * Reemplaza la función básica para añadir una animación de deslizamiento
 * y desvanecimiento (Slide & Fade) al cambiar de formulario.
 */
function configurarTransicionesTabs() {
    window.cambiarPestaña = function (tipo) {
        const loginForm = document.getElementById('formularioLogin');
        const registroForm = document.getElementById('formularioRegistro');
        const tabLogin = document.getElementById('btnTabLogin');
        const tabRegistro = document.getElementById('btnTabRegistro');

        if (tipo === 'login') {
            // Actualizar botones
            tabLogin.classList.add('active');
            tabRegistro.classList.remove('active');

            // Animación: ocultar registro con suavidad y mostrar login
            registroForm.style.opacity = "0";
            registroForm.style.transform = "translateX(20px)";

            setTimeout(() => {
                registroForm.classList.remove('active');
                loginForm.classList.add('active');
                // Pequeño delay para que el navegador procese el bloque visible antes de animar
                setTimeout(() => {
                    loginForm.style.opacity = "1";
                    loginForm.style.transform = "translateX(0)";
                }, 50);
            }, 200);

        } else {
            // Actualizar botones
            tabRegistro.classList.add('active');
            tabLogin.classList.remove('active');

            // Animación: ocultar login con suavidad y mostrar registro
            loginForm.style.opacity = "0";
            loginForm.style.transform = "translateX(-20px)";

            setTimeout(() => {
                loginForm.classList.remove('active');
                registroForm.classList.add('active');
                setTimeout(() => {
                    registroForm.style.opacity = "1";
                    registroForm.style.transform = "translateX(0)";
                }, 50);
            }, 200);
        }
    };
}
