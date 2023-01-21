/////////////////////////////////
// Classes
/////////////////////////////////

class Circle {
    constructor(color, radius, velocity) {
        this.radius = radius;
        this.velocity = velocity;

        let circle = new PIXI.Graphics();
        circle.beginFill(color);
        circle.drawCircle(0, 0, radius);
        circle.endFill();
        circle.x = radius;
        circle.y = radius;
        app.stage.addChild(circle);

        this.circle = circle;
    }

    remove() {
        app.stage.removeChild(this.circle);
    }

    collide(other) {
        let dx = other.circle.x - this.circle.x;
        let dy = other.circle.y - this.circle.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        return dist < (this.radius + other.radius);
    }
}

class Monster extends Circle {
    update() {
        this.circle.x += this.velocity.x;
        this.circle.y += this.velocity.y;

        if (this.circle.x >= screen_width-this.radius) {
            this.velocity.x *= -1;
        }

        else if (this.circle.x <= this.radius) {
            this.velocity.x *= -1;
        }

        if (this.circle.y >= screen_heigth-this.radius) {
            this.velocity.y *= -1;
        }
        else if (this.circle.y <= this.radius) {
            this.velocity.y *= -1;
        }
    }
}

class Player extends Circle {
    constructor(color, radius) {
        let velocity = {x:0, y:0}
        super(color, radius, velocity);
        this.reset();
        this.invincible = false;
        this.sprite = PIXI.Sprite.from("assets/player.png");
        this.sprite.anchor.set(0.5);

        this.star_sound = new Audio("assets/star_sound.mp3");

        app.stage.addChild(this.sprite);

        this.textures = [];
        let texture_names = ["_red", "_yellow", "_green", "_lightblue", "", "_purple"]

        for (let i = 0; i < texture_names.length; i++) {
            let texture = PIXI.Texture.from("assets/player" + texture_names[i] + ".png");
            this.textures.push(texture);
        }
    }

    reset() {
        this.circle.x = screen_width/2;
        this.circle.y = screen_heigth/2;
        this.speed = 2;

        // set the player texture to the original one
        //this.sprite.texture = this.textures[4];
    }

    update() {
        let x = this.circle.x + this.velocity.x;
        let y = this.circle.y + this.velocity.y;

        this.circle.x = Math.min(Math.max(x, this.radius), screen_width-this.radius);
        this.circle.y = Math.min(Math.max(y, this.radius), screen_heigth-this.radius);
        this.sprite.x = this.circle.x;
        this.sprite.y = this.circle.y;

        monsters.forEach(m => {
            if (this.collide(m)) {
                if (this.invincible) {
                    m.remove();
                    monsters.splice(monsters.indexOf(m), 1);
                } else {
                    reset_game();
                }
            }
        });

        // coin
        if (this.collide(coin)) {
            coin.play_sound();
            if(coin.is_special) {
                this.star_mode();
                coin.is_special = false;
                // draw a black circle
                coin.circle.beginFill(0x000000);
                coin.circle.drawCircle(0, 0, coin.radius);
                coin.circle.endFill();

            }

            updateCoins(coin_count+1);
            coin.place_random();
            addMonster();

            let speed_multiplier = (this.invincible) ? 1.5 : 1;
            let max_speed = 4 * speed_multiplier;
            let speed = this.speed * speed_multiplier + 0.2;
            this.speed = Math.min(max_speed, speed);

            if (coin_count % 5 === 0) {
                coin.is_special = true;
                coin.circle.beginFill(0xffd700);
                coin.circle.drawCircle(0, 0, coin.radius);
                coin.circle.endFill();
            }
        }
    }

    star_mode() {
        // change the player texture every 0.3 seconds
        // do this for 5 seconds
        // and change it back to the original texture
        // also set this.invincible to true and set it to false after 5 seconds

        this.invincible = true;
        this.star_sound.play();
        let i = 0;
        let interval = setInterval(() => {
            this.sprite.texture = this.textures[i];
            i = (i+1) % this.textures.length;
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
            this.sprite.texture = this.textures[4];
            this.invincible = false;
            this.star_sound.pause();
        }, 5000);
    }
}

