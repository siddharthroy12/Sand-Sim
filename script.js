const NULL_BLOCK = "NULL_BLOCK";
const AIR_BLOCK = "AIR_BLOCK";
const SAND_BLOCK = "SAND_BLOCK";
const WALL_BLOCk = "WALL_BLOCK";
const WATER_BLOCK = "WATER_BLOCK";

const DIR_UP = "DIR_UP";
const DIR_DOWN = "DIR_DOWN";
const DIR_LEFT = "DIR_LEFT";
const DIR_RIGHT = "DIR_RIGHT";
const DIR_TOP_LEFT = "DIR_TOP_LEFT";
const DIR_TOP_RIGHT = "DIR_TOP_RIGHT";
const DIR_BOTTOM_LEFT = "DIR_BOTTOM_LEFT";
const DIR_BOTTOM_RIGHT = "DIR_BOTTOM_RIGHT";

const BLOCK_COLORS = {
  NULL_BLOCK: "white",
  AIR_BLOCK: "black",
  SAND_BLOCK: "yellow",
  WALL_BLOCK: "brown",
  WATER_BLOCK: "blue"
}

let mouseHold = false;

let mousePosOnCanvas = {
  x: 0,
  y: 0
};

const gameWidth = 200;
const gameHeight = 100;
const gameSpeed = 10;
let ctx = null;

let currentBlock = SAND_BLOCK;

function changeCurrentBlock(block) {
  currentBlock = block;
}

// Creating the game grid filled with air
let grid = new Array(gameWidth)
  .fill(0)
  .map(() => new Array(gameHeight).fill(AIR_BLOCK));


function setBlock(x, y, block) {
  grid[x][y] = block;
  ctx.fillStyle = BLOCK_COLORS[block];
  ctx.fillRect(x, y, 1, 1);
}


function resetCanvas() {
    grid = new Array(gameWidth)
      .fill(0)
      .map(() => new Array(gameHeight).fill(AIR_BLOCK));
    ctx.fillStyle = BLOCK_COLORS[AIR_BLOCK];
    ctx.fillRect(0, 0, gameWidth, gameHeight);
  }

