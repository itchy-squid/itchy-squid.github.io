//import { TiledImage } from './tiled-image'

const MaxCardsOnBoard = 12;
const FrameRate = 1000 / 60;

class TiledImage {
    constructor(url) {
        const image = new Image();
        image.src = url;

        this._image = image;
    }

    getPattern(ctx) {
        return ctx.createPattern(this._image, 'repeat');
    }
}

const renderPath = (ctx, color, c, { data, translation, rotation, scale }) => {
    const path = new Path2D(data);

    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.translate(translation.x, translation.y);

    ctx.fillStyle = 'white';
    ctx.fill(path);

    ctx.lineWidth = 5 / scale;
    ctx.strokeStyle = color.strokeColor;
    ctx.stroke(path);

    ctx.translate(-1 * translation.x, -1 * translation.y);
    ctx.scale(1 / scale, 1 / scale);
    ctx.rotate(-1 * rotation);
}

const Shapes = [
    {
        name: 'diamond',
        width: 1.3 * 92,
        height: 1.3 * 48,
        render: (ctx, color, c) => {
            renderPath(ctx, color, c, {
                data: 'M 0 46 L 24 0 L 48 46 L 24 92 Z',
                translation: { x: 0, y: -92 },
                rotation: Math.PI / 2,
                scale: 1.3
            });
        }
    },
    {
        name: 'squiggle',
        path: 'M 383 200 L 387 190 Q 392 173 386 165 L 382 160 Q 375 151 382 147 Q 395 143 407 149 Q 423 158 422 180 Q 421 187 417 196 Q 412 203 416 213 L 421 223 Q 425 230 421 235 Q 406 243 390 233 Q 375 223 383 200 Z',
        translation: Math.PI / 2,
        scale: 1.3,
        width: 1.3 * 92,
        height: 1.3 * 48,
        render: (ctx, color, c) => {
            renderPath(ctx, color, c, {
                data: 'M 383 200 L 387 190 Q 392 173 386 165 L 382 160 Q 375 151 382 147 Q 395 143 407 149 Q 423 158 422 180 Q 421 187 417 196 Q 412 203 416 213 L 421 223 Q 425 230 421 235 Q 406 243 390 233 Q 375 223 383 200 Z',
                translation: { x: -376, y: -240 },
                rotation: Math.PI / 2,
                scale: 1.3
            });
        }
    },
    {
        name: "oval",
        width: 1.3 * 92,
        height: 1.3 * 48,
        render: (ctx, color, c) => {
            const scale = 0.8;

            ctx.scale(scale, scale);

            ctx.beginPath();

            ctx.arc(39, 39, 39, 0.5 * Math.PI, 1.5 * Math.PI, false);
            ctx.lineTo(117, 0);
            ctx.arc(117, 39, 39, 1.5 * Math.PI, 0.5 * Math.PI, false);
            ctx.lineTo(39, 78);
            ctx.closePath();

            ctx.fillStyle = 'white';
            ctx.fill();

            ctx.strokeStyle = color.strokeColor;
            ctx.lineWidth = 5 / scale;
            ctx.stroke();

            ctx.scale(1 / scale, 1 / scale);
        }
    }
];

const Shades = [
    {
        name: "solid",
        getFillStyle: (ctx, color) => color.fillColor
    },
    {
        name: "halftone",
        getFillStyle: (ctx, color) => color.halftoneTile.getPattern(ctx)
    },
    {
        name: "empty",
        getFillStyle: (ctx, color) => '#00000000'
    }
]

const Colors = [
    {
        name: "yellow",
        fillColor: '#ffe2a5',
        strokeColor: '#FFC44C',
        halftoneTile: new TiledImage('./assets/halftone-yellow.png')
    },
    {
        name: "green",
        fillColor: '#a0dcc0',
        strokeColor: '#4EC88F',
        halftoneTile: new TiledImage('./assets/halftone-green.png')
    },
    {
        name: "purple",
        fillColor: '#e4a9fe',
        strokeColor: '#9C3EC5',
        halftoneTile: new TiledImage('./assets/halftone-purple.png')
    }
]


const Numbers = [
    {
        name: "one",
        value: 1
    },
    {
        name: "two",
        value: 2
    },
    {
        name: "three",
        value: 3
    }
]

