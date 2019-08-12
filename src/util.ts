type PointLike = Point | Array<number> | number

export class Point {
    public x: number = 0;
    public y: number = 0;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public add(offset: PointLike): Point {
        const p = Point.toPoint(offset);
        this.x += p.x;
        this.y += p.y;
        return this;
    }

    public mul(val: PointLike): Point {
        const p = Point.toPoint(val);
        this.x *= p.x;
        this.y *= p.y;
        return this;
    }

    public div(val: PointLike): Point {
        const p = Point.toPoint(val);
        this.x /= p.x;
        this.y /= p.y;
        return this;
    }

    public center(): Point {
        return this.div(2);
    }

    public copy(): Point {
        return new Point(this.x, this.y);
    }

    public normSquare(): number {
        return this.x * this.x + this.y * this.y;
    }

    public norm(): number {
        return Math.sqrt(this.normSquare());
    }

    public normalize(): Point {
        return this.x === 0 && this.y === 0 ? this : this.div(this.norm());
    }

    public polar(): Point {
        const y = Math.sin(this.x) * this.y;
        this.x = Math.cos(this.x) * this.y;
        this.y = y;
        return this;
    }

    public static toPoint(v: number | Array<number> | Point): Point {
        if (typeof v === "number") {
            return new Point(v, v);
        } else if (Array.isArray(v)) {
            return new Point(v[0], v[1]);
        } else {
            return v;
        }
    }

}

export class Range {

    public min: number;
    public max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    public length(): number {
        return this.max - this.min;
    }

    public offset(diff: number): Range {
        this.min += diff;
        this.max += diff;
        return this;
    }

    public step() {
        return this.offset(this.length());
    }

    public center(): number {
        return (this.min + this.max) / 2;
    }

    public copy(): Range {
        return new Range(this.min, this.max);
    }

    public between(val: number): boolean {
        return val >= this.min && val < this.max;
    }

    public inflate(val: number): Range {
        this.min -= val;
        this.max += val;
        return this;
    }

    public deflate(val: number): Range {
        return this.inflate(-val);
    }

    public makeInside(val: number): number {
        return Math.min(Math.max(val, this.min), this.max);
    }

    public normalize(val: number): number {
        return (val - this.min) / this.length();
    }

    public static byStep(start: number, step: number) {
        return new Range(start, start + step);
    }

}