window.addEventListener('load', function() {
  const canvas = document.getElementById("canvas");
  canvas.width = gameWidth;
  canvas.height = gameHeight;

  ctx = canvas.getContext("2d");


  ctx.fillStyle = BLOCK_COLORS[AIR_BLOCK];
  ctx.fillRect(0, 0, gameWidth, gameHeight);
  setBlock(0, 0, SAND_BLOCK);

  function getMousePosOnCanvas(evt) {
    var rect = canvas.getBoundingClientRect(),
      scaleX = canvas.width / rect.width,
      scaleY = canvas.height / rect.height;

    return {
      x: Math.floor((evt.clientX - rect.left) * scaleX),
      y: Math.floor((evt.clientY - rect.top) * scaleY)
    };
  }

  function onMouseMove(evt) {
    mousePosOnCanvas = getMousePosOnCanvas(evt);
  }

  function onMouseDown() {
    mouseHold = true;
  }

  function onMouseUp() {
    mouseHold = false;
  }

  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);

  function getDirectionCoords(x, y, direction) {
    switch (direction) {
      case DIR_UP:
        return { x: x, y: y - 1 };
      case DIR_DOWN:
        return { x: x, y: y + 1 };
      case DIR_LEFT:
        return { x: x - 1, y: y };
      case DIR_RIGHT:
        return { x: x + 1, y: y };
      case DIR_TOP_LEFT:
        return { x: x - 1, y: y - 1 };
      case DIR_TOP_RIGHT:
        return { x: x + 1, y: y - 1 };
      case DIR_BOTTOM_LEFT:
        return { x: x - 1, y: y + 1 };
      case DIR_BOTTOM_RIGHT:
        return { x: x + 1, y: y + 1 };
      default:
        return { x, y };
    }
  }

  function getDirectionBlock(x, y, direction) {
    const directionCoords = getDirectionCoords(x, y, direction);
    if (
      directionCoords.x < 0 ||
      directionCoords.x >= gameWidth ||
      directionCoords.y < 0 ||
      directionCoords.y >= gameHeight
    ) {
      return NULL_BLOCK;
    }
    return grid[directionCoords.x][directionCoords.y];
  }

  function moveBlock(x, y, direction) {
    const directionCoords = getDirectionCoords(x, y, direction);
    const block = grid[x][y];
    setBlock(x, y, AIR_BLOCK);
    setBlock(directionCoords.x, directionCoords.y, block);
  }

  function swapBlock(x, y, direction) {
    const directionCoords = getDirectionCoords(x, y, direction);
    const block = grid[x][y];
    setBlock(x, y, grid[directionCoords.x][directionCoords.y]);
    setBlock(directionCoords.x, directionCoords.y, block);
  }

  function hasCliffOnRight(x, y) {
    let result = false;

    if (getDirectionBlock(x ,y, DIR_DOWN) === NULL_BLOCK) {
      return false;
    }

    for (let i = x+1; i < gameWidth; i++) {
      if (grid[i][y] !== AIR_BLOCK) {
        break;
      }
      if (grid[i][y] === AIR_BLOCK && getDirectionBlock(i, y, DIR_DOWN) === AIR_BLOCK) {
        result = true;
        break;
      }
    }
    return result;
  }

  function hasCliffOnLeft(x, y) {
    let result = false;

    if (getDirectionBlock(x ,y, DIR_DOWN) === NULL_BLOCK) {
      return false;
    }

    for (let i = x-1; i >= 0; i--) {
      if (grid[i][y] !== AIR_BLOCK) {
        break;
      }
      if (grid[i][y] === AIR_BLOCK && getDirectionBlock(i, y, DIR_DOWN) === AIR_BLOCK) {
        result = true;
        break;
      }
    }
    return result;
  }

  function updateLoop() {
    const gridCopy = JSON.parse(JSON.stringify(grid));

    if (mouseHold) {
      setBlock(mousePosOnCanvas.x, mousePosOnCanvas.y, currentBlock);
    }

    for (let i = 0; i < gameWidth; i++) {
      for (let j = 0; j < gameHeight; j++) {
        switch (gridCopy[i][j]) {
          case SAND_BLOCK:
            if (getDirectionBlock(i, j, DIR_DOWN) === AIR_BLOCK) {
              moveBlock(i, j, DIR_DOWN);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_RIGHT) === AIR_BLOCK &&
              getDirectionBlock(i, j, DIR_RIGHT) === AIR_BLOCK) {
              moveBlock(i, j, DIR_BOTTOM_RIGHT);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_LEFT) === AIR_BLOCK &&
              getDirectionBlock(i, j, DIR_LEFT) === AIR_BLOCK) {
              moveBlock(i, j, DIR_BOTTOM_LEFT);
            } else if (getDirectionBlock(i, j, DIR_DOWN) === WATER_BLOCK) {
              swapBlock(i, j, DIR_DOWN);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_RIGHT) === WATER_BLOCK &&
              getDirectionBlock(i, j, DIR_RIGHT) === WATER_BLOCK) {
              swapBlock(i, j, DIR_BOTTOM_RIGHT);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_LEFT) === WATER_BLOCK &&
              getDirectionBlock(i, j, DIR_LEFT) === WATER_BLOCK) {
              swapBlock(i, j, DIR_BOTTOM_LEFT);
            }
            break;
          case WATER_BLOCK:
            if (getDirectionBlock(i, j, DIR_DOWN) === AIR_BLOCK) {
              moveBlock(i, j, DIR_DOWN);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_RIGHT) === AIR_BLOCK &&
              getDirectionBlock(i, j, DIR_RIGHT) === AIR_BLOCK) {
              moveBlock(i, j, DIR_BOTTOM_RIGHT);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_LEFT) === AIR_BLOCK &&
              getDirectionBlock(i, j, DIR_LEFT) === AIR_BLOCK) {
              moveBlock(i, j, DIR_BOTTOM_LEFT);
            } else if (getDirectionBlock(i, j, DIR_BOTTOM_RIGHT) === AIR_BLOCK &&
              getDirectionBlock(i, j, DIR_RIGHT) === AIR_BLOCK) {
              moveBlock(i, j, DIR_LEFT);
            } else if (hasCliffOnRight(i, j)) {
              moveBlock(i, j, DIR_RIGHT);
            } else if (hasCliffOnLeft(i, j)) {
              moveBlock(i, j, DIR_LEFT);
            }
            break;
          default:
            break;
        }
      }
    }
  }
  setInterval(updateLoop, gameSpeed);
})
