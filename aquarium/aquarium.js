function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(vec2) {
  return new Vector(this.x + vec2.x, this.y + vec2.y);  
}

Vector.prototype.subtract = function(vec2) {
  return new Vector(this.x - vec2.x, this.y - vec2.y);
}

Vector.prototype.multiply = function(value) {
  return new Vector(this.x * value, this.y * value);
}

Vector.prototype.moveAlong = function(vec, val) {
  let rotation = Math.atan2(vec.x, vec.y);

  return new Vector(
    this.x + Math.sin(rotation) * val, 
    this.y + Math.cos(rotation) * val);
}

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vector.prototype.normalize = function() {
  let magnitude = this.magnitude();

  return new Vector(
    this.x / magnitude, 
    this.y / magnitude);
}

Vector.up = new Vector(0, 1);
Vector.left = new Vector(-1, 0);
Vector.right = new Vector(1, 0);
Vector.down = new Vector(0, -1);

function drawFishEye(ctx, x, y, radius, pupilRatio, lookDirX, lookDirY) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);

  ctx.fillStyle = "#FFFFFFA1";
  ctx.fill();
  
  let pupilRadius = radius * pupilRatio;
  let maxPupilOffset = radius - pupilRadius;
  
  let xPupilOffset = maxPupilOffset * lookDirX;
  let yPupilOffset = maxPupilOffset * lookDirY;
  
  ctx.beginPath();
  ctx.arc(x + xPupilOffset, y + yPupilOffset, pupilRadius, 0, 2 * Math.PI);

  ctx.fillStyle = "#001242";
  ctx.fill();
}

function drawFishTail(ctx, x, y, baseWidth, endWidth, length) {
  let yShift = Math.sin(new Date() / 1000) * length * 0.1;

  ctx.moveTo(x, y - baseWidth / 2);
  ctx.quadraticCurveTo(x, y - endWidth / 3, x - length, y - endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x - 0.5 * length, y - length * 0.1, x - length, y + endWidth / 2 + yShift);
  ctx.quadraticCurveTo(x, y + endWidth / 3, x, y + baseWidth / 2);
}

function drawFishBody(ctx, x, y, length, baseTailWidth) {
  ctx.moveTo(x, y + baseTailWidth / 2);
  ctx.quadraticCurveTo(x + length / 2, y + length / 2, x + length, y);
  ctx.quadraticCurveTo(x + length / 2, y - length / 2, x, y - baseTailWidth / 2);
}

function drawFishFloater(ctx, x, y, size, phase) {
  let yShift = Math.sin(new Date() / 1000 + phase) * 0.1 * size;

  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x, y - size * 0.4, x - size, y + size * 0.5 + yShift);
  ctx.quadraticCurveTo(x, y + size * 0.6, x, y);
}

function drawFishTopFloater(ctx, x, y, size) {
  ctx.moveTo(x, y);
  ctx.lineTo(x - size * 0.35, y - size * 0.12);
  ctx.lineTo(x - size * 0.75, y + size * 0.2);
  ctx.fill();
}

function drawFish(ctx, fish, flip, rotation) {
  let {size, position, lookDir, pupilRatio, kind, color, floaterPhase} = fish;
  
  ctx.translate(position.x, position.y);
  ctx.rotate(rotation);

  if(flip) {
    ctx.transform(-1, 0, 0, 1, 0, 0);
  }

  ctx.beginPath();
  
  drawFishBody(ctx, -size * 0.5, 0, size, size * 0.1);
  drawFishTail(ctx, -size * 0.35, 0, size * 0.1, size * kind.tailWidthRatio, size * kind.tailLengthRatio);
  drawFishFloater(ctx, size * 0.05, size * 0.1, size * 0.33, floaterPhase);
  
  ctx.fillStyle = color;
  ctx.fill();

  drawFishTopFloater(ctx, size * 0.2, -size * 0.2, size);
  drawFishEye(ctx, size * 0.2, -size * 0.05, size * 0.09, pupilRatio, lookDir.x, lookDir.y);

  ctx.resetTransform();
}

function drawWeed(ctx, weed) {
  ctx.strokeStyle = weed.color;
  ctx.lineWidth = weed.width; 

  ctx.beginPath();
  ctx.moveTo(weed.position.x, weed.position.y);

  let segmentsCount = weed.length / weed.segmentLength;
  let currentSegmentBendDir = 1;

  for(let segment = 0; segment < segmentsCount; segment++) {
    let posX = weed.position.x;
    let posY = weed.position.y + segment * weed.segmentLength;
    let bendX = posX + weed.bendDistance * currentSegmentBendDir * 2;
    let bendY = posY + weed.segmentLength * 1.1;

    ctx.quadraticCurveTo(bendX, bendY, posX, posY);

    currentSegmentBendDir = currentSegmentBendDir * (-1);
  }

  ctx.stroke();
}

function drawFishes(ctx, fishes) {
  for(let fish of fishes) {
    fish.position = fish.position.moveAlong(fish.moveDir, fish.speed);

    let flip = fish.moveDir.x < 0;
    
    drawFish(ctx, fish, flip, 0);
  }
}

