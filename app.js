const coordType = document.getElementById("coordType");

const wgs84Box = document.getElementById("wgs84Box");
const dmsBox = document.getElementById("dmsBox");
const utmBox = document.getElementById("utmBox");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const centerBtn = document.getElementById("centerBtn");
const clearBtn = document.getElementById("clearBtn");

const saveLocationBtn =
    document.getElementById(
        "saveLocationBtn"
    );

const savedPointsList =
    document.getElementById(
        "savedPointsList"
    );

const distanceText =
    document.getElementById(
        "distanceText"
    );

const statusText =
    document.getElementById(
        "statusText"
    );

const gpsAccuracy =
    document.getElementById(
        "gpsAccuracy"
    );

const beepSound =
    document.getElementById(
        "beepSound"
    );

const nearSound =
    document.getElementById(
        "nearSound"
    );

const arrivedSound =
    document.getElementById(
        "arrivedSound"
    );

let targetLat = null;
let targetLng = null;

let watchId = null;

let userMarker = null;
let targetMarker = null;
let linePath = null;

let arrived = false;

/* --------------------------
   Saved Locations
---------------------------*/

let savedLocations =

    JSON.parse(

        localStorage.getItem(
            "savedLocations"
        )

    ) || [];

/* --------------------------
   Coordinate Type Switch
---------------------------*/

coordType.addEventListener(
    "change",
    () => {

        wgs84Box.classList.add(
            "hidden"
        );

        dmsBox.classList.add(
            "hidden"
        );

        utmBox.classList.add(
            "hidden"
        );

        if(
            coordType.value ===
            "wgs84"
        ){

            wgs84Box.classList.remove(
                "hidden"
            );

        }

        if(
            coordType.value ===
            "dms"
        ){

            dmsBox.classList.remove(
                "hidden"
            );

        }

        if(
            coordType.value ===
            "utm"
        ){

            utmBox.classList.remove(
                "hidden"
            );

        }

    }
);

/* --------------------------
   Start Navigation
---------------------------*/

startBtn.addEventListener(
    "click",
    () => {

        arrived = false;

        getTargetCoordinates();

        if(
            targetLat === null ||
            targetLng === null
        ){

            alert(
                "Please Enter Valid Coordinates"
            );

            return;

        }

        startGPS();

    }
);

/* --------------------------
   Stop Navigation
---------------------------*/

stopBtn.addEventListener(
    "click",
    () => {

        if(watchId !== null){

            navigator.geolocation
            .clearWatch(watchId);

            watchId = null;

            statusText.innerText =
                "STOPPED";

        }

    }
);

/* --------------------------
   Center Map
---------------------------*/

centerBtn.addEventListener(
    "click",
    () => {

        if(
            currentLat &&
            currentLng
        ){

            map.setView(

                [
                    currentLat,
                    currentLng
                ],

                19

            );

        }

    }
);

/* --------------------------
   Clear
---------------------------*/

clearBtn.addEventListener(
    "click",
    () => {

        /* WGS84 */

        document.getElementById(
            "latitude"
        ).value = "";

        document.getElementById(
            "longitude"
        ).value = "";

        /* DMS */

        document.getElementById(
            "nDeg"
        ).value = "";

        document.getElementById(
            "nMin"
        ).value = "";

        document.getElementById(
            "nSec"
        ).value = "";

        document.getElementById(
            "eDeg"
        ).value = "";

        document.getElementById(
            "eMin"
        ).value = "";

        document.getElementById(
            "eSec"
        ).value = "";

        /* UTM */

        document.getElementById(
            "easting"
        ).value = "";

        document.getElementById(
            "northing"
        ).value = "";

        targetLat = null;
        targetLng = null;

        arrived = false;

        distanceText.innerText =
            "--";

        statusText.innerText =
            "WAITING";

        document.body.style.background =
            "#061018";

        if(targetMarker){

            map.removeLayer(
                targetMarker
            );

            targetMarker = null;

        }

        if(linePath){

            map.removeLayer(
                linePath
            );

            linePath = null;

        }

    }
);

/* --------------------------
   Save Current Position
---------------------------*/

saveLocationBtn.addEventListener(
    "click",
    () => {

        if(
            currentLat === null ||
            currentLng === null
        ){

            alert(
                "GPS Not Ready"
            );

            return;

        }

        const pointName = prompt(

            "Enter Point Name"

        );

        const finalName =

            pointName &&
            pointName.trim() !== ""

            ?

            pointName

            :

            `Point ${
                savedLocations.length + 1
            }`;

        const location = {

            name:finalName,

            lat:currentLat,

            lng:currentLng,

            time:Date.now()

        };

        savedLocations.push(
            location
        );

        localStorage.setItem(

            "savedLocations",

            JSON.stringify(
                savedLocations
            )

        );

        renderSavedPoints();

        renderSavedMarkers();

        alert(
            "Point Saved Successfully"
        );

    }
);

/* --------------------------
   Render Saved Points
---------------------------*/

