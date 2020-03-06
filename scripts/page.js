////  Page-scoped globals  ////

// Counters
let throwingItemIdx = 1;

// Size Constants
const FLOAT_1_WIDTH = 149;
const FLOAT_2_WIDTH = 101;
const FLOAT_SPEED = 2;
const PERSON_SPEED = 25;
const OBJECT_REFRESH_RATE = 50;  //ms
const SCORE_UNIT = 100;  // scoring is in 100-point units

// Create Candy + Beads
let candy = './img/candy.png';
let beads = './img/beads.png';

// Size vars
let maxPersonPosX, maxPersonPosY;
let maxItemPosX;
let maxItemPosY;

// Global Window Handles (gwh__)
let gwhGame, gwhStatus, gwhScore;

// Global Object Handles
let player;
let paradeRoute;
let paradeFloat1;
let paradeFloat2;
let paradeTimer;

/*
 * This is a handy little container trick: use objects as constants to collect
 * vals for easier (and more understandable) reference to later.
 */
const KEYS = {
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  shift: 16,
  spacebar: 32
};

let createThrowingItemIntervalHandle;
let currentThrowingFrequency = 2000;

////  Functional Code  ////

// Splash Screen Code
function splash(time) {
  return new Promise(resolve => {
    setTimeout(() => { 
      $("#splash").hide();
      // $('#actualGame').show();
      resolve();
    }, time);
  });
}

// Main
$(document).ready( function() {
  console.log("Ready!");

  // Wait for splash to resolve after 3 seconds, then start everything
  splash(3000).then(() => {
      startParade();

      // Move all the code in here because it looks important
      maxItemPosX = $('.game-window').width() - 50;
      maxItemPosY = $('.game-window').height() - 40;
      // Set global handles (now that the page is loaded)
      gwhGame = $('#actualGame');
      gwhStatus = $('.status-window');
      gwhScore = $('#score-box');
      player = $('#player');  // set the global player handle
      paradeRoute = $("#paradeRoute");
      paradeFloat1 = $("#paradeFloat1");
      paradeFloat2 = $("#paradeFloat2");
      // Set styling for candy + beads 
      beads = $(".beads");
      candy = $(".candy");
    
      // Set global positions
      maxPersonPosX = $('.game-window').width() - player.width();
      maxPersonPosY = $('.game-window').height() - player.height();
    
      /* Make person stop moving */
      $(window).keydown(keydownRouter);
      
      // Periodically check for collisions
      setInterval( function() {
        checkCollisions();
      }, 100);
  });

  /* Do not need because I'm calling it after splash screen */
  // startParade(); 

  createThrowingItemIntervalHandle = setInterval(createThrowingItem, currentThrowingFrequency);
});


function keydownRouter(e) {
  switch (e.which) {
    case KEYS.shift:
      break;
    case KEYS.spacebar:
      break;
    case KEYS.left:
    case KEYS.right:
    case KEYS.up:
    case KEYS.down:
      movePerson(e.which);
      break;
    default:
      console.log("Invalid input!");
  }
}

let numBeads = 0;
let numCandy = 0;

// functions that check when candy and user collide
function checkCollisions() {
  // First, check for rocket-asteroid checkCollisions
  $('.throwingItem').each( function() {
    let curItem = $(this);  // define a local handle for this rocket
    let curItemID = $(this).attr('id');
    let curItemClass = $(this).attr('class');

    if (isColliding($(this) , player)) {
      // add yellow aura here
      document.getElementById(curItemID).classList.add('yellowaura');

      // after 1 second it'll fade from collision
      $(this).fadeTo(1000, 0, function() {

        $(this).remove();

        // update score
        gwhScore.html(parseInt($('#score-box').html()) + SCORE_UNIT);

        // update # of beads collected or candy collected
        if ($(this).attr('class') == 'throwingItem beads yellowaura') {
          numBeads++;
          console.log(numBeads);
          document.getElementById('beadsCounter').innerHTML = parseInt(numBeads);
        }
        else {
          numCandy++;
          console.log(numCandy);
          document.getElementById('candyCounter').innerHTML = parseInt(numCandy);
        }
      })
    }
  });
}

function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

