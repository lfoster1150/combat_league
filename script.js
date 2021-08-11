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
let player2StartingPositions = [
  56, 146, 236, 326, 416, 58, 148, 238, 328, 418, 240
]
let player1StartingPositions = [
  35, 125, 215, 305, 395, 33, 123, 213, 303, 393, 211
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

/// Body Parts ///
let field = document.querySelector('#field')
let fieldSquares = field.children
const instructions = document.querySelector('#instructions')
const endTurnButton = document.querySelector('#end-turn-button')
const rollButton1 = document.querySelector('#roll-button-1')
const rollButton2 = document.querySelector('#roll-button-2')
const rollAmount1 = document.querySelector('#roll-amount-1')
const rollAmount2 = document.querySelector('#roll-amount-2')
/// Functions ///
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
  if (isPlayer1Turn) {
    tackleRadiusTeam1 = player1OccupiedCells.map((position) => {
      return tackleRadiusOfPosition(position)
    })
  } else {
    tackleRadiusTeam2 = player2OccupiedCells.map((position) => {
      return tackleRadiusOfPosition(position)
    })
  }
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
  instructions.innerText = 'Please press the roll button to roll your D20...'
  if (isPlayer1Turn) {
    rollButton1.addEventListener('click', movementRoll)
  } else {
    rollButton2.addEventListener('click', movementRoll)
  }
}
// Checks for current piece moving into tackle radius of opponent. Returns index of opposite tem position is found returns -1 if not
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
  player1OccupiedCells = player1OccupiedCells.filter(
    (num) => num != tileAsNumber
  )
  player2OccupiedCells = player2OccupiedCells.filter(
    (num) => num != tileAsNumber
  )
}
// Handles a draw or if controlling player is destroyed
const handleAftermath = () => {
  instructions.innerText = `The controlling player was destroyed. Press [End Turn] button to end turn...`
  endTurnButton.addEventListener('click', endTurn)
}
// Handles results of tackle, and sends either to handleMove if the player is still in charge, or to handleAftermath if not
const tackleResult = (player1Rolled, player2Rolled) => {
  console.log(tackledGamePieceLocation)
  console.log(tacklerLocation)
  if (isPlayer1Turn) {
    if (player1Rolled === player2Rolled) {
      instructions.innerText = `There was a massive collision. Both players were injured in the process.`
      attachDebris(tackledGamePieceLocation)
      attachDebris(tacklerLocation)
      handleAftermath()
    } else if (player1Rolled > player2Rolled) {
      instructions.innerText = `Player 1 got the best of player 2. That tile is now cluttered with debris.`
      attachDebris(tacklerLocation)
      handleMove()
    } else {
      instructions.innerText = `Player 2 got the best of player 2. That tile is now cluttered with debris.`
      attachDebris(tackledGamePieceLocation)
      handleAftermath()
    }
  } else {
    if (player1Rolled === player2Rolled) {
      instructions.innerText = `There was a massive collision. Both players were injured in the process.`
      attachDebris(tackledGamePieceLocation)
      attachDebris(tacklerLocation)
      handleAftermath()
    } else if (player1Rolled > player2Rolled) {
      instructions.innerText = `Player 1 got the best of player 1. That tile is now cluttered with debris.`
      attachDebris(tackledGamePieceLocation)
      handleAftermath()
    } else {
      instructions.innerText = `Player 2 got the best of player 1. That tile is now cluttered with debris.`
      attachDebris(tacklerLocation)
      handleMove()
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
const handleTackleRoll = () => {
  if (hasPlayer1Rolled && hasPlayer2Rolled) {
    const player1Rolled = parseFloat(rollAmount1.innerText)
    const player2Rolled = parseFloat(rollAmount2.innerText)
    tackleResult(player1Rolled, player2Rolled)
  } else if (hasPlayer1Rolled) {
    instructions.innerText = `Player 1 rolled a ${rollAmount1.innerText}. Player 2, press the ${team2Color} [ROLL] button to roll...`
    // rollButton2.addEventListener('click', tackleRoll2)
  } else if (hasPlayer2Rolled) {
    instructions.innerText = `Player 2 rolled a ${rollAmount2.innerText}. Player 1, press the ${team1Color} [ROLL] button to roll...`
    // rollButton1.addEventListener('click', tackleRoll1)
  } else {
    instructions.innerText = `Player 2, press the ${team1Color} [ROLL] button to roll. Player 2, press the ${team2Color} [ROLL] button to roll...`
    rollButton1.addEventListener('click', tackleRoll1)
    rollButton2.addEventListener('click', tackleRoll2)
  }
}
// Handles tackle given current game piece and tackle location
const handleTackle = (gamePiece, arrPosition) => {
  tackledGamePieceLocation = parseFloat(gamePiece.parentNode.dataset.position)
  if (isPlayer1Turn) {
    console.log(player2OccupiedCells)
    let parsedArrPosition = parseFloat(arrPosition)
    tacklerLocation = player2OccupiedCells[parsedArrPosition]
    handleTackleRoll()
  } else {
    console.log(player1OccupiedCells)
    let parsedArrPosition = parseFloat(arrPosition)
    tacklerLocation = player1OccupiedCells[parsedArrPosition]
    handleTackleRoll()
  }
}
// Actually removes the piece
const movePiece = (event) => {
  removeEventListenersAndResetColor(moveRadiusToBeRemoved)
  event.target.appendChild(currentGamePiece)
  currentMovesLeft -= 1
  squareMovedTo = parseFloat(event.target.dataset.position)
  updatePositions()
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

// Handles movement after roll is made
const handleMove = () => {
  let fieldSquare = currentGamePiece.parentNode
  let squareLocation = fieldSquare.dataset.position
  squareMovedFrom = squareLocation

  if (currentMovesLeft === 0) {
    instructions.innerText = `You have ${currentMovesLeft} moves left. Press [End Turn] button to end turn...`
    endTurnButton.addEventListener('click', endTurn)
  } else {
    instructions.innerText = `You have ${currentMovesLeft} moves left. Make your move or press the [End Turn] button to end turn...`
    endTurnButton.addEventListener('click', endTurn)
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
    movesAvailableArray = movesAvailableArray.map((num) => parseFloat(num))
    movesAvailableArray = movesAvailableArray.filter((num) => {
      const parsedNum = parseFloat(num)
      const player1Check = player1OccupiedCells.indexOf(parsedNum) > 0
      const player2Check = player2OccupiedCells.indexOf(parsedNum) > 0
      const debrisCheck = tilesWithDebris.indexOf(parsedNum) > 0
      return !(player1Check || player2Check || debrisCheck)
    })
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

// Run when a ggame piece is clicked, then moves to handle roll
const gamePieceClicked = (event) => {
  const eventTarget = event.target
  currentGamePiece = eventTarget
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
const startGame = () => {
  resetOccupiedCells()
  createField()
  boardSetup()
  setGamePieceEventListeners()
  initializeTackleRadius()
}
// Starts game on reload
startGame()
/// Event Listeners ///
