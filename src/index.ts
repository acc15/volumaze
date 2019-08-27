import {Dir, generateMaze, MazeNode} from "./maze";
import {drawMaze} from "./mazedraw";
import {Point, Range, TWO_PI} from "./util";
import "./volumaze.css";

const canvas = <HTMLCanvasElement> document.getElementById("maze");
const maze = generateMaze(24, 24, new Range(30, Math.min(canvas.width, canvas.height) / 2));

const keyMask: { [k: string]: boolean } = {};
const playerRadius = 5;

let currentNode: MazeNode = maze.rings[0][0];

const playerPosition = new Point(currentNode.angle.center(), currentNode.radius.center());

const audio = <HTMLAudioElement> document.getElementById("audio");
audio.volume = 0;
audio.play().then(() => console.log("Playing"), err => console.error(err));


function capitalize(str: string): string {
    return str.length > 0 ? str.substring(0, 1).toUpperCase() + str.substring(1) : str;
}

["up", "down", "left", "right"].forEach(k => {
    const btn: HTMLButtonElement = <HTMLButtonElement> document.getElementById("key-" + k);
    btn.ontouchstart = btn.onmousedown = function() {
        keyMask["Arrow" + capitalize(k)] = true;
    };
    btn.ontouchend = btn.onmouseleave = btn.onmouseup = function() {
        keyMask["Arrow" + capitalize(k)] = false;
    };
});


function onFrame() {
    requestAnimationFrame(onFrame);
    render();
}

function process() {
    const speed = 1;
    const p = new Point(
        (keyMask["ArrowRight"] ? 1 : keyMask["ArrowLeft"] ? -1 : 0),
        (keyMask["ArrowUp"] ? 1 : keyMask["ArrowDown"] ? -1 : 0)
    ).normalize().mul(speed).div([playerPosition.y > 0 ? playerPosition.y : 1, 1]);

    playerPosition.add(p);

    const playerRadiusRange = maze.radius.copy().deflate(playerRadius);
    playerPosition.y = playerRadiusRange.makeInside(playerPosition.y);

    const playerAngleDiff = Math.acos(1 - (playerRadius*playerRadius) / (2 * playerPosition.y * playerPosition.y));

    const rightLink = currentNode.getFirstLinkAt(Dir.RIGHT);
    const leftLink = currentNode.getFirstLinkAt(Dir.LEFT);
    if (rightLink && rightLink.info.wall && playerPosition.x + playerAngleDiff >= currentNode.angle.max) {
        playerPosition.x = currentNode.angle.max - playerAngleDiff;
    } else if (leftLink && leftLink.info.wall && playerPosition.x - playerAngleDiff < currentNode.angle.min) {
        playerPosition.x = currentNode.angle.min + playerAngleDiff;
    }

    if (playerPosition.x >= currentNode.angle.max && rightLink) {
        currentNode = rightLink.to;
    } else if (playerPosition.x < currentNode.angle.min && leftLink) {
        currentNode = leftLink.to;
    }

    const upLink = (currentNode.directions[Dir.UP] || []).filter(link => link.to.angle.between(playerPosition.x))[0];
    const downLink = currentNode.getFirstLinkAt(Dir.DOWN);
    if (upLink && upLink.info.wall && playerPosition.y + playerRadius >= currentNode.radius.max) {
        playerPosition.y = currentNode.radius.max - playerRadius;
    } else if (downLink && downLink.info.wall && playerPosition.y - playerRadius < currentNode.radius.min) {
        playerPosition.y = currentNode.radius.min + playerRadius;
    }

    if (playerPosition.y >= currentNode.radius.max && upLink) {
        currentNode = upLink.to;
    } else if (playerPosition.y < currentNode.radius.min && downLink) {
        currentNode = downLink.to;
    }

    // After all checks normalizing angle (0..2PI)
    playerPosition.x = (playerPosition.x + TWO_PI) % TWO_PI;
    audio.volume = playerRadiusRange.normalize(playerPosition.y);

}

function render() {
    const element = <HTMLCanvasElement> document.getElementById("maze");
    const ctx = element.getContext("2d");
    if (!ctx) {
        return;
    }
    drawFrame(ctx, new Point(element.width, element.height));
}

function drawFrame(ctx: CanvasRenderingContext2D, dim: Point) {
    ctx.clearRect(0, 0, dim.x, dim.y);
    const center = dim.copy().center();
    drawMaze(ctx, maze, center);

    /*
    ctx.beginPath();
    ctx.strokeStyle = "#00ff00";
    ctx.fillStyle = "#00ff00";

    ctx.moveTo(Math.cos(currentNode.angle.min) * currentNode.radius.max + center.x, Math.sin(currentNode.angle.min) * currentNode.radius.max + center.y);
    ctx.lineTo(Math.cos(currentNode.angle.min) * currentNode.radius.min + center.x, Math.sin(currentNode.angle.min) * currentNode.radius.min + center.y);
    ctx.arc(center.x, center.y, currentNode.radius.min, currentNode.angle.min, currentNode.angle.max);

    ctx.moveTo(Math.cos(currentNode.angle.max) * currentNode.radius.max + center.x, Math.sin(currentNode.angle.max) * currentNode.radius.max + center.y);
    ctx.lineTo(Math.cos(currentNode.angle.max) * currentNode.radius.min + center.x, Math.sin(currentNode.angle.max) * currentNode.radius.min + center.y);

    ctx.arc(center.x, center.y, currentNode.radius.max, currentNode.angle.min, currentNode.angle.max);
    ctx.closePath();
    ctx.fill();
    */

    drawPlayer(ctx, center, playerPosition);
}

function drawPlayer(ctx: CanvasRenderingContext2D, center: Point, position: Point) {
    /*
    ctx.strokeStyle = "black";
    ctx.font = "15px normal sans-serif";
    ctx.strokeText("Position: " + position.x.toFixed(2) + "; " + position.y.toFixed(2) + "; Volume: " + audio.volume.toFixed(2), 0, 20);
    */

    ctx.beginPath();
    const pos = center.copy().add(position.copy().polar());
    ctx.fillStyle = "#ff0000";
    ctx.arc(pos.x, pos.y, 5, 0, 2*Math.PI);
    ctx.fill();
}

window.onkeydown = function(e) {
    keyMask[e.key] = true;
};
window.onkeyup = function(e) {
    delete keyMask[e.key];
};

// processing at 30fps
const fixedFps = 60;
const processTime = 1000 / fixedFps;
setInterval(process, processTime);
requestAnimationFrame(onFrame);
