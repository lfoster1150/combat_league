const field = document.querySelector('#field')
const fieldSquares = field.children
for (let i = 1; i <= 50; i++) {
  const fieldSquare = document.createElement('div')
  fieldSquare.classList.add('field-square')
  fieldSquare.dataset.position = i
  field.appendChild(fieldSquare)
}
for (let i = 1; i <= fieldSquares.length; i++) {
  fieldSquares[i - 1].addEventListener('click', function (event) {
    console.log(`Position: ${event.target.dataset.position}`)
  })
}