const AbsoluteCardHeight = 352;
const AbsoluteCardWidth = 252;

class Layout {
    constructor(width, height) {
        this.name = `${width} x ${height}`
        this.cardsPerRow = width;
        this.cardsPerCol = height;
        this.ratio = getAspectRatio(AbsoluteCardWidth * width, AbsoluteCardHeight * height);
    }
}

class BoardCalculator {

    constructor(viewport, layout) {
        this.layout = layout;

        this.scalingFactor = Math.min(
            viewport.height / (AbsoluteCardHeight * layout.cardsPerCol),
            viewport.width / (AbsoluteCardWidth * layout.cardsPerRow)
        );

        this.offset = {
            x: (viewport.width - (this.cardSpaceWidth * layout.cardsPerRow)) / 2 + viewport.left,
            y: (viewport.height - (this.cardSpaceHeight * layout.cardsPerCol)) / 2 + viewport.top,
        };
    }

    get margin() {
        return 10;
    }

    get cardSpaceWidth() {
        return this.scalingFactor * AbsoluteCardWidth;
    }

    get cardSpaceHeight() {
        return this.scalingFactor * AbsoluteCardHeight;
    }

    getCardSpaceLeft(idx) {
        return (this.cardSpaceWidth * (idx % this.layout.cardsPerRow)) + this.offset.x;
    }

    getCardSpaceTop(idx) {
        return (this.cardSpaceHeight * Math.floor(idx / this.layout.cardsPerRow)) + this.offset.y;
    }

    getCardBounds(idx) {
        return {
            left: this.getCardSpaceLeft(idx) + this.margin,
            top: this.getCardSpaceTop(idx) + this.margin,
            width: this.cardSpaceWidth - 2 * this.margin,
            height: this.cardSpaceHeight - 2 * this.margin
        };
    }
}

class CardCalculator {
    constructor(bounds) {
        this.scalingFactor = Math.min(
            bounds.height / AbsoluteCardHeight,
            bounds.width / AbsoluteCardWidth
        );

        this.scale = (val) => this.scalingFactor * val;

        this.left = bounds.left;
        this.top = bounds.top;
        this.width = this.scale(AbsoluteCardWidth);
        this.height = this.scale(AbsoluteCardHeight);
    }

    x(val) {
        return this.scale(val) + this.left;
    }

    y(val) {
        return this.scale(val) + this.top;
    }

    intersects(point) {
        return !(point.x < this.left || point.x > (this.left + this.width) || point.y < this.top || point.y > (this.top + this.height));
    }
}

const getAspectRatio = (width, height) => {
    return width / height;
}

const Layouts = [
    new Layout(3, 4),
    new Layout(4, 3),
    new Layout(2, 6),
    new Layout(6, 2),
    new Layout(12, 1),
    new Layout(1, 12)
]

const play = () => {
    const board = new Board();

    init(board);
    setInterval(() => board.render(), 17);
}

var worldText = "";
var worldTextLastUpdated = Date.now() - 5000;

class Board {
    constructor() {
        this.cards = [];
        this.size = 12

        this.fillBoard();
    }

    fillBoard() {
        while (!this.containsSet) {
            this.cards = [];
            this.worldText = "No more sets. Regenerating..."
            this.worldTextLastUpdated = Date.now();

            for (var i = 0; i < this.size; i++) {
                this.cards.push(this.generateNextCard())
            }
        }
    }

    generateNextCard() {
        var card;
        do { card = new Card(); }
        while (_.some(this.cards, (val) => card.equals(val)));
        return card;
    }

    get isSelecting() {
        return _.some(this.cards, { isSelected: true });
    }

    handleInput(ctx, click) {
        var bounds = this.getBounds(ctx.canvas);
        var layout = selectLayout(bounds, Layouts);
        var boardCalculator = new BoardCalculator(bounds, layout);

        var handled = _.some(this.cards, (val, idx) => val.handleInput(click, boardCalculator.getCardBounds(idx)));
        if (handled === false) {
            this.clearSelection();
        }

        var set = new SetAttempt(_.filter(this.cards, { isSelected: true }));
        if (set.isComplete) {
            this.handleSetAttempt(set);
        }

        return true;
    }

