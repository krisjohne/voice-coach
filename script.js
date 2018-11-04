try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
} catch (e) {
  console.error(e);
  $('.no-browser-support').show();
  $('.app').hide();
}

// words to prompt
let words = [
  "apple",
  "banana",
  "theater",
  "playful",
  "friendly",
  "loving",
  "recouperate"
];

let prompt = $('#prompt');
let level = 0;
let score = 0;

changeLevel();

let recording_state = false;

// var noteTextarea = $('#note-textarea');
var instructions = $('#recording-instructions');
var notesList = $('ul#notes');

var noteContent = '';

// MY STUFF
let myText = $('#my-text');
let myResult = $('#my-result');
let myLevel = $('#level-display');
let myScore = $('#score-display');

let response = $('#input-single');

console.log(myLevel);
console.log(myScore);
// let myText = document.querySelector("#my-text");
// let myResult = document.querySelector("#my-result");
// let myTranscript = myText[0].innerHTML;

// Get all notes from previous sessions and display them.
// var notes = getAllNotes();
// renderNotes(notes);


/*-----------------------------
      Voice Recognition
------------------------------*/

// If false, the recording will stop after a few seconds of silence.
// When true, the silence period is longer (about 15 seconds),
// allowing us to keep recording even when the user pauses.
recognition.continuous = true;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function(event) {

  // event is a SpeechRecognitionEvent object.
  // It holds all the lines we have captured so far.
  // We only need the current one.
  var current = event.resultIndex;

  // Get a transcript of what was said.
  var transcript = event.results[current][0].transcript;
  console.log("TEST: " + transcript);
  // Add the current transcript to the contents of our Note.
  // There is a weird bug on mobile, where everything is repeated twice.
  // There is no official solution so far so we have to handle an edge case.
  var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

  if (!mobileRepeatBug) {
    noteContent += transcript;
    // noteTextarea.val(noteContent);

    // TEST WHERE DOES IT UPDATE?
    console.log(noteContent);
    myText[0].innerHTML = "We think you said " + noteContent;
    response[0].innerHTML = noteContent;

    // noteTextarea.val(transcript);

    MainGame();
  }
};

function MainGame() {
  changeLevel();
  // compare level
  if (compare(noteContent, words[level])) {
    myResult[0].innerHTML = "CORRECT";
    level++;
    myLevel[0].innerHTML = "Level " + level;
    changeLevel();
    score += 100;
    myScore[0].innerHTML = score;
    console.log("level: " + level + "score: " + score);
    good_shake();
  } else {
    myResult[0].innerHTML = "INCORRECT";
    score -= 20;
    myScore[0].innerHTML = score;
    console.log()
    bad_shake();
  }
}

recognition.onstart = function() {
  instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function() {
  instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function(event) {
  if (event.error == 'no-speech') {
    instructions.text('No speech was detected. Try again.');
  };
}



/*-----------------------------
      App buttons and input
------------------------------*/

$('#start-record-btn').on('click', function(e) {
  if (noteContent.length) {
    noteContent = '';
    // noteTextarea.val('');
  }

  if (!recording_state) {
    recognition.start();
    recording_state = true;
  } else {
    recognition.stop();
    recording_state = false;
  }

  // Fancy button script
  $(this).toggleClass("active");
});


$('#pause-record-btn').on('click', function(e) {
  recognition.stop();
  instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
// noteTextarea.on('input', function() {
//   noteContent = $(this).val();
// })

$('#save-note-btn').on('click', function(e) {
  recognition.stop();

  if (!noteContent.length) {
    instructions.text('Could not save empty note. Please add a message to your note.');
  } else {
    // Save note to localStorage.
    // The key is the dateTime with seconds, the value is the content of the note.
    saveNote(new Date().toLocaleString(), noteContent);

    // Reset variables and update UI.
    noteContent = '';
    renderNotes(getAllNotes());
    noteTextarea.val('');
    instructions.text('Note saved successfully.');
  }

})


// notesList.on('click', function(e) {
//   e.preventDefault();
//   var target = $(e.target);
//
//   // Listen to the selected note.
//   if (target.hasClass('listen-note')) {
//     var content = target.closest('.note').find('.content').text();
//     readOutLoud(content);
//   }
//
//   // Delete note.
//   if (target.hasClass('delete-note')) {
//     var dateTime = target.siblings('.date').text();
//     deleteNote(dateTime);
//     target.closest('.note').remove();
//   }
// });



/*-----------------------------
      Speech Synthesis
------------------------------*/

// function readOutLoud(message) {
//   var speech = new SpeechSynthesisUtterance();
//
//   // Set the text and voice attributes.
//   speech.text = message;
//   speech.volume = 1;
//   speech.rate = 1;
//   speech.pitch = 1;
//
//   window.speechSynthesis.speak(speech);
// }



/*-----------------------------
      Helper Functions
------------------------------*/

// function renderNotes(notes) {
//   var html = '';
//   if (notes.length) {
//     notes.forEach(function(note) {
//       html += `<li class="note">
//         <p class="header">
//           <span class="date">${note.date}</span>
//           <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
//           <a href="#" class="delete-note" title="Delete">Delete</a>
//         </p>
//         <p class="content">${note.content}</p>
//       </li>`;
//     });
//   } else {
//     html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
//   }
//   notesList.html(html);
// }
//
//
// function saveNote(dateTime, content) {
//   localStorage.setItem('note-' + dateTime, content);
// }


// function getAllNotes() {
//   var notes = [];
//   var key;
//   for (var i = 0; i < localStorage.length; i++) {
//     key = localStorage.key(i);
//
//     if (key.substring(0, 5) == 'note-') {
//       notes.push({
//         date: key.replace('note-', ''),
//         content: localStorage.getItem(localStorage.key(i))
//       });
//     }
//   }
//   return notes;
// }
//
//
// function deleteNote(dateTime) {
//   localStorage.removeItem('note-' + dateTime);
// }

function compare(user_input, key) {
  if (user_input.toLowerCase() == key.toLowerCase()) {
    return true;
  } else {
    return false;
  }
}

function changeLevel() {
  if (level >= words.length) {
    alert("You completed the game!");
  } else {
    console.log("In changeLevel()");
    prompt[0].innerHTML = "\"" + words[level] + "\"";
  }
}

function bad_shake() {
  myScore[0].classList.add("shake-constant");
  setTimeout(function() {
    myScore[0].classList.remove("shake-constant");
  }, 1000);
}

function good_shake() {
  myLevel[0].classList.add("shake-constant");
  setTimeout(function() {
    myLevel[0].classList.remove("shake-constant");
  }, 1000);
}
