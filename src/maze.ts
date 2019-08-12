import {backtraceCarve} from "./mazegen";
import {Range, TWO_PI} from "./util";

export const enum Dir {
    LEFT,
    RIGHT,
    UP,
    DOWN
}

export function oppositeDirection(direction: Dir): Dir {
    return (direction + 1) % 2 + Math.floor(direction / 2) * 2;
}

export type DirectionMap = { [k: number]: Array<MazeLink> };

export interface MazeLinkInfo {
    wall: boolean;
}

export interface MazeLink {
    info: MazeLinkInfo;
    to: MazeNode;
}

export interface CircleMaze {
    rings: Array<Array<MazeNode>>;
    radius: Range;
}

export class MazeNode {
    public visited: boolean = false;
    public directions: DirectionMap = {};
    public radius: Range;
    public angle: Range;

    public constructor(radius: Range, angle: Range) {
        this.radius = radius;
        this.angle = angle;
    }

    public linkTo(dir: number, node?: MazeNode): MazeNode {
        if (!node) {
            return this;
        }

        const info: MazeLinkInfo = { wall: true };
        this.getLinksTo(dir).push({info, to: node});
        node.getLinksTo(oppositeDirection(dir)).push({info, to: this});
        return this;
    }

    public getLinksTo(k: number): Array<MazeLink> {
        if (!this.directions[k]) {
            this.directions[k] = [];
        }
        return this.directions[k];
    }

    public getFirstLinkAt(k: number): MazeLink | undefined {
        const l = this.directions[k];
        return l && l.length ? l[0] : undefined;
    }

    public getFirstNodeAt(dir: number): MazeNode | undefined {
        const l = this.getFirstLinkAt(dir);
        return l ? l.to : undefined;
    }
}

export function makeMazeRing(segmentCount: number, subdivisions: number, radius: Range, parent?: MazeNode): Array<MazeNode> {
    const segments: Array<MazeNode> = [];

    const angle = new Range(0, 2 * Math.PI / segmentCount);
    for (let i = 0; i < segmentCount; i++) {
        if (parent && i > 0 && i % subdivisions === 0) {
            parent = parent.getFirstNodeAt(Dir.RIGHT);
        }

        segments.push(new MazeNode(radius.copy(), angle.copy())
            .linkTo(Dir.DOWN, parent)
            .linkTo(Dir.LEFT, i > 0 ? segments[i - 1] : undefined));
        angle.step();
    }
    if (segments.length > 0) {
        segments[0].linkTo(Dir.LEFT, segments[segmentCount - 1]);
    }
    return segments;
}

export function makeMazeRings(ringCount: number, maxSegmentArc: number, radius: Range): CircleMaze {
    const rings: Array<Array<MazeNode>> = [];

    const radiusRange = Range.byStep(radius.min, radius.length() / ringCount);

    let segmentCount = Math.ceil(TWO_PI * radiusRange.max / maxSegmentArc / 4) * 4;
    for (let i = 0; i < ringCount; i++) {
        let ringSubdivisions = 1;

        let segmentArc = TWO_PI * radiusRange.max / segmentCount;
        if (segmentArc > maxSegmentArc) {
            segmentCount *= 2;
            ringSubdivisions = 2;
        }

        rings.push(makeMazeRing(segmentCount, ringSubdivisions, radiusRange, i > 0 ? rings[i - 1][0] : undefined));
        radiusRange.step();
    }
    return { rings, radius };
}

export function generateMaze(ringCount: number, maxSegmentArc: number, radius: Range): CircleMaze {
    const maze = makeMazeRings(ringCount, maxSegmentArc, radius);
    backtraceCarve([maze.rings[0][0]]);
    return maze;
}

