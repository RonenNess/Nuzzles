/**
 * This script responsible to generate the puzzle itself and run the game.
 * Author: Ronen Ness.
 * Since: 2021.
 */

class Puzzle
{
    /**
     * Create the puzzle engine.
     */
    constructor()
    {
        this.snappingStrength = 60;
    }

    /**
     * Create the puzzle game.
     * @package {div} mainDiv div to put the puzzle on.
     * @param {*} parts puzzle parts and data, as provided by the PuzzleGenerator.
     * @param {div[]} partsContainers array of divs to place parts inside.
     */
    async initialize(mainDiv, parts, partsContainers)
    {
        // get main div
        this._mainDiv = mainDiv;

        // store parts data and containers
        this._md = parts;
        parts = parts.parts;
        this._partsSrc = parts;
        this._piecesCount = {x: parts.length, y: parts[0].length};
        this._partsContainers = partsContainers;

        // create image elements
        let allParts = [];
        for (let i = 0; i < parts.length; ++i)
        {
            for (let j = 0; j < parts[0].length; ++j)
            { 
                let img = await this._createPuzzlePiece(parts[i][j], {x:i, y:j});
                allParts.push(img);
            }
        }

        // randomize parts order
        allParts = allParts.map((value) => ({ value, sort: Math.random() }))
                            .sort((a, b) => a.sort - b.sort)
                            .map(({ value }) => value);
        this._parts = allParts;

        // place images
        let container = 0;
        for (let i = 0; i < allParts.length; ++i)
        {
            partsContainers[container++].appendChild(allParts[i]);
            if (container >= partsContainers.length) { container = 0; }
        }

        // more cross-browser way to disable dragging
        document.addEventListener("dragstart", function(e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });

        // add general stop dragging logic
        document.ontouchend = document.mouseup = () => {
            this._stopDragging();
        }

        // register callback to track mouse position and implement dragging
        document.ontouchmove = document.onmousemove = (e) => {

            // get mouse position
            this._mousePosition = {x: e.clientX, y: e.clientY};

            // do dragging
            if (this._draggedPiece) {
                this._doDragging(this._draggedPiece);
            }
        }

        // handle resize
        window.onresize = () => {
            this._adjustPiecesSize();
        }
        this._adjustPiecesSize();
    }

    /**
     * Adjust all pieces size.
     */
    _adjustPiecesSize()
    {
        // calculate desired width
        let desiredWidth = Math.floor(window.innerWidth / (this._piecesCount.x + 2));

        // make sure not exceeding height
        let part = this._parts[0];
        while (true)
        {
            part.style.width = desiredWidth + 'px';
            part.style.height = 'auto';
            let height = part.offsetHeight;
            height -= height * ((this._md.marginHeight / this._md.pieceHeight) * 2);
            if (height * this._piecesCount.y < window.innerHeight - 10) {
                break;
            }
            desiredWidth -= 10;
        }

        // calc desired width without margins
        let marginWidth = Math.ceil(desiredWidth * (this._md.marginWidth / this._md.pieceWidth));
        let desiredWidthWithoutMargin = desiredWidth - (marginWidth * 2);

        // set parts size
        for (let i = 0; i < this._parts.length; ++i)
        {
            this._parts[i].style.width = desiredWidth + 'px';
            this._parts[i].style.height = 'auto';
            this._parts[i].style.position = 'fixed';
        }

        // adjust inventory width and offset of parts in it
        let pieceHeight = this._parts[0].offsetHeight;
        for (let i = 0; i < this._partsContainers.length; ++i)
        {
            this._partsContainers[i].style.width = desiredWidth + 'px';
            var children = this._partsContainers[i].children;
            for (var j = 0; j < children.length; j++) {
                children[j].style.top = (j * pieceHeight) + 'px';
            }
        }

        // adjust main div width
        let mainDivWidth = (desiredWidthWithoutMargin * this._piecesCount.x);
        this._mainDiv.style.width = (desiredWidthWithoutMargin * this._piecesCount.x) + "px";
        this._mainDiv.style.left = ((window.innerWidth - mainDivWidth) / 2) + "px";

        // adjust main div height
        let marginHeight = Math.ceil(pieceHeight * (this._md.marginHeight / this._md.pieceHeight));
        let pieceHeightWithoutMargin = pieceHeight - (marginHeight * 2);
        let mainDivHeight = (pieceHeightWithoutMargin * this._piecesCount.y);
        this._mainDiv.style.height = mainDivHeight + "px";
        this._mainDiv.style.top = ((window.innerHeight - mainDivHeight) / 2) + "px";

        // set parts target offset
        let mainDivRect = this._mainDiv.getBoundingClientRect();
        for (let i = 0; i < this._parts.length; ++i)
        {
            let part = this._parts[i];
            let index = part._puzzle.index;
            part._puzzle.targetPosition = {x: index.x * desiredWidthWithoutMargin, y: index.y * pieceHeightWithoutMargin};
            part._puzzle.margins = {x: marginWidth, y: marginHeight};
            if (part._puzzle.isInPlace)
            {
                part.style.left = Math.floor(mainDivRect.left + part._puzzle.targetPosition.x - part._puzzle.margins.x) + 'px';
                part.style.top = Math.floor(mainDivRect.top + part._puzzle.targetPosition.y - part._puzzle.margins.y) + 'px';
            }
            else
            {
                // required so movement animation would work on x axis
                part.style.left = part.parentNode.getBoundingClientRect().left + 'px';
            }
        }
    }

