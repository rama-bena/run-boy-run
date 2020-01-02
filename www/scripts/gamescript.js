    var knight,
        knightImage,
        level = 1,
        velocity = 1,
        numBush = 4,
        bush = [],
        bushImage,
        numTree = 1,
        tree = 1,
        treeImage,
        heart = [],
        heartImage,
        animation = "",
        score = 0,
        life = 3,
        gameOver = "",
        zombie = [],
        numZombie = 3,
        canvas,
        level = 1,
        velocity = 1;

    Main();
    function Main(){
        //get canvas
        canvas = document.getElementById("cnv");
        canvas.width = 1024;
        canvas.height = 480;
        //knight spite sheet
        knightImage = new Image();
        //knight sprite
        knight = sprite({
            context: canvas.getContext("2d"),
            w: 1740,
            h: 210,
            img: knightImage,
            numberOfFrame: 10,
            tickPerFrame: 5,
            x: canvas.width,
            y: canvas.height - 210
        });
    
        //pressed pause button
        document.getElementById('pauseImg').onmouseup = function () {
            document.getElementById('pauseImg').src = "images/pause.png";
            pause();
        };
        document.getElementById('pauseImg').onmousedown = function () {
            document.getElementById('pauseImg').src =
                "images/pause_pressed.png";
        };
        
        
        //bush
        for (i = 0; i < numBush; i++) {
            spawnBush();
        }
        //tree
        for (i = 0; i < numTree; i++) {
            spawnTree();
        }
        //zombie
        for (i = 0; i < numZombie; i++) {
            spawnZombie();
        }
        //heart
        for (i = 0; i < life; i++) {
            spawnHeart();
        }
    
        gameLoop();
        knightImage.src = "images/character/knight_run.png";
        canvas.addEventListener("mousedown", tap);
        canvas.addEventListener("touchstart", tap);
    }

    function gameLoop() {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        animation = requestAnimationFrame(gameLoop);

        //tree
        tree.update();
        tree.x -= level * velocity / 2;
        tree.render();
        if (tree.x > canvas.width + 65) {
            tree.x = 80 - Math.floor(Math.random() * 3 + 1);
        }

        knight.update();
        knight.x -= level * velocity;
        if (knight.x < -128) {
            knight.x = canvas.width + Math.round(Math.random() *
                canvas.width);
        }
        knight.render();

        drawHud();

        //heart
        for (i = 0; i < life; i++) {
            heart[i].update();
            heart[i].render();
        }

        //zombie
        for (i = 0; i < zombie.length; i++) {
            zombie[i].update();
            zombie[i].x -= level * velocity;
            zombie[i].render();
            if (zombie[i].x < -128) {
                zombie[i].x = canvas.width + Math.random() * (canvas.width -
                    zombie[i].getFrameWidth() * zombie[i].scaleRatio);
                life--;
            }
            if (score > level * 2) {
                level++;
            }
        }

        //bush (ada di layer paling depan)
        for (i = 0; i < bush.length; i++) {
            bush[i].update();
            bush[i].x += level * velocity / 2;
            bush[i].render();
            if (bush[i].x > canvas.width + 65) {
                bush[i].x = -80 - Math.floor(Math.random() * 3 + 1);
            }
        }

        //dead
        if (life < 1) {
            life = 0;
            gameOver = "Game Over";
            setTimeout(stopAnimation, 400);
            
            var restartImage = document.getElementById('restartImg');
            restartImage.style.display = 'inline';
            restartImage.src = 'icons/arrow-clockwise.svg'; 

            // pressed restart button
            document.getElementById('restartImg').onclick = function () {
                restart();
            };
        }
    }

    function stopAnimation() {
        cancelAnimationFrame(animation);
    }

    function sprite(options) {
        var that = {},
            frameIndex = 0,
            tickCount = 0,
            tickPerFrame = options.tickPerFrame || 0,
            numberOfFrame = options.numberOfFrame || 1;
        
        that.context = options.context;
        that.w = options.w;
        that.h = options.h;
        that.img = options.img;
        that.x = options.x;
        that.y = options.y;
        that.scaleRatio = 1;
        
        that.update = function () {
            tickCount += 1;
            if (tickCount > tickPerFrame) {
                tickCount = 0;
                if (frameIndex < numberOfFrame - 1) {
                    frameIndex += 1;
                } else {
                    frameIndex = 0;
                }
            }
        };
        
        that.render = function () {
            that.context.drawImage(
                that.img,
                frameIndex * that.w / numberOfFrame,
                0,
                that.w / numberOfFrame,
                that.h,
                that.x,
                that.y,
                that.w / numberOfFrame,
                that.h
            );
        };
        
        that.getFrameWidth = function () {
            return that.w / numberOfFrame;
        };
        return that;
    }

    function tap(e) {
        var i,
            loc = {},
            dist,
            distKnight,
            zombieToDestroy = [],
            pos = getElementPosition(canvas),
            tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
            tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY,
            canvasScaleRatio = canvas.width / canvas.offsetWidth;
        loc.x = (tapX - pos.x) * canvasScaleRatio;
        loc.y = (tapY - pos.y) * canvasScaleRatio;
        for (i = 0; i < zombie.length; i++) {
            dist = distance({
                x: (zombie[i].x + zombie[i].getFrameWidth() / 2 * zombie[i].scaleRatio),
                y: (zombie[i].y + zombie[i].getFrameWidth() / 2 * zombie[i].scaleRatio)
            }, {
                x: loc.x,
                y: loc.y
            });
            if (dist < zombie[i].getFrameWidth() / 2 * zombie[i].scaleRatio) {
                zombieToDestroy.push(zombie[i]);
                console.log(zombie[i].x);
            }
        }
        for (i = 0; i < zombieToDestroy.length; i++) {
            destroyZombie(zombieToDestroy[i]);
            setTimeout(spawnZombie, 1000);
        }
        if (zombieToDestroy.length) {
            score++;
        }
        distKnight = distance({
            x: (knight.x + knight.getFrameWidth() / 2 * knight.scaleRatio),
            y: (knight.y + knight.getFrameWidth() / 2 * knight.scaleRatio)
        }, {
            x: loc.x,
            y: loc.y
        });
        if (distKnight < knight.getFrameWidth() / 2 * knight.scaleRatio) {
            knight.x = canvas.width + Math.round(Math.random() * canvas.width);
            life--;
        }
    }

    function destroyZombie(param) {
        var i;
        for (i = 0; i < zombie.length; i++) {
            if (zombie[i] === param) {
                zombie[i] = null;
                zombie.splice(i, 1);
                break;
            }
        }
    }

    function getElementPosition(element) {
        var parentOffset,
            pos = {
                x: element.offsetLeft,
                y: element.offsetTop
            }
        if (element.offsetParent) {
            parentOffset = getElementPosition(element.offsetParent);
            pos.x += parentOffset.x;
            pos.y += parentOffset.y;
        }
        return pos;
    }

    function distance(p1, p2) {
        var dx = p1.x - p2.x,
            dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function spawnBush() {
        var bushIndex,
            bushImage;
        bushImage = new Image();
        bushIndex = bush.length;
        bush[bushIndex] = sprite({
            context: canvas.getContext("2d"),
            img: bushImage,
            w: 0,
            h: 0,
            x: 0,
            y: 0,
            numberOfFrame: 1,
            tickPerFrame: 1
        });
        bush[bushIndex].x = 0 + Math.random() * (canvas.width -
            bush[bushIndex].getFrameWidth() * bush[bushIndex].scaleRatio);
        if (bushIndex == 0) {
            bush[bushIndex].w = 170;
            bush[bushIndex].h = 66;
            bush[bushIndex].y = canvas.height - 65;
        }
        if (bushIndex == 1) {
            bush[bushIndex].w = 100;
            bush[bushIndex].h = 47;
            bush[bushIndex].y = canvas.height - 45;
        }
        if (bushIndex == 2) {
            bush[bushIndex].w = 54;
            bush[bushIndex].h = 55;
            bush[bushIndex].y = canvas.height - 53;
        }
        if (bushIndex == 3) {
            bush[bushIndex].w = 53;
            bush[bushIndex].h = 76;
            bush[bushIndex].y = canvas.height - 74;
        }
        bush[bushIndex].scaleRatio = Math.random() * 0.5 + 0.5;
        bushImage.src = "images/bush/bush" + bushIndex + ".png";
    }

    function drawHud() {
        var context = canvas.getContext("2d");
        //score
        context.font = "bold 20px Consolas";
        context.textAlign = "start";
        context.fillStyle = "white";
        context.fillText("Score: " + score, canvas.width - 275, 40);
        //level
        context.font = "bold 20px Consolas";
        context.textAlign = "start";
        context.fillStyle = "white";
        context.fillText("Level: " + level, canvas.width - 125, 40);
        //life
        context.font = "bold 20px Consolas";
        context.textAlign = "start";
        context.fillStyle = "white";
        context.fillText("Life: ", 30, 40);
        //gameover
        context.font = "bold 50px Consolas";
        context.textAlign = "center";
        context.fillStyle = "#193439";
        context.fillText(gameOver, context.canvas.width / 2,
            context.canvas.height / 2 - 32);
    }

    function spawnZombie() {
        var zombieIndex,
            zombieImage;
        zombieImage = new Image();
        zombieIndex = zombie.length;
        zombie[zombieIndex] = sprite({
            context: canvas.getContext("2d"),
            w: 1740,
            h: 210,
            img: zombieImage,
            numberOfFrame: 10,
            tickPerFrame: 5
        });
        if ((zombieIndex % 2) == 1) {
            zombieImage.src = "images/character/zombie_run.png";
        } else {
            zombieImage.src = "images/character/zombie_female_run.png";
        }
        zombie[zombieIndex].x = canvas.width + Math.random() * (canvas.width -
            zombie[zombieIndex].getFrameWidth() * zombie[zombieIndex].scaleRatio);
        zombie[zombieIndex].y = canvas.height - 210;
        zombie[zombieIndex].scaleRatio = Math.random() * 0.5 + 0.5;
    }

    function restart(){
        location.reload();
    }

    function pause() {
        window.alert("Game Paused");
    }

    function spawnTree() {
        var treeImage;
        treeImage = new Image();
        tree = sprite({
            context: canvas.getContext("2d"),
            img: treeImage,
            w: 282,
            h: 301,
            numberOfFrame: 1,
            tickPerFrame: 1
        });
        tree.x = 0 + Math.random() * (canvas.width -
            tree.getFrameWidth() * tree.scaleRatio);

        tree.y = canvas.height - 300;

        tree.scaleRatio = Math.random() * 0.5 + 0.5;
        treeImage.src = "images/tree/tree1.png";
    }

    function spawnHeart() {
        var heartImage,
            heartIndex;
        heartImage = new Image();
        heartIndex = heart.length;
        heart[heartIndex] = sprite({
            context: canvas.getContext("2d"),
            h: 27,
            w: 32,
            img: heartImage,
            numberOfFrame: 1,
            tickPerFrame: 1
        });

        if (heartIndex == 0) {
            heart[heartIndex].x = 100;
        }
        if (heartIndex == 1) {
            heart[heartIndex].x = 140;
        }
        if (heartIndex == 2) {
            heart[heartIndex].x = 180;
        }
        heart[heartIndex].y = 22;
        heart[heartIndex].scaleRatio = Math.random() * 0.5 + 0.5;
        heartImage.src = "images/heart/heart.png";
    }
