 var speech = new webkitSpeechRecognition() || speechRecognition();
        speech.lang = 'en-US';
        speech.continuous = true;
        speech.interimResults = true; 

   var recognizing,
            final_transcript,
            interim_transcript,
            transcription = document.getElementById('interim'),
            interim_span = document.getElementById('interim');
            inputMessage = document.getElementById('inputMessage');
            $log = document.getElementById("log");
            interim_span.style.opacity = '0.5';
 function reset() {
          transcription.innerHTML = '';
          interim_span.innerHTML = '';
          recognizing = false;
        }
 function upgrade() {
      alert('Please upgrade to Google Chrome for best possible experience.');
    }


       window.onload = function() {
      if (!(window.webkitSpeechRecognition) && !(window.speechRecognition)) {
        upgrade();
      } else {

        // document.onkeydown = function(e) {
        //   if (e.key === "q") {
        //     if (!recognizing) {
        //       speech.start();
        //     }
        //   }
        // };

        // document.onkeyup = function(e) {
        //   if (e.key === "q") {
        //     if (recognizing) {
        //       speech.stop();
        //       reset();
        //     }
        //   }
        // };

        speech.onstart = function() {
            // When recognition begins
            recognizing = true;
             $log.innerHTML="Speaking!";
            console.log("Speaking!");
        };

        speech.onresult = function(event) {
            // When recognition produces result
            interim_transcript = '';
            final_transcript = '';

            // main for loop for final and interim results
            for (var i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
              } else {
                interim_transcript += event.results[i][0].transcript;
              }
            }

            transcription.innerHTML = final_transcript;
            interim_span.innerHTML = interim_transcript;
            inputMessage.value = final_transcript;


            // var makeArray = final_transcript.split(' ');
            // var bColor = makeArray.splice(-3);
            // // change background color
            // if ((/^change /g.test(final_transcript)) && (/background color/g.test(final_transcript))) {
            //   if (bColor[0] === 'to') {
            //     document.body.style.backgroundColor = bColor[1] + bColor[2];
            //   } else if (bColor[1] === 'to') {
            //     document.body.style.backgroundColor = bColor[2];
            //   } else {
            //     document.body.style.backgroundColor = bColor[0] + bColor[1] + bColor[2];
            //   }
            // }
        };

        speech.onerror = function(event) {
            // When recognition fails or error occurs
            console.error(event.error); 
        };

        speech.onend = function() {
            // When recognition ends
           
            $log.innerHTML = "Press and hold mic button to speak!";
            console.log("Press and hold mic button to speak!");
            reset();
        };

      }
    };