function willCollide(o1, o2, o1_xChange, o1_yChange){
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

function isOrWillCollide(o1, o2, o1_xChange, o1_yChange){
  const o1D = { 'left': o1.offset().left + o1_xChange,
        'right': o1.offset().left + o1.width() + o1_xChange,
        'top': o1.offset().top + o1_yChange,
        'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = { 'left': o2.offset().left,
        'right': o2.offset().left + o2.width(),
        'top': o2.offset().top,
        'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
     // collision detected!
     return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max){
  return (Math.random() * (max - min)) + min;
}

function createThrowingItem(){
  console.log('Creating item to throw...');
  if (throwingItemIdx % 3 == 0) { // every 3rd item is candy

    var itemToBeThrown = createItemDivString(throwingItemIdx, 'candy', 'candy.png');
  }
  else {
 
    var itemToBeThrown = createItemDivString(throwingItemIdx, 'beads', 'beads.png');
  }

  gwhGame.append(itemToBeThrown);
  var updateItemToBeThrown = $('#i-' + throwingItemIdx); // required to fade this distinct object properly
  throwingItemIdx++;

  // get the xChange + yChange
  let startPosition = parseInt(paradeFloat2.css('left') + (paradeFloat2.width() / 2));
  var xChange = getRandomNumber(0 - startPosition, 454 - startPosition); // dont go beyond game-window bounds (500px)
  var yChange = getRandomNumber(-210, 210);
  var numIterations = getRandomNumber(15, 25); // random number of iterations as described in spec

  updateThrownItemPosition(updateItemToBeThrown, xChange, yChange, numIterations);
}

// throwingItemIdx - index of the item (a unique identifier)
// type - beads or candy
// imageString - beads.png or candy.png
function createItemDivString(itemIndex, type, imageString){
  return "<div id='i-" + itemIndex + "' class='throwingItem " + type + "'><img src='img/" + imageString + "'/></div>";
}

function updateThrownItemPosition(elementObj, xChange, yChange, iterationsLeft){
  console.log("Going to throw item...");

  // always throw it from the alligator float's center
  let startPosition = parseInt(paradeFloat2.css('left') + (paradeFloat2.width() / 2));
  let throwSpeed = getRandomNumber(10, 5);

  // get the speed
  let xAmountToMove = xChange / iterationsLeft;
  let yAmountToMove = yChange / iterationsLeft;

  elementObj.css('left', startPosition);
  elementObj.css('top', 250);

  // set a timer so it moves the candy
  let throwTimer = setInterval( function() {
    if (parseInt(iterationsLeft) == 0) {
      clearInterval(throwTimer); // finish the animation after iterations are up (i dont technically NEED this)
    }

    let xThrow = parseInt(elementObj.css('left'))+xAmountToMove;
    let yThrow = parseInt(elementObj.css('top'))+yAmountToMove;

    elementObj.css('left', xThrow);
    elementObj.css('top', yThrow);
    iterationsLeft--;

}, OBJECT_REFRESH_RATE); // does this every 50 ms

  let fadeCandy = setTimeout( function() {
    graduallyFadeAndRemoveElement(elementObj);
  }, 5000); // does this every 5 ms
}

function graduallyFadeAndRemoveElement(elementObj){
  // Fade to 0 opacity over 2 seconds
  elementObj.fadeTo(2000, 0, function(){
    $(this).remove();
  });
}

function startParade(){
  console.log("Starting parade...");
  paradeTimer = setInterval( function() {
      // (Depending on current position) update left value for each parade float
      let Float1 = parseInt(paradeFloat1.css('left'))+FLOAT_SPEED;
      let Float2 = parseInt(paradeFloat2.css('left'))+FLOAT_SPEED;
      if (Float1 > 500 && Float2 > 500) { // game window is 500 px
        Float1 = -300; // restart positions
        Float2 = -150; // restart positions
      }
      if (willCollide(paradeFloat1, player, FLOAT_SPEED, 0)) { // if it hits the lady
        Float1 = parseInt(paradeFloat1.css('left'));
        Float2 = parseInt(paradeFloat2.css('left'));
      }
      if (willCollide(paradeFloat2, player, FLOAT_SPEED, 0)) { // if it hits the alligator
        Float1 = parseInt(paradeFloat1.css('left'));
        Float2 = parseInt(paradeFloat2.css('left'));
      }
      paradeFloat1.css('left', Float1);
      paradeFloat2.css('left', Float2);
  }, OBJECT_REFRESH_RATE); // does this every 50 ms
}

// Handle player movement events
function movePerson(arrow) {
  switch (arrow) {
    case KEYS.left: { // left arrow
      let newPos = parseInt(player.css('left'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, -PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.right: { // right arrow
      let newPos = parseInt(player.css('left'))+PERSON_SPEED;
      if (newPos > maxPersonPosX) {
        newPos = maxPersonPosX;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      if (willCollide(player, paradeFloat2, PERSON_SPEED, 0)) {
        newPos = parseInt(player.css('left'));
      }
      player.css('left', newPos);
      break;
    }
    case KEYS.up: { // up arrow
      let newPos = parseInt(player.css('top'))-PERSON_SPEED;
      if (newPos < 0) {
        newPos = 0;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, -PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
    case KEYS.down: { // down arrow
      let newPos = parseInt(player.css('top'))+PERSON_SPEED;
      if (newPos > maxPersonPosY) {
        newPos = maxPersonPosY;
      }
      // code that makes it not go through parade
      if (willCollide(player, paradeFloat1, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      if (willCollide(player, paradeFloat2, 0, PERSON_SPEED)) {
        newPos = parseInt(player.css('top'));
      }
      player.css('top', newPos);
      break;
    }
  }
}

/* My code here */

function openSettingsPanel() {
  console.log("Opening settings panel...");

  let settingsButton = document.getElementById('settingsButton');
  let settingsPanel = document.getElementById('settingsPanel');

  if (settingsPanel.style.display === "none") {
    settingsButton.style.display = "none";
    console.log("opening panel");
    // settingsPanel.show();
    document.getElementById('settingsPanel').style.display = "block";
  }
}

function saveAndClose() {
  console.log("Save and close...");

  // Check for bad input
  // Good input: Is an integer + Is >= 100 
  let inputtedValue = document.getElementById('frequency').value;
  if (!Number.isInteger(parseInt(inputtedValue)))  {
    console.log("NOT AN INTEGER!");
    alert("Frequency must be a number greater than or equal to 100");
  }
  else if (parseInt(inputtedValue) < 100) {
    console.log("NOT >= 100");
    alert("Frequency must be a number greater than or equal to 100");
  }
  else { // Received valid input
    let settingsPanel = document.getElementById('settingsPanel');

    if (settingsPanel.style.display === "block") {
      document.getElementById('settingsButton').style.display = "block";
      document.getElementById('settingsPanel').style.display = "none";
    }

    // TODO! Update frequency + make sure it works in-game
    // currentThrowingFrequency = inputtedValue;
    createThrowingItemIntervalHandle = setInterval(createThrowingItem, inputtedValue);
  }
}

function discardAndClose() {
  console.log("Discard and close...");

  let settingsPanel = document.getElementById('settingsPanel');

  if (settingsPanel.style.display === "block") {
    document.getElementById('settingsButton').style.display = "block";
    document.getElementById('settingsPanel').style.display = "none";
  }
}