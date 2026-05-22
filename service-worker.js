const CACHE_NAME = "coordinate-navigator-v1";

const urlsToCache = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./gps.js",
    "./map.js",
    "./voice.js",
    "./manifest.json",

    "./assets/logo.png",
    "./assets/app_icon_192.png",
    "./assets/app_icon_256.png",
    "./assets/app_icon_512.png",
    "./assets/splash_screen.png",

    "./sounds/beep.mp3",
    "./sounds/near.mp3",
    "./sounds/arrived.mp3"

];

/* --------------------------
   Install
---------------------------*/

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            ).then(cache => {

                return cache.addAll(
                    urlsToCache
                );

            })

        );

    }
);

/* --------------------------
   Fetch
---------------------------*/

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            ).then(response => {

                return (
                    response ||
                    fetch(event.request)
                );

            })

        );

    }
);

/* --------------------------
   Activate
---------------------------*/

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys().then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if(
                            key !== CACHE_NAME
                        ){

                            return caches.delete(
                                key
                            );

                        }

                    })

                );

            })

        );

    }
);
