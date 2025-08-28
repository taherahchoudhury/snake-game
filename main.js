const scoreSound = new Audio('audio/score.mp3');
const gameoverSound = new Audio('audio/gameover.mp3');

const boardWidth = 400; // Board width
const boardHeight = 400; // Board height

const widthOfCell = 20; 

const rows = boardWidth/widthOfCell;
const cols = boardHeight/widthOfCell;

let snakeParts = getSnakeStartLocation();

const row = Math.floor((rows - 1)/2);
const col = (cols - 2)

let foodLocation = getFoodStartLocation();
let direction = 'right'
let tailDirection = 'left'

let gameLoop = null;
let gameActive = true;

let score = 0;
let highscore = 0;

function createBoard() {
    const board = document.getElementById("board");
    board.innerHTML = '';
    // Set CSS grid properties dynamically
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    // board -> cell -> content
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Create cell div
            const cell = document.createElement("div");
            cell.setAttribute("class", "cell");

            // Append cell to the board
            board.appendChild(cell);
        }
    }

    updateBoard();
}

function getFoodStartLocation() { return { row: row, col: col }; }

function updateBoard() {
    const cells = document.querySelectorAll(".board .cell");
    
    cells.forEach(cell => {
        cell.innerHTML = '';
    });

    placeSnake(cells);
    placeFood(cells);
}

function updateScore() {
    if (gameActive) {
        score++;
    } else {
        score = 0;
    }
    document.getElementById('scoreBoard').innerText = `Score: ${score}`; 
}

function updateHighscore() {
    if (score > highscore) {
        highscore = score;
    }

    document.getElementById('highscoreBoard').innerText = `High Score: ${highscore}`;
}

function placeSnake(cells) {
    snakeParts.forEach((part, index) => { 
        let snakeElement = document.createElement("div");
        const cellIndex = getIndex(part.row, part.col);

        if (index === 0) {
            snakeElement.setAttribute("class", `snake head ${direction}`);
        } else if (index === snakeParts.length - 1) {
            tailDirection = getTailDirection(); 
            snakeElement.setAttribute("class", `snake tail ${tailDirection}`);
        } else {
            snakeElement.setAttribute("class", "snake");
        }
        
        cells[cellIndex].appendChild(snakeElement);
    });

    console.log("snake has been placed");
}

function getTailDirection() {
    // Get the index of the last two parts of snake (tail, part before the tail)
    const tail = snakeParts[snakeParts.length - 1]
    const partBeforeTail = snakeParts[snakeParts.length - 2]

    if (tail.row > partBeforeTail.row) {return "down";} 
    if (tail.row < partBeforeTail.row) {return "up";} 
    if (tail.col > partBeforeTail.col) {return "left";} 
    if (tail.col < partBeforeTail.col) {return "right";}

    return "";
}

function placeFood(cells) {
    index = getIndex(foodLocation.row, foodLocation.col)

    const food = document.createElement("div");
    food.setAttribute("class", "food");
    cells[index].appendChild(food);

    console.log("food has been placed");
}

function getSnakeStartLocation() {
    const row = Math.floor((rows - 1)/2);
    const columnHead = row;
    const columnTail = row - 1;

    return [{ row: row, col: columnHead }, { row: row, col: columnTail }];
}

function getIndex(row, col) {
    if (col < 0 || row < 0 || col > cols - 1 || row > rows - 1 ) {
        return -1;
    }
    return (col + row * cols);
}

function moveSnake() {
    const tail = snakeParts.pop();
    const newHead = calculateNewHead();

    hitBody = checkBodyCollisons(newHead);

    if (hitBody) {
        console.log("Snake collided with itself");
        restartGame();
    } else {
        isFoodEaten = checkFoodCollison(newHead);

        if (isFoodEaten) {
            growSnake(tail);
            updateScore();
        }

        snakeParts.unshift(newHead);
        updateBoard();
    }
}

function growSnake(tail) {
    snakeParts.push(tail);
}

function calculateNewHead() {
    let newHead;
    switch (direction) {
        case 'up':
            newHead = { row: snakeParts[0].row - 1, col: snakeParts[0].col };
            if (newHead.row < 0) {newHead.row = rows - 1;}
            break;
        case 'down':
            newHead = { row: snakeParts[0].row + 1, col: snakeParts[0].col };
            if (newHead.row > rows - 1) {newHead.row = 0;}
            break;
        case 'left':
            newHead = { row: snakeParts[0].row, col: snakeParts[0].col - 1 };
            if (newHead.col < 0) {newHead.col = cols - 1;}
            break;
        case 'right':
            newHead = { row: snakeParts[0].row, col: snakeParts[0].col + 1};
            if (newHead.col > cols - 1) {newHead.col = 0;}
            break;
    }
    return newHead;
}

function checkWallCollison(snake) {
    if (snake.row >= rows || snake.col >= cols || snake.row < 0 || snake.col < 0) {
        return true;
    }
    return false;   
}

function checkBodyCollisons(head) {
    for (let i = 1; i < snakeParts.length; i++) {
        if (head.row === snakeParts[i].row && head.col === snakeParts[i].col) {
            return true;
        }
    }
    return false;
}

function hasFoodCollided(head) {
    if (head.row == foodLocation.row && head.col == foodLocation.col) {
        return true;
    }
    return false;
}

function checkFoodCollison(snake) {
    if (hasFoodCollided(snake)) {
        console.log("food eaten");
        scoreSound.play();
        addNewFood(); 
        return true;
    }
    return false;
}

function addNewFood() {
    let isFoodOnSnake = true;

    while (isFoodOnSnake) {
        const row = Math.floor(Math.random() * (rows));
        const col = Math.floor(Math.random() * (cols));

        isFoodOnSnake = snakeParts.some(part => part.row === row && part.col === col);

        if (!isFoodOnSnake) {
            foodLocation.row = row;
            foodLocation.col = col; 
            break;  
        }   
    }  
}

function restartGame() {
    gameActive = false;
    gameoverSound.play();

    clearInterval(gameLoop);
    gameLoop = null;
    // reset game progress
    updateHighscore();
    updateScore();
    snakeParts = getSnakeStartLocation();
    direction = 'right';
    foodLocation = getFoodStartLocation();
    
    gameActive = true;
    setTimeout(startGame, 2000);
}

function setUpControls() {
    document.body.addEventListener('keydown', function (event) {

        if (!gameActive) return;

        const key = event.key;
        switch (key) {
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up'; 
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;   
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
        }
    
        
        if(!gameLoop) {
            gameLoop = setInterval(moveSnake, 250);
        }
    });
}

function startGame() {
    createBoard();
    updateBoard();
    setUpControls();
}

startGame();
































