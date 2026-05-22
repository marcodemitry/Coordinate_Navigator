let lastVoiceTime = 0;

let lastVoiceMessage = "";

/* --------------------------
   Speak Function
---------------------------*/

function speak(text){

    if(
        !("speechSynthesis" in window)
    ){
        return;
    }

    speechSynthesis.cancel();

    const utterance =

        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang = "en-US";

    utterance.rate = 1;

    utterance.pitch = 1;

    speechSynthesis.speak(
        utterance
    );

}

/* --------------------------
   Voice Navigation
---------------------------*/

function voiceDirection(angle){

    const now = Date.now();

    /* Prevent Spam */

    if(
        now - lastVoiceTime < 3500
    ){
        return;
    }

    let message = "";

    /* --------------------------
       Direction Logic
    ---------------------------*/

    if(
        angle > -15 &&
        angle < 15
    ){

        message =
            "Go straight";

    }

    else if(
        angle >= 15 &&
        angle < 45
    ){

        message =
            "Slight right";

    }

    else if(
        angle >= 45 &&
        angle < 120
    ){

        message =
            "Turn right";

    }

    else if(
        angle >= 120
    ){

        message =
            "Sharp right";

    }

    else if(
        angle <= -15 &&
        angle > -45
    ){

        message =
            "Slight left";

    }

    else if(
        angle <= -45 &&
        angle > -120
    ){

        message =
            "Turn left";

    }

    else if(
        angle <= -120
    ){

        message =
            "Sharp left";

    }

    /* --------------------------
       Prevent Repeating
    ---------------------------*/

    if(
        message === lastVoiceMessage
    ){
        return;
    }

    lastVoiceMessage =
        message;

    lastVoiceTime =
        now;

    speak(message);

}