    clearSelection() {
        this.cards.forEach(val => val.isSelected = false);
    }

    handleSetAttempt(set) {
        if (!set.isSet) {
            this.clearSelection();
            return;
        }

        set.cards.forEach(val => {
            var idx = _.findIndex(this.cards, val);
            this.cards.splice(idx, 1, this.generateNextCard());
        });

        this.fillBoard(); // Sanity check.
    }

    get containsSet() {
        for (var i = 0; i < this.cards.length; i++) {
            for (var j = i + 1; j < this.cards.length; j++) {
                for (var k = j + 1; k < this.cards.length; k++) {
                    var set = new SetAttempt([this.cards[i], this.cards[j], this.cards[k]]);
                    if (set.isSet) {
                        console.log(set.toString());
                        return true;
                    }
                }
            }
        }

        return false;
    }

    render(ctx) {
        var bounds = this.getBounds(ctx.canvas);
        var layout = selectLayout(bounds, Layouts);
        var boardCalculator = new BoardCalculator(bounds, layout);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        if (this.isSelecting) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        this.cards.forEach((card, idx) => {
            card.render(ctx, boardCalculator.getCardBounds(idx), this);
        });
    }

    getBounds(viewport) {
        const padding = {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        };

        return {
            left: padding.left,
            top: padding.top,
            width: viewport.width - padding.left - padding.right,
            height: viewport.height - padding.top - padding.bottom
        };
    }
}

class SetAttempt {
    constructor(cards) {
        this.cards = cards;
    }

    get isSet() {
        return this.allSameOrAllDifferent(c => c.shade.name) &&
            this.allSameOrAllDifferent(c => c.shape.name) &&
            this.allSameOrAllDifferent(c => c.color.name) &&
            this.allSameOrAllDifferent(c => c.number.name);
    }

    allSameOrAllDifferent(selector) {
        return this.allSame(selector) || this.allDifferent(selector);
    }

    allSame(selector) {
        return _.uniqBy(this.cards, selector).length === 1;
    }

    allDifferent(selector) {
        return _.uniqBy(this.cards, selector).length === 3;
    }

    get isComplete() {
        return this.cards.length === 3;
    }

    toString() {
        return _.join(this.cards.map(val => val.toString()), ', \r\n');
    }

}

class Message {
    constructor() {
        this._innerText = undefined;
        this.lastUpdated = Date.now() - 5000;
    }

    set text(val) {
        this._innerText = val;
        this.lastUpdated = Date.now();
    }

    render(ctx) {
        if (worldTextLastUpdated + 1000 < Date.now()) {
            return;
        }

        var rect = {
            left: ctx.canvas.width / 2 - 100,
            top: ctx.canvas.height / 2 - 50,
            width: 200,
            height: 100
        }

        ctx.fillStyle = "white";
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

        ctx.font = "14px Helvetica";
        ctx.fillStyle = "black";
        ctx.fillText(worldText, ctx.canvas.width / 2 - 40, ctx.canvas.height / 2 + 5);
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.message = new Message();
        this.message.text = "Hello, world!";

        this.rerender = true;
        this.click = undefined;
        this.dimensions = { width: 0, height: 0 };

        this.init();
    }

    init() {
        var canvasElement = $('#canvas');
        var canvasContainerElement = $('#canvasContainer')[0];

        var onResize = () => {
            console.log('resize');
            canvasElement.attr('width', canvasContainerElement.clientWidth);
            canvasElement.attr('height', canvasContainerElement.clientHeight);

            this.rerender = true;
            this.loop();
        }

        // $(window).on('resize', _.debounce(onResize, 100));
        // onResize();

        const resizeObserver = new ResizeObserver(entries => {
            var entry = entries[entries.length - 1];

            this.dimensions = { width: entry.contentRect.width, height: entry.contentRect.height };

            // for (var i = 0; i < entries.length; i++) {
            //     canvasElement.attr('width', entry.contentRect.width);
            //     canvasElement.attr('height', entry.contentRect.height);
            // }

            this.rerender = true;
            this.loop();
            // onResize();
        });

        // onResize();
        const onClick = this.handleClick.bind(this);

        canvasElement[0].addEventListener('click', (e) => onClick(e, e));
        canvasElement[0].addEventListener('touchstart', (e) => onClick(e, e.touches[0]));
        resizeObserver.observe(canvasContainerElement);
    }

