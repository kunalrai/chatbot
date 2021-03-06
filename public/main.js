


//$(function () {
  "use strict";
  var token = "b716c2d7a00b44b88cf0c8600d92505b";
  var client, streamClient;
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];


  if (streamClient) {
    streamClient.close();
  }

  client = new ApiAi.ApiAiClient({ accessToken: token, streamClientClass: ApiAi.ApiAiStreamClient });

  streamClient = client.createStreamClient();
  console.log(client.createStreamClient());
  streamClient.init();

  streamClient.onInit = function () {
    console.log("> ON INIT use direct assignment property");
    streamClient.open();
  };

  streamClient.onStartListening = function () {
    console.log("> ON START LISTENING");
  };

  streamClient.onStopListening = function () {
    console.log("> ON STOP LISTENING");
  };

  streamClient.onOpen = function () {
    console.log("> ON OPEN SESSION");
  };

  streamClient.onClose = function () {
    console.log("> ON CLOSE");
    streamClient.close();
  };

  streamClient.onResults = streamClientOnResults;

  streamClient.onError = function (code, data) {
    streamClient.close();
    console.log("> ON ERROR", code, data);
  };

  streamClient.onEvent = function (code, data) {
    console.log("> ON EVENT", code, data);
  };

  function streamClientOnResults(results) {
    console.log("> ON RESULTS", results);
  }

  var agentState = {};

  function sendText(text) {
    return client.textRequest(text);
  }

  function tts(text) {
    return client.ttsRequest(text);
  }

  function startMic() {
    streamClient.startListening();
  }

  function stopMic() {
    streamClient.stopListening();
  }


  // Initialize varibles

  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $chatArea = $(".chatArea");//chat area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  var $sendbtn = $("#sendbtn");

  // Prompt for setting a username

  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();
  const botName = 'Dr. Rai';


  $window.on("blur focus", function (e) {
    var prevType = $(this).data("prevType");

    if (prevType != e.type) {   //  reduce double fire issues
      switch (e.type) {
        case "blur":
          agentState = false;
          break;
        case "focus":
          agentState = true;

          break;
      }
    }

    $(this).data("prevType", e.type);
  });
  var socket = io();

  setBotName();

  function addParticipantsMessage(data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    log(message);

  }
  //Add Chat bot
  function setBotName() {
    username = botName;
    socket.emit('add user', username);
  }


  // Sets the client's username
  function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);

    }
  }

  function sendMessageByBot(message) {
    message = cleanInput(message);
    addChatMessage({
      username: botName,
      message: message
    }, { isBot: true });
    // tell server to execute 'new message' and send along one parameter
    socket.emit('new message by bot', message);
  }

  // Sends a chat message
  function sendMessage() {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);

      sendText(message)
        .then(function (response) {
          var result;
          try {
            result = response.result.fulfillment.speech
          } catch (error) {
            result = "";
          }
          //setResponseJSON(response);
          executeAction(response.result);
          //console.log(response.result);
          sendMessageByBot(result);
          //setResponseOnNode(result, responseNode);
        })
        .catch(function (err) {
          //setResponseJSON(err);
          //setResponseOnNode("Something goes wrong", responseNode);
          console.log("Error", err);
        });
    }


  }

  // Log a message
  function log(message, options) {
    var $el = $('<li>').addClass('log').text(message);
    Materialize.toast(message, 3000);
    $('.users').text(message);
    //addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage(data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    console.log(options);

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));

    $usernameDiv = $(`<div class="mychip">
    <i class="material-icons bot-width">android</i>
    <div class="qusername"> ${data.username}</div>
  </div>`).css('color', getUsernameColor(data.username));

    if (options.hasOwnProperty("isBot")) {
      $usernameDiv = $(`<div class="mychip">
      <i class="material-icons bot-width">android</i>
    <div class="qusername"> ${data.username}</div>
  </div>`).css('color', getUsernameColor(data.username));
    }

    var $messageBodyDiv = '';
    if (typeof data.message === 'string') {
      $messageBodyDiv = $('<div class="bubble"><span class="messageBody"></div>').text(data.message);
    }
    else {
      $messageBodyDiv = $('<span class="messageBody">').text(JSON.stringify(data.message));

      $messageBodyDiv = data.message.map(function (x) {
        var str = `<span class="messageBody">

            <img  src=`+ x.subpods[0].image + `></img>

            </span><br/>`
        return str;

      });
    }

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<div class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    // $messages[0].scrollTop = $messages[0].scrollHeight;
    $chatArea[0].scrollTop=$chatArea[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput(input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping() {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages(data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor(username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  function startRecording() {
    console.log("mouse down...");
    if (!recognizing) {
      speech.start();
    }
  }

  function stopRecording() {
    console.log("mouse up");
    if (recognizing) {
      speech.stop();
      reset();
    }
  }

  $sendbtn.on("click", sendMessage);
  $sendbtn.on('mousedown touchstart', startRecording);
  $sendbtn.on("mouseup touchend", stopRecording);


  // Keyboard events
  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username && username !== botName) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on('input', function () {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Kunal Rai Chat  ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {

    addChatMessage(data);

  });

  socket.on('search', function (data) {

    addChatMessage(data);

  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);

  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');

    addParticipantsMessage(data);
    removeChatTyping(data);

  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
    document.title = data.username + ' typing...';
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
    document.title = 'Kunal let\'s talk app';
  });




//});
