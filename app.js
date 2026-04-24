// const { createElement } = require("react");

// initilize the game constants, whose value we can change later according to our need
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 2.5;
const ENEMY_SPEED = 0.8;

// game state - which will hold many things like score,lives,level and keys (i.e. the you will press)
let gameState = {
    score: 0,
    level:1,
    lives:3,
    gameRunning : true,
    keys:{},
}

//player state - stores various information about player
let player = {
    element:document.getElementById('mario'),
    x:50,
    y:280,
    width:30,
    height: 30,           // visual height (keep this for drawing)
    hitboxHeight: 18,
    velocityX:0,
    velocityY:0,
    //grounded is false because mario is going to jump to ground from the sky
    grounded:false,
    //big is false because in mario game the mario is big only for some time duration and not allways big
    big: false,
    bigTimer:0
}

//game object arrays
let gameObjects = {
    platforms:[],
    enemies:[],
    coins:[],
    surpriseBlocks:[],
    pipes:[]
}

//levels in the game
const levels = [
    //level1
    {
        platforms:[
            // Ground — extend to fill full width
            {x:0,   y:310, width:550,  height:40, type:'ground'},  // y was 360
            {x:600, y:310, width:490,  height:40, type:'ground'},  // y was 360, extended to reach 1090
            // {x:1020, y:360, width:70,  height:40, type:'ground'},
            
            // Floating — spread across wider canvas
            {x:200, y:230, width:60,  height:20, type:'floating'}, // y was 260
            {x:350, y:200, width:60,  height:20, type:'floating'}, // shifted right slightly , y was 240
            {x:650, y:230, width:80,  height:20, type:'floating'}, // shifted right  , y was 260
            {x:900, y:210, width:80,  height:20, type:'floating'}, // NEW — fills empty right zone , y was 260
        ],
        enemies:[
            {x:250, y:285, type:'brown'},  // unchanged
            {x:600, y:285, type:'brown'},  // shifted slightly
            {x:950, y:285, type:'brown'},  // NEW — guards the new right zone
        ],
        coins:[
            {x:215, y:190},   // x was previously 220 and y was 250
            {x:365, y:160},   // adjusted to match shifted platform
            {x:670, y:190},   // adjusted y was previously 250
            {x:920, y:170},   // NEW — above new floating platform
        ],
        surpriseBlocks:[
            {x:300, y:230, type:'mushroom'}  // shifted right slightly
        ],
        pipes:[
            {x:450, y:270},   // sits in the gap between ground platforms
            {x:1020,y:270},   // NEW — near the right edge
        ]

    },

    //level2 -  wider gaps, faster enemies, coins in tricky spots
    {
        platforms: [
            // Ground — three sections with two jumpable gaps
            { x:0,   y:310, width:450, height:40, type:'ground'  },  // left chunk
            { x:480, y:310, width:280, height:40, type:'ground'  },  // mid chunk
            { x:810, y:310, width:280, height:40, type:'ground'  },  // right chunk
    
            // Floating — a bit higher than level 1 (y≈190-220)
            { x:150, y:220, width:70,  height:20, type:'floating' },
            { x:330, y:190, width:60,  height:20, type:'floating' },
            { x:530, y:190, width:100,  height:20, type:'floating' },
            { x:720, y:185, width:80,  height:20, type:'floating' },
            { x:920, y:200, width:80,  height:20, type:'floating' },
        ],
        enemies: [
            { x:200, y:285, type:'brown'  },   // left ground patrol
            { x:490, y:285, type:'brown'  },   // mid ground patrol
            { x:540, y:165, type:'purple' },   // ON floating platform — surprise!
            { x:850, y:285, type:'purple' },   // right ground patrol
        ],
        coins: [
            { x:165, y:180 },   // above left floating
            { x:348, y:150 },   // above second floating
            { x:550, y:150 },   // above mid floating
            { x:738, y:145 },   // above fourth floating
            { x:938, y:160 },   // above right floating
        ],
        surpriseBlocks: [
            { x:270, y:220, type:'coin'     },  // mid-left air
            { x:650, y:190, type:'mushroom' },  // mid-right air
        ],
        pipes: [
            { x:490, y:270 },   // first gap — enter to advance
            { x:850, y:270 },   // second gap
        ],
    },

    //level 3
    {
        platforms: [
            // Ground — four narrow islands, three gaps
            { x:0,   y:310, width:270, height:40, type:'ground'  },
            { x:330, y:310, width:260, height:40, type:'ground'  },
            { x:650, y:310, width:210, height:40, type:'ground'  },
            { x:900, y:310, width:190, height:40, type:'ground'  },
    
            // Floating staircase — ascending left-to-right
            { x:100, y:250, width:60,  height:20, type:'floating' },  // step 1
            { x:250, y:220, width:60,  height:20, type:'floating' },  // step 2
            { x:410, y:195, width:90,  height:20, type:'floating' },  // step 3
            { x:550, y:170, width:70,  height:20, type:'blue'     },  // step 4 (blue)
            { x:760, y:185, width:80,  height:20, type:'floating' },  // step 5
            { x:940, y:160, width:80,  height:20, type:'blue'     },  // top step
        ],
        enemies: [
            { x:120, y:285,  type:'brown'  },   // left island
            { x:370, y:285,  type:'purple' },   // second island
            { x:670, y:285,  type:'purple' },   // third island
            { x:420, y:170,  type:'brown'  },   // ON step 3 floating
            { x:950, y:285,  type:'purple' },   // right island guard
        ],
        coins: [
            { x:115, y:210 },   // above step 1
            { x:265, y:180 },   // above step 2
            { x:425, y:155 },   // above step 3
            { x:595, y:130 },   // above step 4 (blue)
            { x:775, y:145 },   // above step 5
            { x:955, y:120 },   // top — hardest to reach
        ],
        surpriseBlocks: [
            { x:200, y:240, type:'coin'     },  // early reward
            { x:700, y:200, type:'mushroom' },  // mid-right power-up
            { x:870, y:180, type:'coin'     },  // near the top
        ],
        pipes: [
            { x:350, y:270 },   // first gap — between left & second island
            { x:725, y:270 },   // third gap — between third & right island
        ],
    },

    //level 4
    {
        platforms: [
            // Ground — tiny footholds at each end
            { x:0,   y:310, width:400, height:40, type:'ground'  },
            { x:820, y:310, width:300, height:40, type:'ground'  },
    
            // Mid-air network — mix of floating and blue
            { x:220, y:270, width:80,  height:20, type:'blue'     },  // low left bridge
            { x:320, y:210, width:70,  height:20, type:'floating' },
            { x:510, y:240, width:120,  height:20, type:'blue'     },
            { x:680, y:240, width:90,  height:20, type:'floating' },
            { x:950, y:235, width:80,  height:20, type:'blue'     },  // low right bridge
    
            // High tier
            { x:130, y:185, width:60,  height:20, type:'floating' },
            { x:450, y:160, width:90,  height:20, type:'blue'     },  // centre top
            { x:820, y:175, width:70,  height:20, type:'floating' },
        ],
        enemies: [
            { x:20,  y:285, type:'brown'  },   // left island
            { x:230, y:245, type:'purple' },   // ON low left bridge
            { x:520, y:215, type:'purple' },   // ON blue centre top
            { x:670, y:215, type:'brown'  },   // ON floating mid-right
            { x:950, y:210, type:'purple' },   // ON low right bridge
            { x:940, y:285, type:'purple' },   // right island
        ],
        coins: [
            // Chain above centre-top platform
            { x:455, y:120 },
            { x:480, y:120 },
            { x:505, y:120 },
            // Coins above the high floating platforms
            { x:140, y:145 },
            { x:835, y:135 },
            // Risky coin in open air between platforms
            { x:600, y:195 },
        ],
        surpriseBlocks: [
            { x:300, y:210, type:'mushroom' },  // floats between platforms
            { x:630, y:180, type:'coin'     },
            { x:980, y:215, type:'mushroom' },
        ],
        pipes: [
            { x:90,  y:270 },   // left island edge — tricky landing
            { x:840, y:270 },   // right island edge
            // Only the left pipe here advances; treat right as a decoy
            // (or both can call nextLevel — depends on your design)
        ],
    },
    //level 5
    {
        platforms: [
            // Ground — three strips
            { x:0,   y:310, width:230, height:40, type:'ground'  },
            { x:325, y:310, width:400, height:40, type:'ground'  },
            { x:850, y:310, width:260, height:40, type:'ground'  },
    
            // Lower floating tier (y≈255-270)
            { x:210, y:265, width:60,  height:20, type:'blue'     },
            { x:355, y:255, width:60,  height:20, type:'floating' },
            { x:655, y:255, width:60,  height:20, type:'floating' },
            { x:800, y:265, width:60,  height:20, type:'blue'     },
    
            // Mid floating tier (y≈205-220)
            { x:130, y:215, width:60,  height:20, type:'floating' },
            { x:290, y:210, width:60,  height:20, type:'blue'     },
            { x:480, y:210, width:70,  height:20, type:'floating' },
            { x:660, y:205, width:60,  height:20, type:'blue'     },
            { x:840, y:215, width:60,  height:20, type:'floating' },
    
            // High floating tier (y≈155-170) — the "crown"
            { x:200, y:165, width:60,  height:20, type:'blue'     },
            { x:390, y:155, width:70,  height:20, type:'floating' },
            { x:590, y:155, width:70,  height:20, type:'blue'     },
            { x:790, y:165, width:60,  height:20, type:'floating' },
        ],
        enemies: [
            // Ground patrols
            { x:50,  y:285, type:'brown'  },
            { x:480, y:285, type:'purple' },
            { x:920, y:285, type:'purple' },
            // Lower tier enemies
            { x:220, y:240, type:'purple' },
            { x:665, y:230, type:'brown'  },
            // Mid tier enemies
            { x:140, y:190, type:'purple' },
            { x:490, y:185, type:'purple' },
            { x:850, y:190, type:'brown'  },
            // High tier enemies (boss-feel)
            { x:400, y:130, type:'purple' },
            { x:600, y:130, type:'purple' },
        ],
        coins: [
            // High arc across all three high platforms
            { x:210, y:125 },
            { x:240, y:115 },  // peak left
            { x:400, y:110 },
            { x:430, y:100 },  // peak centre-left
            { x:600, y:110 },
            { x:630, y:100 },  // peak centre-right
            { x:800, y:115 },
            { x:830, y:125 },  // peak right
            // Bonus coins on mid tier
            { x:300, y:170 },
            { x:670, y:165 },
        ],
        surpriseBlocks: [
            { x:350, y:185, type:'mushroom' },  // mid-left power-up
            { x:540, y:175, type:'coin'     },  // centre bonus
            { x:730, y:185, type:'mushroom' },  // mid-right power-up
            { x:490, y:125, type:'coin'     },  // above high platform — risky grab
        ],
        pipes: [
            { x:500, y:270 },   // first ground gap
            { x:955, y:270 },   // second ground gap — step in to WIN
        ],
    },
]

