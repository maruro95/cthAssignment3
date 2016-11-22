/*
  file:   server.js
  desc:   script that configures a HTTP server that listens to incoming client connections.
          Clients are expected to send chat-like messages (see index.html) which are replied 
          to depending if certain patterns are recognised in the message (or not). The idea
          is to create a simple artificial conversation between the a human subject and the 
          script. The work is inspired by Alan Turing's Imitation Game and Joseph Weizenbaum's
          ELIZA. 
  author: gauthier
  date:   17/11/16
*/

// import express ()
var express = require('express');		// npm install --save express
var app = express();

// import node.js http
var server = require('http').Server(app);

// import socket.io
var io = require('socket.io')(server);	// npm install --save socket.io

// import chance (http://chancejs.com)
var chance = require('chance').Chance(); // npm install --save chance

/* ---------------------
  Answers & Responses
------------------------*/

// the two patterns which the script looks for when
// receiving message from the client
var pattern_1 = ['can you help me?', 'can you play with me?', 'when are you free next?'];
var pattern_2 = ['are you feeling any better?', "does your arm still hurts?", 'is your forehead doing any better?'];
var pattern_3 = ['can you fly?', 'is your heart made out of strings?', 'can you make me a billionaire?'];
// helpful punctuation
var ponctuation = ['!', '.', '...'];

/**
* Iterates through and array of clauses or words and 
* search them inside a given sentence (msg). Returns
* true if the search is successful and false otherwise. 
* @param {Array of strings} array_of_patterns
* @param {String} msg
* @return {boolean} 
*/
function matches(msg, array_of_patterns) {

  var msg_lower = msg.toLowerCase();

  for(var i = 0; i < array_of_patterns.length; i++) {

    var pattern_lower = array_of_patterns[i].toLowerCase();

    if(msg_lower.search(pattern_lower) > -1) {

      return true;

    }
  }
  return false;
}

/**
* Picks a random element from an array
* @param {Array} array
* @return {Object} choice
*/
function choice(array) {

  var index = chance.natural({'min': 0, 'max': array.length - 1});  // **** NOTE: 'max': array.length - 1

  return array[index];
}

/**
* Randomly picks or not a random element from an array
* @param {Array} array
* @return {Object} choice 
* @return {String} empty string
*/
function maybe(array) {

  if( chance.bool() ) {

    return choice(array);

  } else {

    return '';

  }
}

/**
* Constructs a single randomly generate answer
* @return {String} 
*/
function pattern_1_answer() {
  return choice(['Hmmm', 'Ah!', '...']) + ' ' + 'I am ' + choice(['not', 'kind of']) + ' ' 
    + choice(['your toy', 'tired', 'busy', 'miserable', 'no', 'confused']) + ' '
    + choice(ponctuation);
}

/**
* Constructs a randomly generate answer out of three random possibilities 
* @return {String} 
*/
function pattern_2_answer() { 
    return choice(['maybe', 'no','yeah']) +' ' + choice(['It', 'the pain']) + ' ' + 'still' + ' ' + choice(['hurts', 'pains','lingers']) + ' ' + 'me' + ' ' + choice(ponctuation);
}
function pattern_3_answer() { 
    return choice(['mmmmh', 'uuuuuuh','yeah']) +' ' + choice(['sure', 'of course','you']) + ' ' + 'keep' + ' ' + choice(['imagining', 'thinking','believing']) + ' ' + 'that' + ' ' + choice(ponctuation);
}
/*
  switch(choice([1, 2, 3]))
  {
    case 1:
      return choice(['uuuuuh', 'Hmmm', 'Ok']) + " don't be " 
        + maybe(['avidly', 'immensely', 'eagerly', 'anxiously']) + ' ' 
        + choice(['superficial', 'mean', 'joyful', 'negative', 'pickled', 'angry'])
        + choice(ponctuation);
    case 2:
      return choice(['I am sorry', 'Excuse me', 'Eh...']) + ' I do ' + choice(['not', 'indeed']) + ' '
        + choice(['understand', 'share the same worldview as', 'empathise with']) + ' you' 
        + choice(ponctuation);
    case 3:
      return choice(['YES', 'Ok', 'Zzzzz']) + choice(ponctuation) + choice(ponctuation) + choice(ponctuation);
  }
}

/**
* Constructs a single randomly generate answer
* @return {String} 
*/
function default_answer() {

  return choice(['Sorry, come again.', 'I do not understand.', 'Can you repeat.', 
                  'No comprendo...', 'Ne me quitte pas!']);
}

/**
* Matches a message to the above two patterns (pattern_1, pattern_2)
* and calls their respective answers (functions patter_1_answer and patter_2_answer )
* @return {String} 
*/

function answer(msg) {

  if(matches(msg, pattern_1)) { 

    return pattern_1_answer();

  } else if(matches(msg, pattern_2)) {

    return pattern_2_answer();

 
  } else if (matches(msg,pattern_3)) {
      
    return pattern_3_answer();
      
  } else {

    return default_answer();

  }
}

/* ----------------------------------
	Server and Socket Configuration
--------------------------------------*/

// tell express to server our index.html file
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// configure socket.io
// (1) when there is a connection 
io.on('connection', function(socket) {

  console.log('got a connection');
  //io.emit('message from robot', 'Hi! my name is Reihtuag!'); // greetings

  // (2) configure the connected socket to receive custom messages ('message from human')
  // and call the function answer to produce a response
  socket.on('message from human', function(msg) {

  	console.log('got a human message: ' + msg);

  	io.emit('message from robot', answer(msg));      /// <--- call of the function answer defined above 

  });

  socket.on('disconnet', function() {

  	console.log('got a disconnection');
  	
  });

});

/* -------------------
	Start the server
----------------------*/

// listen to connection on port 8088 --> http://localhost:8088
server.listen(8088, function () {
	console.log('listening on port: ' + 8088);
});
