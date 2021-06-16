import tabJourEnOrdre from './gestionTemps.js';

const CLEAPI = $_ENV["API_TOKEN"];
let resultatsAPI;

const temps = document.querySelector(".temps")
const temperature = document.querySelector(".temperature")
const localisation = document.querySelector(".localisation")
const heure = document.querySelectorAll(".heure-nom-prevision")
const tempsPourH = document.querySelectorAll(".heure-prevision-valeur")
const logo = document.querySelector(".bloc-logo")
const joursDiv = document.querySelectorAll(".jour-prevision-nom")
const tempJoursDiv = document.querySelectorAll(".jour-prevision-temp")
let long
let lati
let form = document.querySelector("form")
let nContainer = document.getElementById("nContainer")
let container = document.querySelector(".container")
// let search = document.getElementById("search")
let removebtn = document.querySelector(".remove")
// let stock = document.getElementById("button")
let ville_history = JSON.parse(localStorage.getItem('nom')) || []


// Get city------------

let getCityName = function(lon,lat){
    fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${lon}&lat=${lat}`)
    .then(res => res.json())
    .then(data => {
        localisation.innerText = data.features[0].properties.city

    })
}


// Call API Ville/lat/lon-----------

let apiWeather = function(city){
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${CLEAPI}&units=metric&lang=fr`)
    .then((res) => res.json().then((data) => {

        lati = data.coord.lat;
        long = data.coord.lon;
        document.querySelector('.container').querySelector('.localisation').innerText= city;
        
        apiOneCall(long,lati)

        })
    )
};

// Par Défault---------------
if(ville_history != []){

    ville_history.forEach(value => {
        apiWeather(value);
        var dupNode = container.cloneNode([true]);
        // dupNode.name = value; rajouter un nom au clone
        container.after(dupNode);

    })
}
else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {

        // console.log(position);
        let lon = position.coords.longitude;
        let lat = position.coords.latitude;
        
        getCityName(lon,lat);

        apiOneCall(lon,lat);

    }, () => {
        alert("Géolocalisation refusé, l'application ne peut pas fonctionner")
    })
}




// Supprime block -------

removebtn.addEventListener("click", function(e){
    e.preventDefault();
    this.parentNode.parentNode.remove()
})

// Ecouteur d'event submit------------


form.addEventListener('submit', function(e){
    e.preventDefault();
    let ville = document.querySelector('#inputCity').value;
    var dupNode = container.cloneNode([true]);
    console.log(ville,ville_history)


    ville_history.push(ville);
    container.after(dupNode);
    setData();

    apiWeather(ville);
});

let apiOneCall = (lon,lat) =>{
    // console.log(lon,lat);

    fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&
    exclude=minutely&units=metric&lang=fr&appid=${CLEAPI}`)
    .then((reponse) =>{
        return reponse.json();
    })


    .then((data) => {
        // console.log(data);

        resultatsAPI = data;

        // console.log(resultatsAPI.current.weather[0].icon)
        // console.log(resultatsAPI.current.weather[0].description)
        // console.log(resultatsAPI.current.temp)
        // console.log(resultatsAPI.timezone)


        logo.innerHTML = `<img src="http://openweathermap.org/img/w/${resultatsAPI.current.weather[0].icon}.png" id="logo-icone">`
        temps.innerText = resultatsAPI.current.weather[0].description;
        temperature.innerText = resultatsAPI.current.temp + "°";
        // localisation.innerText = resultatsAPI.timezone;

        // Bloc heure--------------

        let heureActuelle = new Date().getHours();

        for(let i = 0; i < heure.length; i++) {

            let heureIncr = heureActuelle + i * 3;

            if(heureIncr > 24) {
                heure[i].innerText = `${heureIncr - 24} h`
            } else if(heureIncr === 24) {
                heure[i].innerText = "00h"
            } else {
                heure[i].innerText = `${heureIncr} h`;
            }

        }

        for(let j = 0; j < tempsPourH.length; j++) {
            tempsPourH[j].innerText = `${resultatsAPI.hourly[j * 3 ].temp}°`;
        }

        // Bloc jours-----------------

        for(let k = 0; k < tabJourEnOrdre.length; k++){
            joursDiv[k].innerText = tabJourEnOrdre[k].slice(0,3);
        }

        for (let m = 0; m < 7; m++){
            tempJoursDiv[m].innerText = `${Math.trunc(resultatsAPI.daily[m+1].temp.day)} °`
        }
    })
}

// Local Storage simple ------------------

const name = () =>{

    if (ville_history == []){
        console.log("Pas de data.")
    } else{
        console.log(ville_history);
        apiWeather(ville_history[-1]);
    }
};

function setData(){
    console.log(ville_history)
    localStorage.setItem('nom', JSON.stringify(ville_history));
};

name()