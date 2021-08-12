/// GLOBAL VARIABLES ///
const team1Name = 'Team 1'
const team2Name = 'Team 2'
const team1Color = 'red'
const team2Color = 'blue'
let gameActive = false
let player1Score = 0
let player2Score = 0
let currentRoll = undefined
let ballLocation = 226
let isPlayer1Turn = true
let isPlayer2Turn = false
let previousRadius = []
let player1OccupiedCells = []
let player2OccupiedCells = []
let currentTurnMovesRemaining = 0 // Will probably need to move inside a function ( counts down after every movement) //
// Starting Positions for actual game
// let player1StartingPositions = [
//   35, 125, 215, 305, 395, 33, 123, 213, 303, 393, 211
// ]
// let player2StartingPositions = [
//   56, 146, 236, 326, 416, 58, 148, 238, 328, 418, 240
// ]
// Starting positions for testing
let player1StartingPositions = [
  35, 125, 215, 305, 395, 33, 123, 213, 303, 393, 211
]
player1StartingPositions = player1StartingPositions.map((num) => num + 8)
let player2StartingPositions = [
  56, 146, 236, 326, 416, 58, 148, 238, 328, 418, 240
]
player2StartingPositions = player2StartingPositions.map((num) => num - 8)
const team2GoalLine = [
  1, 31, 61, 91, 121, 151, 181, 211, 241, 271, 301, 331, 361, 391, 421
]
const team1GoalLine = [
  30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450
]
let tackleRadiusTeam1 = []
let tackleRadiusTeam2 = []
let currentGamePiece = undefined
let currentMovesLeft = 0
let moveRadiusToBeRemoved = []
let squareMovedFrom = 0
let squareMovedTo = 0
let tilesWithDebris = []
// Global variables used in tackling functions
let hasPlayer1Rolled = false
let hasPlayer2Rolled = false
let tackledGamePieceLocation = 0
let tacklerLocation = 0
// Global variables used for ball logic
// ball location at start. Will change during gameplay
const startingBallLocation = 226
let currentBallLocation = 226
let isCurrentGamePieceCarryingBall = false
let player1HasBall = false
let player2HasBall = false
let isBallInvolvedInTackle = false
/// Body Parts ///
let field = document.querySelector('#field')
let fieldSquares = field.children
const instructions = document.querySelector('#instructions')
const instructionsContainer = document.querySelector('#instructions-container')
const endTurnButton = document.querySelector('#end-turn-button')
const rollButton1 = document.querySelector('#roll-button-1')
const rollButton2 = document.querySelector('#roll-button-2')
const rollAmount1 = document.querySelector('#roll-amount-1')
const rollAmount2 = document.querySelector('#roll-amount-2')
const endzone1 = document.querySelector('#endzone1')
const endzone2 = document.querySelector('#endzone2')
const halfTimePage = document.querySelector('#half-time')
const fullTimePage = document.querySelector('#full-time')
const halfTimeMessage = document.querySelector('#half-time-message')
const halfScoreTeam1 = document.querySelector('#half-score-team1')
const halfScoreTeam2 = document.querySelector('#half-score-team2')
/// Functions ///
/// Can use space bar to end/continue turn
const spaceBar = (event) => {
  if (event.key === ' ') {
    endTurnButton.click()
  }
}
// testing for half time
player1Score = 0
player2Score = 1

