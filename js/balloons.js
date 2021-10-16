/**
 * Generate random balloons animation.
 * From: https://codepen.io/Jemimaabu/pen/vYEYdOy
 */

(function() {

    function random(num) {
        return Math.floor(Math.random()*num)
    }
    
    function getRandomStyles() {
        var r = random(255);
        var g = random(255);
        var b = random(255);
        var mt = random(350);
        var ml = random(350);
        var dur = random(25)+30;
        return `
        background-color: rgba(${r},${g},${b},0.7);
        color: rgba(${r},${g},${b},0.7); 
        box-shadow: inset -7px -3px 10px rgba(${r-10},${g-10},${b-10},0.7);
        margin: ${mt}px 0 0 ${ml}px;
        animation: float ${dur}s ease-in infinite
        `
    }
    
    function createBalloons(num) {
        var balloonContainer = document.getElementById("balloon-container")
        for (var i = num; i > 0; i--) {
            var balloon = document.createElement("div");
            balloon.className = "balloon";
            balloon.style.cssText = getRandomStyles();           
            balloonContainer.append(balloon);
        }
    }
    
    window.onload = function() {
        createBalloons(25);
    }
})();