function drawBubbles(ctx, bubbles) {
  const bubbleMoveSpeedFactor = 0.1;
  const bubbleSideMoveAmplitude = 0.2;
  const bubbleSideMoveSpeedFactor = 0.1;

  ctx.beginPath();

  for(let bubble of bubbles) {
    bubble.position.y -= bubble.radius * bubbleMoveSpeedFactor;
    bubble.position.x = 
      bubble.position.x + 
      Math.sin(bubble.position.y * bubbleSideMoveSpeedFactor) * 
      bubbleSideMoveAmplitude;

    ctx.moveTo(bubble.position.x + bubble.radius, bubble.position.y);
    ctx.arc(bubble.position.x, bubble.position.y, bubble.radius, 0, 2 * Math.PI);

    // ctx.font = `${bubble.radius * 2}px Arial`;
    // ctx.fillText('A', bubble.position.x, bubble.position.y);
  }
  
  ctx.strokeStyle = '#FFFFFFB1';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawWeeds(ctx, weeds, width, height) {
  let currentLayer = 0;

  for(let weed of weeds) {
    if(currentLayer != weed.layer) {
      let phase = Math.sin(new Date() / 1000 + currentLayer) / 50;
      
      ctx.resetTransform();
      ctx.rotate(Math.PI);
      ctx.transform(1, 0, phase, 1, -width, -height * 2 - 50);
  
      currentLayer = weed.layer;
    }

    drawWeed(ctx, weed);
  }
}

const fishKinds = [{
  tailWidthRatio: 0.35,
  tailLengthRatio: 0.35
},
{
  tailWidthRatio: 0.4,
  tailLengthRatio: 0.4
},
{
  tailWidthRatio: 0.35,
  tailLengthRatio: 0.45
}];

function aquarium(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const width = window.innerWidth;
  const height = window.innerHeight; 
  const fishes = [];
  const weeds = [];  
  let bubbles = [];

  canvasEl.width = width;
  canvasEl.height = height;

  addSomeFishes(5);
  addSomeWeed(20);

  function addSomeFishes(count) {
    while(--count >= 0) {
      fishes.push({
        position: getRandPos(),
        moveDir: getRandDir(),
        lookDir: getRandDir(),
        size: getRandInRange(30, 150),
        speed: getRandInRange(0.3, 0.8),
        pupilRatio: getRandInRange(0.6, 0.8),
        kind: fishKinds[Math.floor(Math.random() * fishKinds.length)],
        color: getRandColor(255,255,0,150,0,150),
        floaterPhase: Math.round(getRandInRange(0, 3))
      });
    }

    function getRandPos() {
      return new Vector(
        Math.random() * width,
        Math.random() * height
      );
    }

    function getRandDir() {
      return new Vector(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
    }
  }

  function addSomeWeed(count) {
    const maxWeedLength = 500;
    const minWeedLength = 100;

    while(--count >= 0) {
      weeds.push({
        length: getRandInRange(minWeedLength, maxWeedLength),
        width: getRandInRange(2, 5),
        layer: Math.round(getRandInRange(0, 3)),
        bendDistance: getRandInRange(5, 20),
        segmentLength: getRandInRange(30, 40),
        color: getRandColor(0, 10, 50, 60, 80, 180),
        position: new Vector(
          getRandInRange(0, width), 
          getRandInRange(height, height + 20))
      });
    }

    weeds.sort((a, b) => a.layer > b.layer);
  }

  function getRandColor(
    minR = 0, maxR = 255, 
    minB = 0, maxB = 255, 
    minG = 0, maxG = 255) {
      
    let r = getRandInRange(minR, maxR);
    let g = getRandInRange(minG, maxG);
    let b = getRandInRange(minB, maxB);

    return getColor(r, g, b);
  }

  function getColor(r, g, b) {
    return `rgb(${r},${g},${b})`;
  }

  function getRandInRange(min, max) {
    return min + Math.floor(Math.random() * (max - min));
  }

  function checkInBounds(vec) {
    return (
      vec.x > 0 && 
      vec.x < width &&
      vec.y > 0 &&
      vec.y < height);
  }

  setInterval(function() {
    for(let fish of fishes) {
      let shouldChangeMoveDir = Math.random() > 0.95 || !checkInBounds(fish.position);
      let shouldChangeLookDir = Math.random() > 0.4;
      let shouldMakeBubble = Math.random() > 0.7;

      if(shouldChangeMoveDir) {
        let x = Math.random();
        let y = Math.random();

        if(fish.moveDir.x > 0) {
          x = x * (-1);
        } 

        if(fish.moveDir.y > 0) {
          y = y * (-1);
        }

        fish.moveDir = new Vector(x, y);
      }

      if(shouldChangeLookDir) {
        fish.lookDir = new Vector(
          Math.random() - 0.5, 
          Math.random() - 0.5);
      }

      if(shouldMakeBubble) {
        let bubblePosX = fish.position.x;
        let bubblePosY = fish.position.y;
        
        if(fish.moveDir.x > 0) {
          bubblePosX += fish.size / 2;
        } else {
          bubblePosX -= fish.size / 2;
        }

        bubbles.push({
          position: new Vector(bubblePosX, bubblePosY),
          radius: getRandInRange(5, fish.size / 10)
        });
      }

      bubbles = bubbles.filter(b => checkInBounds(b.position));
    }
  }, 300);

  setInterval(function() {
    let g = Math.sin(new Date() / 3000 + 10) * 30;
    let b = Math.sin(new Date() / 2000) * 30 + 20;
    let backgroundColor = getColor(0, g, b);

    ctx.resetTransform();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    drawFishes(ctx, fishes);
    drawBubbles(ctx, bubbles);
    drawWeeds(ctx, weeds, width, height);
  }, 0);
}

aquarium(document.getElementById("waterCanvas"))