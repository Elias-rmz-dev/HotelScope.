const correo_correcto = "admin@hotelscope.com"; 
const contrasena_correcta = "HotelScope2026"; 
 
const formulario_login = document.getElementById("formulario_login"); 
const correo = document.getElementById("correo"); 
const contrasena = document.getElementById("contrasena"); 
const mensaje_error = document.getElementById("mensaje_error"); 
 
formulario_login.addEventListener("submit", function(event) { 
 
    event.preventDefault(); 
 
    const correo_ingresado = correo.value.trim(); 
    const contrasena_ingresada = contrasena.value; 
 
    if (correo_ingresado === correo_correcto) { 
 
        if (contrasena_ingresada === contrasena_correcta) { 
 
            localStorage.setItem("sesion_iniciada", "true"); 
            localStorage.setItem("inicio_sesion", Date.now()); 
 
            window.location.href = "../index.html"; 
 
        } else { 
 
            mensaje_error.textContent = "Contraseña incorrecta."; 
 
        } 
 
    } else { 
 
        if (contrasena_ingresada === contrasena_correcta) { 
 
            mensaje_error.textContent = "Correo incorrecto."; 
 
        } else { 
 
            mensaje_error.textContent = "Correo y contraseña incorrectos."; 
 
        } 
 
    } 
 
});