    /**
     * Do dragging logic.
     * @param {img} piece element to drag.
     */
    _doDragging(piece)
    {
        let posX = (this._mousePosition.x - this._dragOffset.x);
        let posY = (this._mousePosition.y - this._dragOffset.y);
        piece.style.left = posX + 'px';
        piece.style.top = posY + 'px';
        let mainDivRect = this._mainDiv.getBoundingClientRect();
        piece._puzzle.offset = {x: posX - mainDivRect.left + piece._puzzle.margins.x, y: posY - mainDivRect.top + piece._puzzle.margins.y};
    }

    /**
     * Stop dragging current piece.
     */
    _stopDragging()
    {
        if (this._draggedPiece) {

            // shortcut
            let piece = this._draggedPiece;

            // check if was put in place
            let disX = piece._puzzle.offset.x - piece._puzzle.targetPosition.x;
            let disY = piece._puzzle.offset.y - piece._puzzle.targetPosition.y;
            let distanceFromTarget = Math.sqrt((disX * disX) + (disY * disY));

            // was put in place!
            if (distanceFromTarget < this.snappingStrength)
            {
                // mark as in-place
                piece._puzzle.isInPlace = true;

                // add to main div
                piece.parentNode.removeChild(piece);
                this._mainDiv.appendChild(piece);

                // remove shadow
                piece.style.filter = '';

                // remove ability to drag this piece
                piece.ontouchstart = piece.onmousedown = null;

                // add effect
                animateParticules(this._mousePosition.x, this._mousePosition.y);

                // check if done
                let allDone = true;
                for (let i = 0; i < this._parts.length; ++i) {
                    if (!this._parts[i]._puzzle.isInPlace) { allDone = false; break; }
                }

                // complete puzzle!
                if (allDone) {
                    startConfetti();
                    document.body.style.animation = 'random-colors 5s infinite';
                    document.body.style.background = '#ED5564';
                }
            }
            // not in place, go back to inventory
            else
            {
                piece.style.transition = 'left 0.5s ease 0s, top 0.5s ease 0s';
                piece.style.left = piece._puzzle.startDragPosition.left;
                piece.style.top = piece._puzzle.startDragPosition.top;
                piece.style.zIndex = 50;
            }
            this._draggedPiece = null;
            this._adjustPiecesSize();
        }
    }

    /**
     * Start dragging a puzzle piece.
     * @param {*} piece piece to start dragging.
     */
    _startDragging(piece)
    {
        // already dragging? skip
        if (this._draggedPiece) { return; }

        // already in place? skip
        if (piece._puzzle.isInPlace) { return; }

        // start dragging
        this._draggedPiece = piece;
        let rect = piece.getBoundingClientRect();
        this._dragOffset = {x: this._mousePosition.x - rect.left, y: this._mousePosition.y - rect.top};

        // store starting position
        piece._puzzle.startDragPosition = {left: piece.style.left, top: piece.style.top};

        // update z-index
        piece.style.transition = '';
        piece.style.position = 'fixed';
        piece.style.zIndex = 10000;

        // do initial dragging
        this._doDragging(piece);
    }

    /**
     * Create a puzzle piece.
     * @param {String} src Image source.
     * @param {*} pieceIndex Dictionary with {x,y} representing the piece position in puzzle.
     */
    async _createPuzzlePiece(src, pieceIndex)
    {
        // create image
        let img = new Image();
        img.src = src;
        await img.decode(); // <-- trick to wait for image load

        // disable native dragging since we implement our own
        img.setAttribute('draggable', false);

        // add shadow
        img.style.filter = 'drop-shadow(3px 3px 3px #000000aa)';

        // store context params
        img._puzzle = {
            engine: this,
            index: pieceIndex
        }

        // add dragging logic
        img.ontouchstart = img.onmousedown = () => {
            img._puzzle.engine._startDragging(img);
        };
        img.ontouchend = img.onmouseup = () => {
            img._puzzle.engine._stopDragging();
        };

        return img;
    }
}