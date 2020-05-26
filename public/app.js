const btnEntrada = document.getElementById("btnEntrada");
const btnSalida = document.getElementById("btnSalida");
const formulario = document.getElementById("login");
const dni = document.getElementById("dni");
const dniError = document.getElementById("errorDni");
const esperando = document.getElementById("esperando");

let dni_reg = localStorage.getItem("DNI");

if(!dni_reg){
  mostrar("identificacion");
}
else{
  mostrar("registro");
}

formulario.addEventListener('submit', guardarDni);
dni.addEventListener('focus', e => dniError.classList.add("ocultar") );
btnEntrada.addEventListener('click', e => registrarPosicion('Entrada') );
btnSalida.addEventListener('click', e => registrarPosicion('Salida') );

// Registro del service worker para página offline
window.addEventListener('load', () => {
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register('sw_offline.js')
      .then(registration=>{
        console.log("Service worker offline registrado");
        console.log("Scope: " + registration.scope);
      }, error=>{
        console.log("Service worker offline ha fallado");
        console.log(err);
      });
  }  
});

function registrarPosicion(tipo){
  esperando.classList.remove("ocultar");
  navigator.geolocation.getCurrentPosition(pos => {
    const registro = {
      dni: dni_reg,
      position: { 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude
      },
      type: tipo,
      registerTime: new Date(),
      receivedTime: firebase.firestore.FieldValue.serverTimestamp()
    };

    if(!navigator.onLine){
      esperando.classList.add("ocultar");
      M.toast({html: tipo+' guardada', classes: 'indigo darken-3'});
    }

    db.collection('registros')
      .add( registro )
      .then(docRef => {
        console.log(docRef);

        setTimeout(r => {
          esperando.classList.add("ocultar");
          M.toast({html: tipo+' enviada', classes: 'green darken-1'});
        }, 500);
        
      })
      .catch(err => {
        console.warn('ERROR', err);
        M.toast({html: 'ERROR 36', classes: 'red darken-1'});
      });

  }, err => {
    console.warn('ERROR', err);
    M.toast({html: 'ERROR 100', classes: 'red darken-1'});
  });
    
}

function guardarDni(e){
  e.preventDefault();
  const expReg = /^\d{7,8}(?:[-\s]\d{4})?$/;
  if(expReg.test(dni.value)){
    localStorage.setItem("DNI", dni.value);
    dni_reg = dni.value;
    dni.value = "";
    mostrar("registro");
  }
  else{
    dniError.classList.remove("ocultar");
  }
}

function mostrar(pagina){
  switch(pagina){
    case "identificacion":
      document.getElementById("identificacion").classList.remove("ocultar");
      document.getElementById("registro").classList.add("ocultar");
    break;
    case "registro":
      document.getElementById("identificacion").classList.add("ocultar");
      document.getElementById("registro").classList.remove("ocultar");
    break;
    case "sinred":
      document.getElementById("identificacion").classList.add("ocultar");
      document.getElementById("registro").classList.add("ocultar");
    break;
  }
}
