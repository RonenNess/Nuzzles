/**
 * This script responsible to take an image and break it into puzzle pieces.
 * Author: Ronen Ness.
 * Since: 2021.
 */

class PuzzleGenerator
{
    /**
     * Create the puzzle pieces.
     * @param {*} settings dictionary with settings:
     *                      source: source image.
     *                      piecesCount: a dictionary with x,y. defaults to {3,3}.
     *                      
     * @returns 2d array with images data, where every image is a puzzle piece.
     */
    async create(settings)
    {
        // sanity
        if (!settings.source || !settings.source.width)
        {
            throw new Error("Invalid or missing source image!");
        }

        // defaults
        settings.piecesCount = settings.piecesCount || {x:3,y:3};
        
        // calculate pieces size and margin
        let margin = Math.round((Math.round((settings.source.width / settings.piecesCount.x) / 3) + Math.round((settings.source.width / settings.piecesCount.x) / 3)) / 2);
        let marginWidth = margin; //Math.round((settings.source.width / settings.piecesCount.x) / 3);
        let marginHeight = margin; //Math.round((settings.source.height / settings.piecesCount.y) / 3);
        let baseWidth = Math.round(settings.source.width / settings.piecesCount.x);
        let baseHeight = Math.round(settings.source.height / settings.piecesCount.y);
        let pieceWidth = baseWidth + marginWidth * 2;
        let pieceHeight = baseHeight + marginHeight * 2;
        let bumpRadiusX = Math.round(marginWidth / 1.75);
        let bumpRadiusY = Math.round(marginHeight / 1.75);

        // canvas to generate parts
        let canvas = document.createElement('canvas');
        canvas.width = pieceWidth;
        canvas.height = pieceHeight;
        let ctx = canvas.getContext('2d');

        // first randomize connection masks
        let connectionMasks = [];
        for (let i = 0; i < settings.piecesCount.x; ++i)
        {
            connectionMasks[i] = [];
            for (let j = 0; j < settings.piecesCount.y; ++j)
            {
                // clear canvas
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // draw center part
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.fillRect(marginWidth, marginHeight, baseWidth, baseHeight);

                // draw matching hole or bump based on previous mask
                if (i > 0)
                {
                    var prevPart = connectionMasks[i-1][j];

                    // draw horizontal bump
                    if (prevPart.bumpLeft)
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth + bumpRadiusX / 2), Math.round(marginHeight + baseHeight / 2), bumpRadiusX, 0, Math.PI * 2);
                        ctx.fillStyle = 'white';
                        ctx.fill();
                    }
                    // draw horizontal hole
                    else
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth - bumpRadiusX / 2), Math.round(marginHeight + baseHeight / 2), bumpRadiusX, 0, Math.PI * 2);
                        ctx.fillStyle = 'black';
                        ctx.fill();
                    }
                }

                // draw matching hole or bump based on previous mask
                if (j > 0)
                {
                    var prevPart = connectionMasks[i][j-1];

                    // draw horizontal bump
                    if (prevPart.bumpDown)
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth + baseWidth / 2), Math.round(marginHeight + bumpRadiusY / 2), bumpRadiusY, 0, Math.PI * 2);
                        ctx.fillStyle = 'white';
                        ctx.fill();
                    }
                    // draw horizontal hole
                    else
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth + baseWidth / 2), Math.round(marginHeight - bumpRadiusY / 2), bumpRadiusY, 0, Math.PI * 2);
                        ctx.fillStyle = 'black';
                        ctx.fill();
                    }
                }

                // decide randomly if we want a bump or hole on left side
                let bumpLeft = Math.floor(Math.random() * 10) < 5;

                // decide randomly if we want a bump or hole on bottom side
                let bumpDown = Math.floor(Math.random() * 10) < 5;

                if (i < settings.piecesCount.x - 1)
                {
                    // draw horizontal bump
                    if (bumpLeft)
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(baseWidth + marginWidth + bumpRadiusX / 2), Math.round(marginHeight + baseHeight / 2), bumpRadiusX, 0, Math.PI * 2);
                        ctx.fillStyle = 'black';
                        ctx.fill();
                    }
                    // draw horizontal hole
                    else
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(baseWidth + marginWidth - bumpRadiusX / 2), Math.round(marginHeight + baseHeight / 2), bumpRadiusX, 0, Math.PI * 2);
                        ctx.fillStyle = 'white';
                        ctx.fill();
                    }
                }

                if (j < settings.piecesCount.y - 1)
                {
                    // draw vertical bump
                    if (bumpDown)
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth + baseWidth / 2), Math.round(baseHeight + marginHeight + bumpRadiusY / 2), bumpRadiusY, 0, Math.PI * 2);
                        ctx.fillStyle = 'black';
                        ctx.fill();
                    }
                    // draw vertical hole
                    else
                    {
                        ctx.beginPath();
                        ctx.arc(Math.round(marginWidth + baseWidth / 2), Math.round(baseHeight + marginHeight - bumpRadiusY / 2), bumpRadiusY, 0, Math.PI * 2);
                        ctx.fillStyle = 'white';
                        ctx.fill();
                    }
                }

                // conver to image and set in masks matrix
                let maskImg = canvas.toDataURL("image/png");
                connectionMasks[i].push({img: maskImg, bumpLeft: bumpLeft, bumpDown: bumpDown});
            }   
        }

        // method to wait for image load as promise
        var addImageProcess = function(src) {
            return new Promise((resolve, reject) => {
              let img = new Image()
              img.onload = () => resolve(img)
              img.onerror = reject
              img.src = src
            })
        }

        // now generate actual parts
        let parts = [];
        for (let i = 0; i < settings.piecesCount.x; ++i)
        {
            parts[i] = [];
            for (let j = 0; j < settings.piecesCount.y; ++j)
            {
                // clear canvas
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // set mask
                let mask = await addImageProcess(connectionMasks[i][j].img);
                ctx.drawImage(mask, 0, 0);

                // turn mask white pixels to transparent
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let data = imageData.data;
                for (let pi = 0; pi < data.length; pi += 4) {
                    let avg = (data[pi] + data[pi + 1] + data[pi + 2]) / 3;
                    if (avg > 225) 
                    {
                        data[pi + 3] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);

                /// draw the image to be clipped with source-in
                ctx.globalCompositeOperation = 'source-in';
                ctx.drawImage(settings.source, -marginWidth + (baseWidth) * i, -marginHeight + (baseHeight) * j, pieceWidth, pieceHeight, 0, 0, canvas.width, canvas.height);

                // generate part and push to parts array
                let part = canvas.toDataURL("image/png");
                parts[i].push(part);

                // reset composite operation
                ctx.globalCompositeOperation = 'source-over';
            }
        }
        
        // return result
        return {
            parts: parts,
            marginWidth: marginWidth,
            marginHeight: marginHeight,
            baseWidth: baseWidth,
            baseHeight: baseHeight,
            pieceWidth: pieceWidth,
            pieceHeight: pieceHeight,
            bumpRadiusX: bumpRadiusX,
            bumpRadiusY: bumpRadiusY
        }
    }
}