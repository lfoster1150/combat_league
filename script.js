/// GLOBAL VARIABLES ///
let gameActive = false
let player1Score = 0
let player2Score = 0
let currentRoll = undefined
let tackleLocation = undefined
let ballLocation = 226
let isPlayer1Turn = true
let isPlayer2Turn = false
let player1OccupiedCells = []
// let player1TackleZone = ​[] /// giving an error for some reason. Will need to re-visit
let player2OccupiedCells = []
// let player2TackleZone ​= [] /// giving an error for some reason. Will need to re-visit
let currentTurnMovesRemaining = 0 // Will probably need to move inside a function ( counts down after every movement) //
let player1StartingPositions = []
let player2StartingPositions = []

/// Functions ///
const startGame = () => {
  boardSetup()
}
/// Event Listeners ///

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

for (let i = 1; i <= fieldSquares.length; i++) {
  fieldSquares[i - 1].addEventListener('click', function (event) {
    console.log(
      `Position: ${event.target.dataset.position}`,
      `Row: ${event.target.dataset.row}`,
      `Column: ${event.target.dataset.column}`
    )
    console.log(event.target)
    const gamePiece = document.createElement('div')
    gamePiece.classList.add('game-piece')
    event.target.appendChild(gamePiece)
  })
}
