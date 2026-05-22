let currentLat = null;
let currentLng = null;

let filteredLat = null;
let filteredLng = null;

let lastLat = null;
let lastLng = null;

let gpsHeading = 0;
let compassHeading = 0;

let finalHeading = 0;

let smoothedHeading = 0;

let currentAccuracy = 999;

/* --------------------------
   Start GPS
---------------------------*/

function startGPS(){

    if(!navigator.geolocation){

        alert(
            "GPS Not Supported"
        );

        return;

    }

    /* Prevent Multiple Watches */

    if(watchId !== null){

        navigator.geolocation.clearWatch(
            watchId
        );

    }

    watchId =

        navigator.geolocation.watchPosition(

            position => {

                currentAccuracy =

                    position.coords.accuracy;

                gpsAccuracy.innerText =

                    "±"

                    +

                    currentAccuracy.toFixed(1)

                    +

                    " m";

                const rawLat =

                    position.coords.latitude;

                const rawLng =

                    position.coords.longitude;

                /* --------------------------
                   Position Smoothing
                ---------------------------*/

                if(
                    filteredLat === null ||
                    filteredLng === null
                ){

                    filteredLat = rawLat;
                    filteredLng = rawLng;

                }else{

                    filteredLat =

                        filteredLat +

                        (
                            rawLat -
                            filteredLat
                        ) * 0.25;

                    filteredLng =

                        filteredLng +

                        (
                            rawLng -
                            filteredLng
                        ) * 0.25;

                }

                currentLat = filteredLat;
                currentLng = filteredLng;

                /* --------------------------
                   GPS Heading
                ---------------------------*/

                if(
                    lastLat !== null &&
                    lastLng !== null
                ){

                    const movedDistance =

                        calculateDistance(

                            lastLat,
                            lastLng,

                            currentLat,
                            currentLng

                        );

                    /* Ignore GPS Noise */

                    if(movedDistance > 1.5){

                        gpsHeading =

                            calculateBearing(

                                lastLat,
                                lastLng,

                                currentLat,
                                currentLng

                            );

                    }

                }

                lastLat = currentLat;
                lastLng = currentLng;

                /* --------------------------
                   Hybrid Heading
                ---------------------------*/

                if(currentAccuracy <= 5){

                    finalHeading =

                        (
                            gpsHeading * 0.7
                        )

                        +

                        (
                            compassHeading * 0.3
                        );

                }else{

                    finalHeading =
                        compassHeading;

                }

                /* --------------------------
                   Smooth Rotation
                ---------------------------*/

                smoothedHeading +=

                    (
                        finalHeading -
                        smoothedHeading
                    ) * 0.18;

                /* --------------------------
                   Update Systems
                ---------------------------*/

                updateMap(
                    currentLat,
                    currentLng
                );

                updateNavigation(
                    currentLat,
                    currentLng
                );

                rotateCompass();

                voiceDirection(
                    getRelativeAngle()
                );

            },

            error => {

                alert(
                    "GPS Error"
                );

                console.log(error);

            },

            {

                enableHighAccuracy:true,

                maximumAge:0,

                timeout:15000

            }

        );

}

/* --------------------------
   Device Compass
---------------------------*/

window.addEventListener(

    "deviceorientationabsolute",

    event => {

        if(event.alpha !== null){

            compassHeading =

                360 - event.alpha;

        }

    },

    true

);

/* --------------------------
   Relative Angle
---------------------------*/

function getRelativeAngle(){

    if(
        targetLat === null ||
        targetLng === null
    ){
        return 0;
    }

    const targetBearing =

        calculateBearing(

            currentLat,
            currentLng,

            targetLat,
            targetLng

        );

    let relativeAngle =

        targetBearing -
        smoothedHeading;

    /* Normalize */

    if(relativeAngle > 180){

        relativeAngle -= 360;

    }

    if(relativeAngle < -180){

        relativeAngle += 360;

    }

    return relativeAngle;

}

/* --------------------------
   Rotate Compass
---------------------------*/

function rotateCompass(){

    if(
        targetLat === null ||
        targetLng === null
    ){
        return;
    }

    const relativeAngle =
        getRelativeAngle();

    document.getElementById(
        "compassArrow"
    ).style.transform =

        `rotate(${relativeAngle}deg)`;

}

/* --------------------------
   Bearing Formula
---------------------------*/

function calculateBearing(
    lat1,
    lon1,
    lat2,
    lon2
){

    const dLon =

        (lon2 - lon1)
        * Math.PI / 180;

    lat1 =
        lat1 * Math.PI / 180;

    lat2 =
        lat2 * Math.PI / 180;

    const y =

        Math.sin(dLon)
        * Math.cos(lat2);

    const x =

        Math.cos(lat1)
        * Math.sin(lat2)

        -

        Math.sin(lat1)
        * Math.cos(lat2)
        * Math.cos(dLon);

    let bearing =

        Math.atan2(y, x)
        * 180 / Math.PI;

    bearing =
        (bearing + 360) % 360;

    return bearing;

}