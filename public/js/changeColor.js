
let r = false;
let b = false;
let y = false;
let g = false;

var divItems = document.getElementsByClassName("w");

function selectedRed() {
    r = true;
    b = false;
    y = false;
    g = false;
}

function selectedBlue() {
    r = false;
    b = true;
    y = false;
    g = false;
}

function selectedYellow() {
    r = false;
    b = false;
    y = true;
    g = false;
}

function selectedGreen() {
    r = false;
    b = false;
    y = false;
    g = true;
}

function selected(item) {
    if (r) {
        this.clear("r");
        item.classList.add("r");
        item.classList.remove("b");
        item.classList.remove("y");
        item.classList.remove("g");
    } else if (b) {
        this.clear("b");
        item.classList.add("b");
        item.classList.remove("r");
        item.classList.remove("y");
        item.classList.remove("g");
    } else if (y) {
        this.clear("y");
        item.classList.add("y");
        item.classList.remove("r");
        item.classList.remove("b");
        item.classList.remove("g");
    } else {
        this.clear("g");
        item.classList.add("g");
        item.classList.remove("r");
        item.classList.remove("y");
        item.classList.remove("b");
    }
}

function clear(color) {
    for(var i=0; i < divItems.length; i++) {
        var item = divItems[i];
        item.classList.remove(color);
    }
}

let isReady = false;

function ready(socket) {
    let colors = []
    for(var i=0; i < divItems.length; i++) {
        var item = divItems[i];
        if (!isReady) {
            document.getElementById('ready').style.backgroundColor = "red";
        }
        if (item.classList.contains("r")) { colors[i] = 'r'; }
        else if (item.classList.contains("b")) { colors[i] = 'b'; }
        else if (item.classList.contains("y")) { colors[i] = 'y'; }
        else if (item.classList.contains("g")) { colors[i] = 'g'; }
        else { isReady = false; return 1; }
    }

    isReady = true;
    socket.emit("playerReady", colors);
    document.getElementById('ready').style.backgroundColor = "green";
    
}

let isReadyShoot = false;
function shoot(socket, turn) {
    let colors = []
    if (!turn) { return; }
    for (var i = 0; i < divItems.length; i++) {
        var item = divItems[i];
        if (!isReadyShoot) {
            document.getElementById('shoot').style.backgroundColor = "red";
        }
        if (item.classList.contains("r")) { colors[i] = 'r'; }
        else if (item.classList.contains("b")) { colors[i] = 'b'; }
        else if (item.classList.contains("y")) { colors[i] = 'y'; }
        else if (item.classList.contains("g")) { colors[i] = 'g'; }
        else { isReadyShoot = false; return 1; }
    }

    isReadyShoot = true;
    socket.emit("playerShoot", colors);
    document.getElementById('shoot').style.backgroundColor = "#f0f0f0";
}