//now initialize the game
function initGame(){
    loadLevel(gameState.level - 1); // initialise the vel as 0 i.e. 1-1
    gameLoop();
}

//work on loadLevel function
function loadLevel(levelIndex){
    if(levelIndex >= levels.length){
        showGameOver(true);
        return; //means cannot continue further and the game is over
    }
    //good to go to play
    //clear existing objects except mario
    clearLevel()

    const level = levels[levelIndex]; //this shows if the level is levels[1] , levels[2] and soon
    const gameArea = document.getElementById('game-area');

    //reset player
    player.x = 50;
    player.y = 280;
    player.velocityX = 0;
    player.velocityY = 0;
    player.big = false;
    player.bigTimer = 0;
    player.element.className = '';
    updateElementPosition(player.element,player.x,player.y);


    //create platforms
    level.platforms.forEach((platformData,index) =>{
        const platform = createElement('div',`platform ${platformData.type}`,{ // // if the platform if ground floating etc.
            left:platformData.x + 'px',
            top:platformData.y + 'px',
            width:platformData.width + 'px',
            height:platformData.height + 'px'
        }) 
        gameArea.appendChild(platform);
        gameObjects.platforms.push({
            element:platform,
            ...platformData,
            id:'platform-' + index
        })
    })

    //create enemeies
    level.enemies.forEach((enemyData,index) =>{
        const enemy = createElement('div',`enemy ${enemyData.type}`,{
            left:enemyData.x + 'px',
            top:enemyData.y + 'px',
        })
        gameArea.appendChild(enemy);
        gameObjects.enemies.push({
            element:enemy,
            x:enemyData.x,
            y:enemyData.y,
            width:25,
            height:25,
            direction: -1,
            speed: ENEMY_SPEED,
            id:'enemy -' + index,
            alive:true

        })
    })
    //create coins
    level.coins.forEach((coinData,index) =>{
        const coin = createElement('div','coin',{
            left:coinData.x + 'px',
            top:coinData.y + 'px',
        })
        gameArea.appendChild(coin);
        gameObjects.coins.push({
            element:coin,
            x:coinData.x,
            y:coinData.y,
            width:35,
            height:35,
            collected: false,
            id: 'coin -' + index,
        })
    })

    //create surpriseBlocks
    level.surpriseBlocks.forEach((blockData,index) =>{
        const block = createElement('div','surprise-block',{
            left:blockData.x + 'px',
            top:blockData.y + 'px',
        })
        gameArea.appendChild(block);
        gameObjects.surpriseBlocks.push({
            element:block,
            x:blockData.x,
            y:blockData.y,
            width:20,
            height:20,
            type:blockData.type,
            hit:false,
            id:'block -' + index
        })
    })

    //create pipes
    level.pipes.forEach((pipeData,index) =>{
        const pipe = createElement('div','pipe',{
            left:pipeData.x + 'px',
            top:pipeData.y + 'px',
        })
        
        const pipeTopLeft = createElement('div','pipe-top');
        const pipeTopRight = createElement('div','pipe-top-right');
        const pipeBottomLeft = createElement('div','pipe-bottom');
        const pipeBottomRight = createElement('div','pipe-bottom-right');

        pipe.append(pipeTopLeft,pipeTopRight,pipeBottomLeft,pipeBottomRight);
        gameArea.appendChild(pipe);
        gameObjects.pipes.push({
            element:pipe,
            x:pipeData.x,
            y:pipeData.y,
            width:40,
            height:60,
            id:'pipe-' + index
        })
    })

}