    start() {
        setInterval(() => this.loop(), 17);
    }

    handleClick(e, { clientX, clientY }) {
        e.preventDefault();
        this.click = {
            x: clientX,
            y: clientY
        };
    }

    loop() {
        var ctx = $('#canvas')[0].getContext('2d');

        this.handleInputs(ctx);
        this.render(ctx);
    }

    handleInputs(ctx) {
        if (this.click === undefined) {
            return;
        }

        this.board.handleInput(ctx, this.click);
        this.click = undefined;
        this.rerender = true;
    }

    render(ctx) {
        // if (!this.rerender) {
        //     return;
        // }

        ctx.canvas.width = this.dimensions.width;
        ctx.canvas.height = this.dimensions.height;

        this.board.render(ctx);
        this.message.render(ctx);
        this.rerender = false;
    }

}


const selectLayout = ({ width, height }, layouts) => {
    const diffs = layouts.map((val, idx) => ({ layout: val, diff: Math.abs(getAspectRatio(width, height) - val.ratio) }));
    const min = _.minBy(diffs, 'diff');
    return min.layout;
}

class Card {
    constructor() {
        this.shape = _.sample(Shapes);
        this.color = _.sample(Colors);
        this.number = _.sample(Numbers);
        this.shade = _.sample(Shades);
        this.isSelected = false;
    }

    equals({ shape, color, number, shade }) {
        return this.shape.name === shape.name &&
            this.color.name === color.name &&
            this.number.name === number.name &&
            this.shade.name === shade.name;
    }

    toString() {
        return `${this.number.name} ${this.color.name} ${this.shade.name} ${this.shape.name}`;
    }

    get background() {
        return {
            render: (ctx, color) => {
                const margin = 25; // shading margin
                const bounds = {
                    left: margin,
                    top: margin,
                    width: AbsoluteCardWidth - 2 * margin,
                    height: AbsoluteCardHeight - 2 * margin
                }

                ctx.fillStyle = this.shade.getFillStyle(ctx, color);
                ctx.fillRect(bounds.left, bounds.top, bounds.width, bounds.height);

                ctx.strokeStyle = color.strokeColor;
                ctx.lineWidth = 5;
                ctx.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);
            }
        };
    }

    handleInput(click, bounds) {
        const c = new CardCalculator(bounds);

        if (c.intersects(click)) {
            this.isSelected = !this.isSelected;
            return true;
        }

        return false;
    }

    render(ctx, bounds, board) {
        const c = new CardCalculator(bounds);

        ctx.translate(c.x(0), c.y(0));
        ctx.scale(c.scale(1), c.scale(1));

        ctx.lineWidth = 0.3 / c.scale(1);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, AbsoluteCardWidth, AbsoluteCardHeight);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, AbsoluteCardWidth, AbsoluteCardHeight);

        this.background.render(ctx, this.color);

        // Draw the shapes
        const margin = this.shape.height / 6;
        const shapeBounds = {
            left: (AbsoluteCardWidth - this.shape.width) / 2,
            top: (AbsoluteCardHeight - this.number.value * this.shape.height - (this.number.value - 1) * margin) / 2
        }

        ctx.translate(shapeBounds.left, shapeBounds.top);

        for (let i = 0; i < this.number.value; i++) {
            const top = i * (this.shape.height + margin);
            ctx.translate(0, top);
            this.shape.render(ctx, this.color, c);
            ctx.translate(0, -1 * top);
        }

        ctx.translate(-1 * shapeBounds.left, -1 * shapeBounds.top);

        if (!this.isSelected && board.isSelecting) {
            // ctx.strokeStyle = 'blue';
            // ctx.lineWidth = 5;
            // ctx.strokeRect(0, 0, AbsoluteCardWidth, AbsoluteCardHeight);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, AbsoluteCardWidth, AbsoluteCardHeight);
        }

        ctx.scale(1 / c.scale(1), 1 / c.scale(1));
        ctx.translate(-1 * c.x(0), -1 * c.y(0));
    }
}

// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
// let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
// document.documentElement.style.setProperty('--vh', `${vh}px`);

new Game().start();
