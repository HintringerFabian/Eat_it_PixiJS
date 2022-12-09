class Square {
    constructor(color, size, v) {
        this.size = size;
        this.v = v;

        let square = new PIXI.Graphics();
        square.beginFill(color);
        square.drawRect(0, 0, size, size);
        square.endFill();
        square.x = size;
        square.y = size;
        app.stage.addChild(square);

        this.square = square;
    }
}

function addSquare() {
    boxes.push(new Square(0x00ff00, 50, {x: 0, y: 0}));
}

function setupControls() {
    window.addEventListener("click", onclick);
}

function initialize() {
    //initialize the canvas with 14x14 boxes 
    for (let i = 0; i < 14; i++) {
        for (let j = 0; j < 14; j++) {
            boxes.push(new Square(0x00ff00, 50, {x: 0, y: 0}));
        }
    }
}

// resize
window.onresize = () => {
    let d = document.querySelector("div#canvas");
    w = d.clientWidth;
    h = w;
    app.renderer.resize(w, h);
    reset();
}

let w = 512, h=512;
let app = new PIXI.Application({width: w, height: h, antialias:true});
let boxes = [];
let pressed = {};
let player = new Player(0xfcf8ec, 10, {x:0, y:0});
let coin = new Coin(0xfcf8ec, 10, {x:0, y:0});
let coins;

app.renderer.backgroundColor = 0x456268;
document.querySelector("div#canvas").appendChild(app.view);
setupControls();
initialize();
window.onresize();