function updateElementPosition(element,x,y){
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}
function createElement(type,className,styles = {}){
    const element = document.createElement('div');
    element.className = className;
    Object.assign(element.style,styles);
    return element;
}
function showGameOver(won) {
    gameState.gameRunning = false;
    const title = document.getElementById('game-over-title');

    if (won) {
        title.innerHTML = "Congratulations You Won 🎉 !!";
    } else {
        title.innerHTML = 'Game Over !! <img src="images/super-mario-sleeping.gif" alt="Super Mario Sleeping gif" style="width:80px;vertical-align:middle;margin-left:10px;">';
    }

    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';
}
function clearLevel(){
    Object.values(gameObjects).flat().forEach(obj =>{
        if(obj.element && obj.element.parentNode){
            obj.element.remove();
        }
    })
    gameObjects = {
        platforms :[],
        enemies:[],
        coins:[],
        surpriseBlocks:[],
        pipes:[]
    }
}

//input handling
document.addEventListener('keydown',(e) =>{
    gameState.keys[e.code] = true;

    if(e.code == "Space" || e.code == "ArrowDown" || e.code== "KeyS"){
        e.preventDefault();
    }
})
document.addEventListener('keyup',(e) =>{
    gameState.keys[e.code] = false;
})

//Game Loop
function gameLoop(){
    if(!gameState.gameRunning){
        return;
    }
    update();
    requestAnimationFrame(gameLoop);
}

