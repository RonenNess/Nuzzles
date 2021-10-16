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
    document.body.style.overflowY = document.getElementById('main-iframe').style.display == 'none' ? 'scroll' : 'hidden';
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
    $("#main-iframe").show()[0].src = "puzzle.html";
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