// displays half time screen
const halfTime = () => {
  if (player1Score === 1 && player2Score === 0) {
    halfTimeMessage.innerText = `${team1Name} got the early lead! Let's see what happens in the second half...`
    halfScoreTeam1.innerText = player1Score
  } else if (player1Score === 0 && player2Score === 1) {
    halfTimeMessage.innerText = `${team2Name} got the early lead! Let's see what happens in the second half...`
    halfScoreTeam2.innerText = player2Score
  } else if (player1Score === 1 && player2Score === 1) {
    halfTimeMessage.innerText = `${team1Name} and ${team2Name} are tied at the end of regulation. We're going to need another half to settle this...`
    halfScoreTeam1.innerText = player1Score
    halfScoreTeam2.innerText = player2Score
  } else {
    console.log('Something went wrong at halftime')
  }
}
// Checks for winner. If no winner throws to halftime screen
const checkForWinner = () => {
  if (player1Score > 1 || player2Score > 1) {
    // throw to winner screen
  } else {
    halfTime()
  }
}
// testing for half time
checkForWinner()
// SCORE
const score = () => {
  if (isPlayer1Turn) {
    instructionsColors()
    instructions.innerText = 'PLAYER 1 SCORES'
    instructionsContainer.style.backgroundColor = 'darkred'
    endzone2.removeEventListener('click', score)
    player1Score++
    checkForWinner()
  } else {
    instructionsColors()
    instructions.innerText = 'PLAYER 2 SCORES'
    instructionsContainer.style.backgroundColor = 'darkblue'
    endzone1.removeEventListener('click', score)
    player2Score++
    checkForWinner()
  }
}
// Checks forscore if player has ball and is moving
const checkForScore = () => {
  if (currentMovesLeft > 0) {
    if (isPlayer1Turn) {
      team1GoalLine.forEach((num) => {
        if (num === currentBallLocation) {
          endzone2.addEventListener('click', score)
        } else {
          return
        }
      })
    } else {
      team2GoalLine.forEach((num) => {
        if (num === currentBallLocation) {
          endzone1.addEventListener('click', score)
        } else {
          return
        }
      })
    }
  } else {
    return
  }
}
// instructionsColors
const instructionsColors = () => {
  if (isPlayer1Turn) {
    instructionsContainer.style.backgroundColor = 'darkred'
  } else {
    instructionsContainer.style.backgroundColor = 'darkblue'
  }
}
/// current team returns a string with the team name of whoever is currently in control
const currentTeam = () => {
  if (isPlayer1Turn) {
    return team1Name
  } else {
    return team2Name
  }
}
/// current color returns a string with the color whoever is currently in control
const currentColor = () => {
  if (isPlayer1Turn) {
    return team1Color
  } else {
    return team2Color
  }
}
const tackleRadiusOfPosition = (position) => {
  return [
    position - 31,
    position - 30,
    position - 29,
    position - 1,
    position + 1,
    position + 29,
    position + 30,
    position + 31
  ]
}
// similar to tacke radius, but used for fumbles instead
const fumbleRadiusOfPosition = (position) => {
  let parsedPosition = parseFloat(position)
  let fumbleArray = [
    parsedPosition - 31,
    parsedPosition - 30,
    parsedPosition - 29,
    parsedPosition - 1,
    parsedPosition + 1,
    parsedPosition + 29,
    parsedPosition + 30,
    parsedPosition + 31
  ]
  fumbleArray = fumbleArray.filter((num) => {
    for (let i = 0; i < tilesWithDebris.length; i++) {
      if (num === tilesWithDebris[i]) {
        return false
      } else {
        return num
      }
    }
  })
  return fumbleArray
}
// Sets up TR for both teams at beginning of game
const initializeTackleRadius = () => {
  tackleRadiusTeam1 = player1OccupiedCells.map((position) => {
    return tackleRadiusOfPosition(position)
  })
  tackleRadiusTeam2 = player2OccupiedCells.map((position) => {
    return tackleRadiusOfPosition(position)
  })
}
// Updates tackle radius of team that just ended turn based on updatePositions()
const updateTackleRadius = () => {
  tackleRadiusTeam1 = player1OccupiedCells.map((position) =>
    tackleRadiusOfPosition(position)
  )

  tackleRadiusTeam2 = player2OccupiedCells.map((position) =>
    tackleRadiusOfPosition(position)
  )
}
// Updates current positions array for team
const updatePositions = () => {
  const parsedSquareMovedFrom = parseFloat(squareMovedFrom)
  const parsedSquareMovedTo = parseFloat(squareMovedTo)
  if (isPlayer1Turn) {
    player1OccupiedCells = player1OccupiedCells.map((position) => {
      const parsedPosition = parseFloat(position)
      if (parsedPosition === parsedSquareMovedFrom) {
        return parsedSquareMovedTo
      } else {
        return parsedPosition
      }
    })
  } else {
    player2OccupiedCells = player2OccupiedCells.map((position) => {
      const parsedPosition = parseFloat(position)
      if (parsedPosition === parsedSquareMovedFrom) {
        return parsedSquareMovedTo
      } else {
        return parsedPosition
      }
    })
  }
  updateTackleRadius()
}
// Toggles  turn depending on who's currently in control.
const toggleTurn = () => {
  if (isPlayer1Turn) {
    isPlayer1Turn = false
    isPlayer2Turn = true
  } else {
    isPlayer1Turn = true
    isPlayer2Turn = false
  }
  updatePositions()
  setGamePieceEventListeners()
  checkIfGamePieceHasBall()
  currentMovesLeft = 0
}
// Creates all 450 unique game squares
const createField = () => {
  const field = document.querySelector('#field')
  const fieldSquares = field.children
  for (let i = 1; i <= 15; i++) {
    for (let j = 1; j <= 30; j++) {
      const fieldSquare = document.createElement('div')
      fieldSquare.classList.add('field-square')
      fieldSquare.dataset.row = i
      fieldSquare.dataset.column = j
      fieldSquare.dataset.position = j + (i - 1) * 30
      field.appendChild(fieldSquare)
    }
  }
  /// Used only for console logging
  for (let i = 1; i <= fieldSquares.length; i++) {
    fieldSquares[i - 1].addEventListener('click', function (event) {
      //   console.log(
      //     `Position: ${event.target.dataset.position}`,
      //     `Row: ${event.target.dataset.row}`,
      //     `Column: ${event.target.dataset.column}`
      //   )
    })
  }
}
// Populates board with game pieces
const boardSetup = () => {
  /// setup for team 1
  for (let i = 0; i < 11; i++) {
    const gamePiece = document.createElement('div')
    gamePiece.classList.add('game-piece')
    gamePiece.classList.add('team1')
    fieldSquares[player1StartingPositions[i] - 1].appendChild(gamePiece)
  }
  /// setup for team 2
  for (let i = 0; i < 11; i++) {
    const gamePiece = document.createElement('div')
    gamePiece.classList.add('game-piece')
    gamePiece.classList.add('team2')
    fieldSquares[player2StartingPositions[i] - 1].appendChild(gamePiece)
  }
}
// Resets player locations to starting locations
const resetOccupiedCells = () => {
  player1OccupiedCells = player1StartingPositions
  player2OccupiedCells = player2StartingPositions
}
// Takes in a dice size and returns a random number between 1 and the dice size
const roll = (diceSize) => {
  return Math.ceil(Math.random() * diceSize)
}
// Fires after roll button clicked for movement
const movementRoll = () => {
  currentRoll = roll(20)
  instructionsColors()
  instructions.innerText = `You rolled a ${currentRoll}!`
  if (isPlayer1Turn) {
    rollButton1.removeEventListener('click', movementRoll)
    rollAmount1.innerText = currentRoll
  } else {
    rollButton2.removeEventListener('click', movementRoll)
    rollAmount2.innerText = currentRoll
  }
  currentMovesLeft = currentRoll
  handleMove()
}
// Needed to handle roll after player selects piece to move
const handleMovementRoll = () => {
  instructionsColors()
  instructions.innerText = 'Please press the roll button to roll your D20...'
  if (isPlayer1Turn) {
    rollButton1.addEventListener('click', movementRoll)
  } else {
    rollButton2.addEventListener('click', movementRoll)
  }
}
// Checks for current piece moving into tackle radius of opponent. Returns index of opposite team position is found returns -1 if not
const checkForTackle = (position) => {
  if (isPlayer1Turn) {
    let currentIndex = 0
    return tackleRadiusTeam2.reduce((acc, arr) => {
      if (arr.indexOf(position) >= 0) {
        acc = tackleRadiusTeam2.indexOf(arr)
        return currentIndex
      } else {
        currentIndex++
        return acc
      }
    }, -1)
  } else {
    let currentIndex = 0
    return tackleRadiusTeam1.reduce((acc, arr) => {
      if (arr.indexOf(position) >= 0) {
        return currentIndex
      } else {
        currentIndex++
        return acc
      }
    }, -1)
  }
}
// Removes event listeners and resets colors current movement radius
const removeEventListenersAndResetColor = (arr) => {
  for (let i = 0; i < arr.length; i++) {
    const cellToRemove = fieldSquares[arr[i] - 1]
    if (cellToRemove) {
      cellToRemove.removeEventListener('click', movePiece)
      cellToRemove.style.backgroundColor = 'green'
    } else {
      continue
    }
  }
}
// Ends Turn When Button Pressed
const endTurn = () => {
  endTurnButton.removeEventListener('click', endTurn)
  removeEventListenersAndResetColor(moveRadiusToBeRemoved)
  updatePositions()
  toggleTurn()
}
const attachDebris = (tile) => {
  const tileAsNumber = parseFloat(tile)
  let gamePieceTile = fieldSquares[tileAsNumber - 1]
  const firstChild = gamePieceTile.firstChild
  firstChild.remove()
  const debris = document.createElement('div')
  debris.classList.add('debris')
  gamePieceTile.appendChild(debris)
  tilesWithDebris.push(tileAsNumber)
  updateTackleRadius()
  player1OccupiedCells = player1OccupiedCells.filter(
    (num) => num != tileAsNumber
  )
  player2OccupiedCells = player2OccupiedCells.filter(
    (num) => num != tileAsNumber
  )
}
// Resets tackle roll status ()
const resetTackleRolls = () => {
  hasPlayer1Rolled = false
  hasPlayer2Rolled = false
}
const resetRollText = () => {
  rollAmount1.innerText = 00
  rollAmount2.innerText = 00
}
// Throws to handle move after controlling player wins a tackle
const continueMove = () => {
  endTurnButton.removeEventListener('click', continueMove)
  endTurnButton.innerText = 'END TURN'
  handleMove()
}
// Attaches ball after fumble
const attachBallAfterFumble = (location) => {
  const gamePieceLocation = fieldSquares[location - 1]
  const gamePiece = gamePieceLocation.firstElementChild
  const ball = document.getElementById('#ball')
  gamePiece.append(ball)
  checkIfGamePieceHasBall()
}
// handles fumble
const fumble = (arr) => {
  const randNumber = Math.floor(Math.random() * arr.length)
  let randLocation = parseFloat(arr[randNumber])
  const team1LocationCheck = player1OccupiedCells.reduce((acc, num) => {
    if (num === randLocation) {
      acc = randLocation
      return acc
    } else {
      return acc
    }
  }, -1)
  const team2LocationCheck = player2OccupiedCells.reduce((acc, num) => {
    if (num === randLocation) {
      acc = randLocation
      return acc
    } else {
      return acc
    }
  }, -1)
  if (team1LocationCheck > 0) {
    player1HasBall = true
    player2HasBall = false
    currentBallLocation = randLocation
    attachBallAfterFumble(randLocation)
  } else if (team2LocationCheck > 0) {
    player1HasBall = false
    player2HasBall = true
    currentBallLocation = randLocation
    attachBallAfterFumble(randLocation)
  } else {
    currentBallLocation = randLocation
    placeBall(randLocation)
  }
  updateBallLocation()
  checkIfGamePieceHasBall()
}
// Handles a draw or if controlling player is destroyed
const handleAftermath = (location) => {
  resetTackleRolls()
  if (location === currentBallLocation) {
    const fumbleArray = fumbleRadiusOfPosition(location)
    fumble(fumbleArray)
    isBallInvolvedInTackle = false
    instructions.innerText = `The controlling player was destroyed and the ball was fumbled to a random square. Press [End Turn] button to end turn...`
  }
  instructionsColors()
  instructions.innerText = `The player was destroyed. Press [End Turn] button to end turn...`
  endTurnButton.addEventListener('click', endTurn)
}
// Handlesif controlling player is not destroyed
const handleAftermathControllerWins = (location) => {
  resetTackleRolls()
  if (location === currentBallLocation) {
    const fumbleArray = fumbleRadiusOfPosition(location)
    fumble(fumbleArray)
    isBallInvolvedInTackle = false
  }
  endTurnButton.removeEventListener('click', endTurn)
  instructionsColors()
  instructions.innerText = `The controlling player survived the tackle. Press [CONTINUE] button to continue turn...`
  endTurnButton.innerText = 'CONTINUE'
  endTurnButton.addEventListener('click', continueMove)
}
// Handles results of tackle, and sends either to handleMove if the player is still in charge, or to handleAftermath if not
const tackleResult = (player1Rolled, player2Rolled) => {
  if (isPlayer1Turn) {
    if (player1Rolled === player2Rolled) {
      instructions.innerText = `There was a massive collision. Both players were injured in the process.`
      attachDebris(tackledGamePieceLocation)
      attachDebris(tacklerLocation)
      handleAftermath(tackledGamePieceLocation)
    } else if (player1Rolled > player2Rolled) {
      instructionsContainer.style.backgroundColor = 'darkred'
      instructions.innerText = `Player 1 got the best of player 2. That tile is now cluttered with debris.`
      attachDebris(tacklerLocation)
      handleAftermathControllerWins(tacklerLocation)
    } else {
      instructionsContainer.style.backgroundColor = 'darkblue'
      instructions.innerText = `Player 2 got the best of player 1. That tile is now cluttered with debris.`
      attachDebris(tackledGamePieceLocation)
      handleAftermath(tackledGamePieceLocation)
    }
  } else {
    if (player1Rolled === player2Rolled) {
      instructions.innerText = `There was a massive collision. Both players were injured in the process.`
      attachDebris(tackledGamePieceLocation)
      attachDebris(tacklerLocation)
      handleAftermath(tackledGamePieceLocation)
    } else if (player1Rolled > player2Rolled) {
      instructionsContainer.style.backgroundColor = 'darkred'
      instructions.innerText = `Player 1 got the best of player 2. That tile is now cluttered with debris.`
      attachDebris(tackledGamePieceLocation)
      handleAftermath(tackledGamePieceLocation)
    } else {
      instructionsContainer.style.backgroundColor = 'darkblue'
      instructions.innerText = `Player 2 got the best of player 1. That tile is now cluttered with debris.`
      attachDebris(tacklerLocation)
      handleAftermathControllerWins(tacklerLocation)
    }
  }
}
const tackleRoll1 = () => {
  const roll1 = roll(20)
  rollAmount1.innerText = roll1
  rollButton1.removeEventListener('click', tackleRoll1)
  hasPlayer1Rolled = true
  handleTackleRoll()
}
const tackleRoll2 = () => {
  const roll2 = roll(20)
  rollAmount2.innerText = roll2
  rollButton2.removeEventListener('click', tackleRoll2)
  hasPlayer2Rolled = true
  handleTackleRoll()
}
// Checks if ball is involved in tackle
const checkIfIsBallInvolvedInTackle = () => {
  updateBallLocation()
  if (
    tacklerLocation === currentBallLocation ||
    tackledGamePieceLocation === currentBallLocation
  )
    isBallInvolvedInTackle = true
  else {
    isBallInvolvedInTackle = false
  }
}
const handleTackleRoll = () => {
  checkIfIsBallInvolvedInTackle()
  if (hasPlayer1Rolled && hasPlayer2Rolled) {
    const player1Rolled = parseFloat(rollAmount1.innerText)
    const player2Rolled = parseFloat(rollAmount2.innerText)
    tackleResult(player1Rolled, player2Rolled)
  } else if (hasPlayer1Rolled) {
    instructionsContainer.style.backgroundColor = 'darkblue'
    instructions.innerText = `Player 1 rolled a ${rollAmount1.innerText}. Player 2, press the ${team2Color} [ROLL] button to roll...`
  } else if (hasPlayer2Rolled) {
    instructionsContainer.style.backgroundColor = 'darkred'
    instructions.innerText = `Player 2 rolled a ${rollAmount2.innerText}. Player 1, press the ${team1Color} [ROLL] button to roll...`
  } else {
    instructions.innerText = `Player 1, press the ${team1Color} [ROLL] button to roll. Player 2, press the ${team2Color} [ROLL] button to roll...`
    rollButton1.addEventListener('click', tackleRoll1)
    rollButton2.addEventListener('click', tackleRoll2)
  }
}
// Handles tackle given current game piece and tackle location
const handleTackle = (gamePiece, arrPosition) => {
  endTurnButton.removeEventListener('click', endTurn)
  tackledGamePieceLocation = parseFloat(gamePiece.parentNode.dataset.position)
  if (isPlayer1Turn) {
    let parsedArrPosition = parseFloat(arrPosition)
    tacklerLocation = player2OccupiedCells[parsedArrPosition]
    handleTackleRoll()
  } else {
    let parsedArrPosition = parseFloat(arrPosition)
    tacklerLocation = player1OccupiedCells[parsedArrPosition]
    handleTackleRoll()
  }
  updateBallLocation()
}
// removes ball from tile
const removeBall = () => {
  const ball = document.querySelector('#ball')
  ball.remove()
}
// Attaches ball to game piece
const attachBallToGamePiece = (gamePiece) => {
  if (isPlayer1Turn) {
    player1HasBall = true
    player2HasBall = false
  } else {
    player1HasBall = false
    player2HasBall = true
  }
  const ball = document.querySelector('#ball')
  gamePiece.append(ball)
  checkIfGamePieceHasBall()
}
// Checks for ball before each move
const checkForBall = (square) => {
  if (square === currentBallLocation) {
    return true
  } else {
    return false
  }
}
// Actually moves the piece
const movePiece = (event) => {
  removeEventListenersAndResetColor(moveRadiusToBeRemoved)
  squareMovedTo = parseFloat(event.target.dataset.position)
  if (checkForBall(squareMovedTo)) {
    attachBallToGamePiece(currentGamePiece)
    event.target.appendChild(currentGamePiece)
    checkIfGamePieceHasBall()
  } else {
    event.target.appendChild(currentGamePiece)
    checkIfGamePieceHasBall()
  }
  currentMovesLeft -= 1
  updatePositions()
  updateBallLocation()
  if (isCurrentGamePieceCarryingBall) {
    checkForScore()
  }
  let tacklerArrayLocation = checkForTackle(squareMovedTo)
  tacklerArrayLocation = parseFloat(tacklerArrayLocation)
  if (tacklerArrayLocation >= 0) {
    handleTackle(currentGamePiece, tacklerArrayLocation)
  } else {
    if (tacklerArrayLocation < 0 && currentMovesLeft >= 0) {
      handleMove()
    } else {
      updatePositions()
      toggleTurn()
    }
  }
}
// Updates movesAvailableArray, returns arrray
const updateMovesAvailableArray = (squareLocation) => {
  let movesAvailableArray = [
    parseFloat(squareLocation) - 31,
    parseFloat(squareLocation) - 30,
    parseFloat(squareLocation) - 29,
    parseFloat(squareLocation) - 1,
    parseFloat(squareLocation) + 1,
    parseFloat(squareLocation) + 29,
    parseFloat(squareLocation) + 30,
    parseFloat(squareLocation) + 31
  ]
  const parsedTilesWithDebris = tilesWithDebris.map((num) => parseFloat(num))
  let parsedMovesAvailableArray = movesAvailableArray.map((num) =>
    parseFloat(num)
  )
  parsedMovesAvailableArray = parsedMovesAvailableArray.filter((num) => {
    const parsedNum = parseFloat(num)
    const player1Check = player1OccupiedCells.indexOf(parsedNum) >= 0
    const player2Check = player2OccupiedCells.indexOf(parsedNum) >= 0
    const debrisCheck = parsedTilesWithDebris.indexOf(parsedNum) >= 0
    return !(player1Check || player2Check || debrisCheck)
  })
  return parsedMovesAvailableArray
}
// updates location of ball based on weather ball is part of a square or game piece
const updateBallLocation = () => {
  const ball = document.querySelector('#ball')
  if (ball.parentNode.dataset.position) {
    currentBallLocation = parseFloat(ball.parentNode.dataset.position)
  } else if (ball.parentNode.parentNode.dataset.position) {
    currentBallLocation = parseFloat(
      ball.parentNode.parentNode.dataset.position
    )
  } else {
    console.log(`Can't find ball...`)
  }
}
// Handles movement after roll is made
const handleMove = () => {
  updateBallLocation()
  let fieldSquare = currentGamePiece.parentNode
  let squareLocation = fieldSquare.dataset.position
  squareMovedFrom = squareLocation
  if (currentMovesLeft === 0) {
    instructionsColors()
    instructions.innerText = `You have ${currentMovesLeft} moves left. Press [End Turn] button to end turn...`
    endTurnButton.addEventListener('click', endTurn)
  } else {
    instructionsColors()
    instructions.innerText = `You have ${currentMovesLeft} moves left. Make your move or press the [End Turn] button to end turn...`
    endTurnButton.addEventListener('click', endTurn)
    let movesAvailableArray = updateMovesAvailableArray(squareLocation)
    moveRadiusToBeRemoved = movesAvailableArray
    for (let i = 0; i < movesAvailableArray.length; i++) {
      const cellToHighlight = fieldSquares[movesAvailableArray[i] - 1]
      if (cellToHighlight) {
        cellToHighlight.style.backgroundColor = 'lightgreen'
        cellToHighlight.addEventListener('click', movePiece)
      } else {
        continue
      }
    }
  }
}
// checks if clicked game piece has the ball returns true/false
const checkIfGamePieceHasBall = () => {
  if (currentGamePiece.firstChild) {
    isCurrentGamePieceCarryingBall = true
    return true
  } else {
    isCurrentGamePieceCarryingBall = false
    return false
  }
}
// Run when a ggame piece is clicked, then moves to handle roll
const gamePieceClicked = (event) => {
  resetRollText()
  const eventTarget = event.target
  currentGamePiece = eventTarget
  checkIfGamePieceHasBall()
  squareMovedFrom = event.target.parentNode.dataset.position
  if (isPlayer1Turn) {
    for (let i = 0; i < player1OccupiedCells.length; i++) {
      const gamePiece = fieldSquares[player1OccupiedCells[i] - 1]
      gamePiece.firstChild.removeEventListener('click', gamePieceClicked)
    }
    handleMovementRoll()
  } else {
    for (let i = 0; i < player2OccupiedCells.length; i++) {
      const gamePiece = fieldSquares[player2OccupiedCells[i] - 1]
      gamePiece.firstChild.removeEventListener('click', gamePieceClicked)
    }
    handleMovementRoll()
  }
}
const setGamePieceEventListeners = () => {
  instructionsColors()
  instructions.innerText = `It's ${currentTeam()}'s turn.! Pick a ${currentColor()} game piece to start move...`
  if (isPlayer1Turn) {
    for (let i = 0; i < player1OccupiedCells.length; i++) {
      const parsedCell = parseFloat(player1OccupiedCells[i])
      const gamePiece = fieldSquares[parsedCell - 1]
      if (gamePiece.firstChild) {
        gamePiece.firstChild.addEventListener('click', gamePieceClicked)
      } else {
        continue
      }
    }
  } else {
    for (let i = 0; i < player2OccupiedCells.length; i++) {
      const parsedCell = parseFloat(player2OccupiedCells[i])
      const gamePiece = fieldSquares[parsedCell - 1]
      if (gamePiece.firstChild) {
        gamePiece.firstChild.addEventListener('click', gamePieceClicked)
      } else {
        continue
      }
    }
  }
}
const placeBall = (ballLocation) => {
  const parsedBallLocation = parseFloat(ballLocation)
  const gameBall = document.createElement('div')
  gameBall.classList.add('ball')
  gameBall.id = 'ball'
  fieldSquares[parsedBallLocation - 1].appendChild(gameBall)
}
// testing function. Remove after
// Resets entire game
const resetGame = () => {}
const startGame = () => {
  resetOccupiedCells()
  createField()
  boardSetup()
  placeBall(startingBallLocation)
  setGamePieceEventListeners()
  initializeTackleRadius()
}
// Starts game on reload
startGame()
/// Event Listeners ///

document.addEventListener('keydown', spaceBar)
