
export class TiledImage {
    constructor(url) {
        const image = new Image();
        image.src = url;

        this._image = image;
    }

    getPattern(ctx) {
        return ctx.createPattern(this._image, 'repeat');
    }
}