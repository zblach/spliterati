

export function Uint8ArrayEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length != b.length) {
        return false;
    }

    return a.every((value, index) => {
        return b[index] == value
    })
}

export class Slicer {
    private index;
    constructor(start: number = 0) {
        this.index = start;
    }
    next(): number {
        const ret = this.index;
        this.index += 1;
        return ret;
    }
    nextRange(amt: number): [number, number] {
        const ret : [number, number] = [this.index, this.index + amt]
        this.index += amt;
        return ret
    }
}