//update game logic function
function update(){
    // console.log(gameState.keys);
    //this three condition handles the left and right movement of mario
    if(gameState.keys['ArrowLeft'] || gameState.keys['KeyA']){
        player.velocityX = -MOVE_SPEED;      //minus sign because we wre moving left
    }
    else if(gameState.keys['ArrowRight'] || gameState.keys['KeyD']){
        player.velocityX = MOVE_SPEED;
    }
    else{
        //just apply friction
        player.velocityX *= 0.8;
    }

    //Handles the jumping movement of mario
    if((gameState.keys["Space"] || gameState.keys["ArrowUp"] || gameState.keys["KeyW"]) && player.grounded){
        player.velocityY = JUMP_FORCE;
        player.grounded = false;
    }
    //apply gravity if not on ground
    if(!player.grounded){
        player.velocityY += GRAVITY;
    }

    player.x = player.x + player.velocityX;
    player.y = player.y + player.velocityY;

    //player collision so that it comes back to ground
    player.grounded = false
    for(let platform of gameObjects.platforms){
        if(checkCollision(player,platform)){
            if(player.velocityY >0){ // then the player is falling
                // const FOOT_OFFSET = 0;
                player.y = platform.y - player.hitboxHeight;
                player.velocityY = 0;
                player.grounded = true;
                break;
            }
        }
    }
    //pipe collision
    // player.grounded = false
    for(let pipe of gameObjects.pipes){
        if(checkCollision(player,pipe)){
            if(player.velocityY>0){
                //means falling down the pipe
                player.y = pipe.y - player.hitboxHeight;
                player.visualY = 0;
                player.grounded = true;
                break;
            }
        }
    }
    //Enemy movement and collision
    for(let enemy of gameObjects.enemies){
        if(!enemy.alive){
            //enemy is not alive
            continue;
        }
        enemy.x += enemy.speed * enemy.direction;
        let onPlatform = false;
        //now we have to reverse the direction at platform edges or boundaries
        for(let platform of gameObjects.platforms){
            if(enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y -5 &&
                enemy.y + enemy.height <= platform.y + 10   
            ){
                onPlatform = true;
                break;
            }
        }

        if(!onPlatform || enemy.x <=0 || enemy.x >= 1090){
            enemy.direction *= -1;
        }
        updateElementPosition(enemy.element, enemy.x,enemy.y);

        //check player-enemy collision
        if(checkCollision(player,enemy)){
            //if mario stomp the enemy from above
            if(player.velocityY >0 && player.y + player.hitboxHeight * 0.65<enemy.y + 12){
                //mario jumps on enemy
                enemy.alive = false;
                enemy.element.remove();  //removes the enemy
                player.velocityY = JUMP_FORCE * 0.65;
                gameState.score += 100;
            }
            //if side or bottom hit-> mario gets hurt
            else{
                // if mario is hit by the enemy
                if(player.big){
                    player.big = false;
                    player.bigTimer = 0;
                    player.element.classList.remove('big');
                    player.width = 20;
                    player.height = 24;
                    player.hitboxHeight = 18;
                    // Small knockback
                    player.velocityX = -player.velocityX * 2;

                }else if(player.grounded){
                    // small Mario->lose life
                    loseLife();
                }
            }
        }
    }
    //coin collection
        for(let coin of gameObjects.coins){
            if(!coin.collected && checkCollision(player,coin)){
                coin.collected = true;
                coin.element.remove();
                gameState.score += 50;
            }
        }

        //surprise block
        for(let block of gameObjects.surpriseBlocks){
            if(!block.hit && checkCollision(player,block) && player.velocityY < 0){
                block.hit = true;
                block.element.classList.add('hit');
                spawnItemsOnBox(block,block.type);
                if(block.type === 'mushroom'){
                    if(!player.big){                  // only grow if not already big
                        const oldHeight = player.hitboxHeight;   // remember current height
                        player.big = true;
                        player.bigTimer = 600;
                        player.element.classList.add('big');
                        player.width = 40;
                        player.height = 40;                // visual height
                        player.hitboxHeight = 30;         // collision height (slightly less than visual)
                        //  Lift Mario up so his feet stay on the ground
                        player.y -= (player.hitboxHeight - oldHeight);
                        gameState.score+= 100;
                    }
                    
                }
                else if(block.type === 'coin'){
                    gameState.score+= 50;
                }
            }
        }
        //Pipe interaction to next level
        for(let pipe of gameObjects.pipes){
            if(player.grounded && 
                player.x + player.width > pipe.x +5 &&
                player.x <pipe.x + pipe.width -5 &&
                // Math.abs((player.y + player.hitboxHeight) - pipe.y) <12 &&
                gameState.keys['ArrowDown'] || gameState.keys["KeyS"]
            ){
                nextLevel();
                // Prevent multiple triggers in one frame
                gameState.keys['ArrowDown'] = false ;
                gameState.keys['KeyS'] = false;
                break;
            }
        }

    // Draw Mario with a small upward visual offset so feet look correct
    const visualY = player.y - 10;     // pulls the entire Mario image up by 4px
    // Handle Big Mario Timer & Shrinking
    if (player.big) {
        player.bigTimer--;

        if (player.bigTimer <= 0) {
            // === SHRINKING BACK TO SMALL ===
            const oldHitboxHeight = player.hitboxHeight;

            player.big = false;
            player.element.classList.remove('big');

            player.width = 30;
            player.height = 30;
            player.hitboxHeight = 18;

            // Push Mario DOWN so his feet reach the ground again
            player.y += (oldHitboxHeight - player.hitboxHeight);

            player.grounded = true;
        }
    }
    
    //fall death
    if(player.y >400){
        loseLife();
    }

    updateElementPosition(player.element, player.x, visualY);
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lives').textContent = gameState.lives;

}
function checkCollision(element1,element2){
    const element1Bottom = element1.y + (element1.hitboxHeight || element1.height);
    return element1.x < element2.x +element2.width &&
        element1.x + element1.width > element2.x &&
        element1.y < element2.y  + element2.height &&
        element1Bottom > element2.y ;
}

