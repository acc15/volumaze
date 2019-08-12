
import {MazeNode} from "./maze";

export function backtraceCarve(stack: Array<MazeNode>) {
    while (stack.length > 0) {
        const n = stack[stack.length - 1];
        n.visited = true;

        const dirs = Object.keys(n.directions).flatMap(k => n.directions[k as any]).filter(dir => !dir.to.visited);
        if (dirs.length === 0) {
            stack.pop();
            continue;
        }

        const chosenDirection = dirs[Math.floor(Math.random() * dirs.length)];
        chosenDirection.info.wall = false;
        stack.push(chosenDirection.to);
    }
}