class Coin extends Circle {
    constructor(color, radius) {
        let velocity = {x:0, y:0}
        super(color, radius, velocity);

        this.is_special = false;

        this.sound = new Audio("assets/coin.wav");
    }
    place_random() {
        this.circle.x = this.radius + Math.random()*(screen_width - 2*this.radius);
        this.circle.y = this.radius + Math.random()*(screen_heigth - 2*this.radius);
    }

    play_sound() {
        this.sound.play();
    }
}

/////////////////////////////////
// Functions
/////////////////////////////////

function addMonster() {
    const color = 0xfce3e5
    const radius = Math.random()*10 + 10
    const velocity = {x:2 + Math.random(), y:2 + Math.random()}

    const new_monster = new Monster(color, radius, velocity)

    monsters.push(new_monster)
}

function onkeydown(ev) {
    switch (ev.key) {
        case "ArrowLeft":
        case "a":
            player.velocity.x = -player.speed;
            pressed['left'] = true;
            break;

        case "ArrowRight":
        case "d":
            player.velocity.x = player.speed;
            pressed['right'] = true;
            break;

        case "ArrowUp":
        case "w":
            player.velocity.y = -player.speed;
            pressed['up'] = true;
            break;

        case "ArrowDown": 
        case "s":
            player.velocity.y = player.speed;
            pressed['down'] = true;
            break;
    }
}
function onkeyup(ev) {
    switch (ev.key) {
        case "ArrowLeft": 
        case "a":
            player.velocity.x = pressed['right']?player.speed:0;
            pressed['left'] = false;
            break;

        case "ArrowRight": 
        case "d":
            player.velocity.x = pressed['left']?-player.speed:0;
            pressed['right'] = false;
            break;

        case "ArrowUp": 
        case "w":
            player.velocity.y = pressed['down']?player.speed:0;
            pressed['up'] = false;
            break;

        case "ArrowDown": 
        case "s":
            player.velocity.y = pressed['up']?-player.speed:0;
            pressed['down'] = false;
            break;
    }
}

function setupControls() {
    // deactivate scrolling
    window.addEventListener("keydown",
        function(keyboard_event){
            keys[keyboard_event.code] = true;
            switch(keyboard_event.code){
                case "ArrowUp": case "ArrowDown": case "ArrowLeft": case "ArrowRight":
                case "Space": keyboard_event.preventDefault(); break;
                default: break; // do not block other keys
            }
        },
        false);
    window.addEventListener('keyup',
        function(keyboard_event){
            keys[keyboard_event.code] = false;
        },
        false);

    // add event functions
    window.addEventListener("keydown", onkeydown);
    window.addEventListener("keyup", onkeyup);
}

function reset_game() {
    player.star_sound.pause();
    game_over_sound.play();
    monsters.forEach(m => {
        m.remove();
    });

    monsters = [];
    addMonster();
    player.reset();
    coin.place_random();
    updateCoins(0);
}

function updateCoins(num) {
    coin_count = num;
    document.querySelector('#score span').innerHTML = num;
}

function gameLoop() {
    player.update();
    monsters.forEach(monster => {
        monster.update();
    });
}

// resize
window.onresize = () => {
    let canvas = document.querySelector("div#canvas");
    screen_width = canvas.clientWidth;
    screen_heigth = screen_width / 1.8;
    app.renderer.resize(screen_width, screen_heigth);
    reset_game();
}

/////////////////////////////////
// Game initialisation
/////////////////////////////////

let screen_width = 512, screen_heigth=512;
let app = new PIXI.Application({width: screen_width, height: screen_heigth, antialias:true});
let monsters = [];
let pressed = {};
let player = new Player(0x1f2833, 10);
let coin = new Coin(0x1f2833, 10);
let coin_count;
let fps = 1000 / 60;
const keys = {};
let game_over_sound = new Audio("assets/game_over.wav");

app.renderer.backgroundColor = 0x45A29E;
document.querySelector("div#canvas").appendChild(app.view);
setupControls();
setInterval(gameLoop, fps);
window.onresize(undefined);