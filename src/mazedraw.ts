import {CircleMaze, Dir, MazeNode} from "./maze";
import {Point} from "./util";

export function drawMaze(ctx: CanvasRenderingContext2D, maze: CircleMaze, center: Point) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(center.x, center.y, maze.radius.min, 0, 2*Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(center.x, center.y, maze.radius.max, 0, 2*Math.PI);
    ctx.stroke();

    maze.rings.flatMap(r => r).forEach(node => drawMazeNode(ctx, node, center));
}

function drawMazeNode(ctx: CanvasRenderingContext2D, n: MazeNode, center: Point) {
    const rw = n.getFirstLinkAt(Dir.RIGHT);
    const bw = n.getFirstLinkAt(Dir.DOWN);
    //drawMazeWall(ctx, center, n, "#00ff00", "#00ff00");
    drawMazeWall(ctx, center, n, rw && rw.info.wall ? "black" : "", bw && bw.info.wall ? "black" : "");
}

function drawMazeWall(ctx: CanvasRenderingContext2D, center: Point, n: MazeNode, styleRight: string, styleDown: string) {
    if (styleRight) {
        const pc = new Point(Math.cos(n.angle.max), Math.sin(n.angle.max));
        const p1 = center.copy().add(pc.copy().mul(n.radius.min));
        const p2 = center.copy().add(pc.copy().mul(n.radius.max));
        ctx.beginPath();
        ctx.strokeStyle = styleRight;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
    if (styleDown) {
        ctx.beginPath();
        ctx.strokeStyle = styleDown;
        ctx.arc(center.x, center.y, n.radius.min, n.angle.min, n.angle.max);
        ctx.stroke();
    }
}