function renderSavedPoints(){

    savedPointsList.innerHTML = "";

    if(
        savedLocations.length === 0
    ){

        savedPointsList.innerHTML =

            `
            <div class="saved-card">
                No Saved Points
            </div>
            `;

        return;

    }

    savedLocations.forEach(

        (
            location,
            index
        ) => {

            const card =
            document.createElement(
                "div"
            );

            card.className =
                "saved-card";

            card.innerHTML =

                `
                <div class="saved-name">
                    ${location.name}
                </div>

                <div class="saved-coords">

                    Lat:
                    ${location.lat.toFixed(6)}

                    <br>

                    Lng:
                    ${location.lng.toFixed(6)}

                </div>

                <div class="saved-actions">

                    <button
                        class="navigate-btn"
                        onclick="navigateToSaved(${index})"
                    >
                        Navigate
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteSaved(${index})"
                    >
                        Delete
                    </button>

                </div>
                `;

            savedPointsList.appendChild(
                card
            );

        }

    );

}

/* --------------------------
   Navigate To Saved
---------------------------*/

function navigateToSaved(index){

    const location =
        savedLocations[index];

    targetLat =
        location.lat;

    targetLng =
        location.lng;

    arrived = false;

    statusText.innerText =
        "TARGET SELECTED";

    startGPS();

}

/* --------------------------
   Delete Saved
---------------------------*/

function deleteSaved(index){

    const confirmDelete = confirm(

        "Delete This Point ?"

    );

    if(!confirmDelete){

        return;

    }

    savedLocations.splice(
        index,
        1
    );

    localStorage.setItem(

        "savedLocations",

        JSON.stringify(
            savedLocations
        )

    );

    renderSavedPoints();

    renderSavedMarkers();

}

/* --------------------------
   Get Coordinates
---------------------------*/

function getTargetCoordinates(){

    /* WGS84 */

    if(
        coordType.value ===
        "wgs84"
    ){

        targetLat = parseFloat(

            document.getElementById(
                "latitude"
            ).value

        );

        targetLng = parseFloat(

            document.getElementById(
                "longitude"
            ).value

        );

    }

    /* DMS */

    if(
        coordType.value ===
        "dms"
    ){

        let nDeg = parseFloat(
            document.getElementById(
                "nDeg"
            ).value
        ) || 0;

        let nMin = parseFloat(
            document.getElementById(
                "nMin"
            ).value
        ) || 0;

        let nSec = parseFloat(
            document.getElementById(
                "nSec"
            ).value
        ) || 0;

        let eDeg = parseFloat(
            document.getElementById(
                "eDeg"
            ).value
        ) || 0;

        let eMin = parseFloat(
            document.getElementById(
                "eMin"
            ).value
        ) || 0;

        let eSec = parseFloat(
            document.getElementById(
                "eSec"
            ).value
        ) || 0;

        targetLat =

            nDeg +
            (nMin / 60) +
            (nSec / 3600);

        targetLng =

            eDeg +
            (eMin / 60) +
            (eSec / 3600);

    }

}

/* --------------------------
   Distance Formula
---------------------------*/

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
){

    const R = 6371000;

    const dLat =

        (lat2-lat1)
        * Math.PI/180;

    const dLon =

        (lon2-lon1)
        * Math.PI/180;

    const a =

        Math.sin(dLat/2)
        * Math.sin(dLat/2)

        +

        Math.cos(
            lat1*Math.PI/180
        )

        *

        Math.cos(
            lat2*Math.PI/180
        )

        *

        Math.sin(dLon/2)
        *

        Math.sin(dLon/2);

    const c =

        2 * Math.atan2(

            Math.sqrt(a),

            Math.sqrt(1-a)

        );

    return R * c;

}

/* --------------------------
   Navigation Update
---------------------------*/

function updateNavigation(
    userLat,
    userLng
){

    if(
        targetLat === null ||
        targetLng === null
    ){
        return;
    }

    const distance =

        calculateDistance(

            userLat,
            userLng,

            targetLat,
            targetLng

        );

    if(distance > 1000){

        distanceText.innerText =

            (
                distance/1000
            ).toFixed(2)

            + " km";

    }else{

        distanceText.innerText =

            distance.toFixed(1)

            + " m";

    }

    let arrivalRadius = 4;

    if(currentAccuracy > 8){

        arrivalRadius = 10;

    }

    else if(currentAccuracy > 5){

        arrivalRadius = 7;

    }

    if(distance > 50){

        statusText.innerText =
            "FAR";

    }

    if(
        distance <= 50 &&
        distance > 15
    ){

        statusText.innerText =
            "NEAR";

        playBeep();

    }

    if(
        distance <= 15 &&
        distance > arrivalRadius
    ){

        statusText.innerText =
            "VERY CLOSE";

        playNear();

    }

    if(
        distance <= arrivalRadius &&
        !arrived
    ){

        arrived = true;

        statusText.innerText =
            "ARRIVED";

        playArrived();

        speak(
            "You reached destination"
        );

    }

}

/* --------------------------
   Sounds
---------------------------*/

function playBeep(){

    beepSound.currentTime = 0;

    beepSound.play();

}

function playNear(){

    nearSound.currentTime = 0;

    nearSound.play();

}

function playArrived(){

    arrivedSound.currentTime = 0;

    arrivedSound.play();

}

/* --------------------------
   Initial Load
---------------------------*/

renderSavedPoints();

renderSavedMarkers();