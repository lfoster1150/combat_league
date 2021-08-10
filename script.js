/// GLOBAL VARIABLES ///
let gameActive = false
let player1Score = 0
let player2Score = 0
let currentRoll = undefined
let tackleLocation = undefined
let ballLocation = 226
let isPlayer1Turn = true
let isPlayer2Turn = false
let hasPlayerRolled = false
let endTurn = false
let previousRadius = []
let player1OccupiedCells = []
// let player1TackleZone = ​[] /// giving an error for some reason. Will need to re-visit
let player2OccupiedCells = []
// let player2TackleZone ​= [] /// giving an error for some reason. Will need to re-visit
let currentTurnMovesRemaining = 0 // Will probably need to move inside a function ( counts down after every movement) //
let player1StartingPositions = [
  56, 146, 236, 326, 416, 58, 148, 238, 328, 418, 240
]
let player2StartingPositions = [
  35, 125, 215, 305, 395, 33, 123, 213, 303, 393, 211
]
let currentGamePiece = undefined
let currentMovesLeft = 0
let moveRadiusToBeRemoved = []
/// Body Parts ///
let field = document.querySelector('#field')
let fieldSquares = field.children
const instructions = document.querySelector('#instructions')
const endTurnButton = document.querySelector('#end-turn-button')
const rollButton = document.querySelector('#roll-button')
const rollAmount = document.querySelector('#roll-amount')
/// Functions ///
// Toggles  turn depending on who's currently in control.
const toggleTurn = () => {
  if (isPlayer1Turn) {
    isPlayer1Turn = false
    isPlayer2Turn = true
    setGamePieceEventListeners()
  } else {
    isPlayer1Turn = true
    isPlayer2Turn = false
    setGamePieceEventListeners()
  }
  endTurn = false
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
      console.log(
        `Position: ${event.target.dataset.position}`,
        `Row: ${event.target.dataset.row}`,
        `Column: ${event.target.dataset.column}`
      )
    })
  }
}
// Populates board with game pieces
const boardSetup = () => {
  /// setup for team 1
  for (let i = 0; i < 11; i++) {
    const gamePiece = document.createElement('div')
    gamePiece.classList.add('game-piece')
    gamePiece.id = 'team1'
    fieldSquares[player1StartingPositions[i] - 1].appendChild(gamePiece)
  }
  /// setup for team 2
  for (let i = 0; i < 11; i++) {
    const gamePiece = document.createElement('div')
    gamePiece.classList.add('game-piece')
    gamePiece.id = 'team2'
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
// Needed to handle roll after player selects piece to move
const handleMovementRoll = () => {
  instructions.innerText = 'Please press the roll button to roll your D20...'
  rollButton.addEventListener('click', () => {
    currentRoll = roll(20)
    instructions.innerText = `You rolled a ${currentRoll}!`
    rollAmount.innerText = currentRoll
    currentMovesLeft = currentRoll
    handleMove()
  })
}
const movePiece = (event) => {
  removeEventListenersAndResetColor(moveRadiusToBeRemoved)
  event.target.appendChild(currentGamePiece)
  currentMovesLeft -= 1
  handleMove()
}
// Removes event listeners and resets colors current movement radius
const removeEventListenersAndResetColor = (arr) => {
  for (let i = 0; i < 8; i++) {
    const cellToRemove = fieldSquares[arr[i] - 1]
    cellToRemove.removeEventListener('click', movePiece)
    cellToRemove.style.backgroundColor = 'green'
  }
}
// Handles movement after roll is made
const handleMove = () => {
  let fieldSquare = currentGamePiece.parentNode
  let squareLocation = fieldSquare.dataset.position
  instructions.innerText = `You have ${currentMovesLeft} moves left...`
  // endTurnButton.addEventListener('click', () => {
  //   return
  // })
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
  moveRadiusToBeRemoved = movesAvailableArray
  for (let i = 0; i < 8; i++) {
    const cellToHighlight = fieldSquares[movesAvailableArray[i] - 1]
    cellToHighlight.style.backgroundColor = 'lightgreen'
    cellToHighlight.addEventListener('click', movePiece)
  }
}
// Run when a ggame piece is clicked, then moves to handle roll
const gamePieceClicked = (event) => {
  const eventTarget = event.target
  currentGamePiece = eventTarget
  if (isPlayer1Turn) {
    for (let i = 0; i < 11; i++) {
      const gamePiece = fieldSquares[player1OccupiedCells[i] - 1]
      gamePiece.firstChild.removeEventListener('click', gamePieceClicked)
    }
    handleMovementRoll()
  } else {
    for (let i = 0; i < 11; i++) {
      const gamePiece = fieldSquares[player2OccupiedCells[i] - 1]
      gamePiece.firstChild.removeEventListener('click', gamePieceClicked)
    }
    handleMovementRoll()
  }
}
const setGamePieceEventListeners = () => {
  if (isPlayer1Turn) {
    for (let i = 0; i < 11; i++) {
      const gamePiece = fieldSquares[player1OccupiedCells[i] - 1]
      gamePiece.firstChild.addEventListener('click', gamePieceClicked)
    }
  } else {
    for (let i = 0; i < 11; i++) {
      const gamePiece = fieldSquares[player2OccupiedCells[i] - 1]
      gamePiece.firstChild.addEventListener('click', gamePieceClicked)
    }
  }
}
const startGame = () => {
  resetOccupiedCells()
  createField()
  boardSetup()
  setGamePieceEventListeners()
}
// Starts game on reload
startGame()
/// Event Listeners ///
