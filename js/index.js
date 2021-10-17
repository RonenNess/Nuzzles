/**
 * Script for index page to generate image selections.
 * Author: Ronen Ness.
 * Since: 2021.
 */

// generate image selection button
function addImageSelection(imageFile)
{
    // get container and image selection template
    let container = $('#images-container');
    let template = document.getElementById('image-selection-template');

    // clone and add to container
    let curr = $(template.content.cloneNode(true));
    let img = curr.find('img')[0];
    img.src = "assets/images/" + imageFile;
    img.onclick = () => { selectPuzzleImage(img); }
    container.append(curr);
}


// close the currently opened puzzle.
function closePuzzle()
{
    $('#menu-modal').modal('hide'); 
    $('#main-iframe').hide()[0].src = '';
    $("#menu-button").hide();
}


// show / hide scrollbar based on puzzle visibility
setInterval(() => {
    let puzzleVisible = document.getElementById('main-iframe').style.display != 'none';
    document.body.style.overflowY = puzzleVisible ? 'hidden' : 'scroll';
    document.body.style.height = puzzleVisible ? '0px' : 'auto';
    document.body.style.display = 'block';
}, 50);


// pieces count
let _piecesCount = [3,3];
let _piecesCountSelected = 9;

// select pieces count
function selectPiecesCount(piecesCount)
{
    // update styles
    $(".diff-select").removeClass('active');
    $(".val-" + piecesCount).addClass('active');

    // update values
    _piecesCountSelected = piecesCount;
    switch (piecesCount)
    {
        case 4:
            _piecesCount = [2,2];
            break;

        case 6:
            _piecesCount = [2,3];
            break;
                        
        case 9:
            _piecesCount = [3,3];
            break;
                                    
        case 12:
            _piecesCount = [3,4];
            break;
                                                
        case 16:
            _piecesCount = [4,4];
            break;
                                          
        case 25:
            _piecesCount = [5,5];
            break;
                                                      
        case 36:
            _piecesCount = [6,6];
            break;
                                                                  
        case 49:
            _piecesCount = [7,7];
            break;
                                                                  
        case 64:
            _piecesCount = [8,8];
            break;
    }
}


// select image and start puzzle
function selectPuzzleImage(img)
{
    // get pieces count and flip to adjut image propotions
    let piecesCount = {x: _piecesCount[0], y: _piecesCount[1]};
    if (piecesCount.x > piecesCount.y && img.width < img.height) {
        let temp = piecesCount.x;
        piecesCount.x = piecesCount.y;
        piecesCount.y = temp;
    }
    localStorage.setItem("pieces_count", JSON.stringify(piecesCount));

    // save settings
    saveSettings();

    // set selected puzzle
    localStorage.setItem("selected_puzzle", img.src);

    // load puzzle in iframe
    $("#main-iframe").show()[0].src = "puzzle.html?_cache=1";
    $("#menu-button").show();
}


// save settings
function saveSettings()
{
    localStorage.setItem("settings", JSON.stringify({
        background: $("#setting-show-background-image").is(':checked'),
        snapping: parseInt($("#settings-snapping-strength").val()),
        piecesCount: _piecesCountSelected,
    }));
}


// implement upload file logic
document.getElementById('upload-image-file').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {

            // get image data
            let img = new Image();
            img.src = fr.result;
            img.onload = () => {

                // image is loaded, check if need cropping
                let ratio = (img.width / img.height);
                if (ratio > 1.1 || ratio < 0.9) 
                {
                    let size = Math.min(img.width, img.height);
                    const cropper = document.createElement("canvas");
                    cropper.width = size;
                    cropper.height = size;
                    const ctx = cropper.getContext("2d");
                    ctx.drawImage(img, size / 2 - img.width / 2, size / 2 - img.height / 2, img.width, img.height);
                    let croppedImg = new Image();
                    croppedImg.src = cropper.toDataURL();
                    croppedImg.onload = () => {
                        $('#upload-img-modal').modal('hide');
                        selectPuzzleImage(croppedImg);
                    }
                }
                // no cropping needed
                else 
                {
                    $('#upload-img-modal').modal('hide')
                    selectPuzzleImage(img);
                }
            }
        }
        fr.readAsDataURL(files[0]);
    }

    // Not supported
    else {
        alert("Reading image data not supported on your browser!");
    }
}


// load settings from local storage
let settings = localStorage.getItem("settings");
if (settings) {
    settings = JSON.parse(settings);
    $("#setting-show-background-image").attr('checked', settings.background);
    $("#settings-snapping-strength").val(settings.snapping);
    selectPiecesCount(settings.piecesCount || 4);
}
else
{
    // select default pieces count
    selectPiecesCount(4);
}