function spawnItemsOnBox(block,type){
    const gameArea = document.getElementById('game-area');
    const item = document.createElement('div');  //it assigns div to const item
    item.classList.add(type);
    item.style.left = block.x + 'px';
    item.style.top = (block.y - 20) + 'px';
    gameArea.appendChild(item);

    const itemObj = {
        x: block.x,
        y:block.y - 20,
        width:20,
        height:20,
        element:item,
        velocityY:0,
        frames:0
    }
    if(type === 'mushroom'){
        const MUSHROOM_FALL_SPEED = 2;
        function fall(){
            itemObj.velocityY += GRAVITY;
            itemObj.y += itemObj.velocityY + MUSHROOM_FALL_SPEED;
            let onPlatform = false;
            for(let platform of gameObjects.platforms){
                if(
                    itemObj.x <platform.x + platform.width &&
                    itemObj.x + itemObj.width > platform.x &&
                    itemObj.y + itemObj.height >= platform.y &&
                    itemObj.y + itemObj.height <= platform.y + 5
                ){
                    onPlatform = true;
                    itemObj.y = platform.y - itemObj.height;
                    itemObj.velocityY = 0;
                    break;
                }
            }
            item.style.top = itemObj.y + 'px';

            if(!onPlatform){
                requestAnimationFrame(fall);
            }
        }

        fall();
    }else if(type === 'coin'){
        function floatUp(){
            itemObj.y -= 2;
            item.style.top = itemObj.y + 'px';
            itemObj.frames++;
            if(itemObj.frames < 180){
                requestAnimationFrame(floatUp);
            }else{
                item.remove();
            }
        }
        floatUp();
    }
}
function loseLife(){
    gameState.lives--;
    if(gameState.lives <=0){
        showGameOver(false);
    }
    else{
        player.x = 50;
        player.y = 280;
        player.velocityX = 0;
        player.velocityY = 0;
        player.big = false;
        player.bigTimer = 0;
        player.element.classList.remove('big');
        player.width = 30;
        player.height = 30;
    }
}
function nextLevel(){
    gameState.level++;
    if(gameState.level > levels.length){
        showGameOver(true);
    }
    else{
        player.element.classList.remove('big');
        player.width = 30;
        player.height = 30
        loadLevel(gameState.level - 1);
    }
}

function restartGame(){
    gameState = {
    score: 0,
    level:1,
    lives:3,
    gameRunning : true,
    keys:{}
    }
    player.big = false;
    player.bigTimer = 0;
    player.element.classList.remove('big');
    player.width = 30;
    player.height = 30;

    document.getElementById('game-over').style.display = 'none';
    initGame();
}
document.getElementById('restart-button').addEventListener('click',restartGame);
// start game by calling initGame fucntion
initGame();