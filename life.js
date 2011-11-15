/*jslint evil: false, strict: false, undef: true, white: false, onevar:false, browser:true, plusplus:false, nomen: false */
/*global window:true */
(function(){
    
    // Setup canvas
    var gui = document.querySelectorAll('canvas')[0];
        gui.width = 501;
        gui.height = 501; 
    var ctx = gui.getContext('2d');
      
    //Setup game properties  
      
    // Create grid based off GUI size
    var gridSize = 10; // pixels
    var xCells   = Math.floor(gui.width / gridSize);
    var yCells = Math.floor(gui.height / gridSize);
    var cells = [];
    
    //Setup events
    var mouseDown = false;
    
    
    // Pre-fill array with 0's to start with (i.e. dead cells)
    (function initCellsArray() {    
      for (var x=0; x < xCells; x++) {
          cells[x] = [];
          for (var y=0; y < yCells; y++) {
              cells[x][y] = 0;
          }
      }
    })();
        
    function addCell(x, y) {
        if(typeof cells[x] !== "undefined" && 
            typeof cells[x][y] !== "undefined") {
            cells[x][y] = 2;
        }
    }

    function getCoordinatesFromMouse(e) {
        var xPos = e.pageX - gui.offsetLeft;
        var yPos = e.pageY - gui.offsetTop;
        var x = Math.floor(xPos / gridSize);
        var y = Math.floor(yPos / gridSize);
    
        return {x:x,y:y};
    }
    document.onmousedown = function(e) {
        var pos = getCoordinatesFromMouse(e);

        addCell(pos.x, pos.y);

        mouseDown = true;
    };
    document.onmousemove = function(e) {
        if(mouseDown){
            var pos = getCoordinatesFromMouse(e);
            addCell(pos.x, pos.y);
        }
    };
    document.onmouseup = function(e) {
        mouseDown = false;
    };
    
    
    // Rendering

    function renderGrid() {
        // Draw horizontal lines
        ctx.beginPath();
        for (var y=0; y < gui.height; y = y + gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(gui.width, y);
        }
        // Draw vertical lines
        for (var x=0; x < gui.width; x = x + gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gui.height);
        }
        ctx.strokeStyle = "#ddd"; 
        ctx.stroke();
        ctx.closePath();
    }

    function renderCells() {
        for (var x=0; x < cells.length; x++) {
            if(typeof cells[x] !== "undefined") {
                for (var y=0; y < cells[x].length; y++) {
                    if(typeof cells[x][y] !== "undefined" &&
                              cells[x][y] === 1) {
                        ctx.fillRect(x * gridSize + 1, y * gridSize + 1, gridSize - 1, gridSize - 1);
                    }
                } 
            }
        }
    }
    
    /**
     * We check the surrounding cells have neigbours in them.
     * alive cells (1) and cells that will be deleted next generation (-1)
     */
    function countNeighbours(x,y) {
        var neighbourCount = 0;
    
        // top left
        if( typeof cells[x-1] !== "undefined" && 
            typeof cells[x-1][y+1] !== "undefined" &&
                   Math.abs(cells[x-1][y+1]) === 1) { // Math abs to count -1 cells and +1
            neighbourCount++;
        }
    
        // center left
        if( typeof cells[x] !== "undefined" && 
            typeof cells[x][y+1] !== "undefined" &&
                   Math.abs(cells[x][y+1]) === 1) {
            neighbourCount++;
        }
    
        // top right
        if( typeof cells[x+1] !== "undefined" && 
            typeof cells[x+1][y+1] !== "undefined" &&
                   Math.abs(cells[x+1][y+1]) === 1) {
            neighbourCount++;
        }
    
        // center left
        if( typeof cells[x-1] !== "undefined" && 
            typeof cells[x-1][y] !== "undefined" &&
                   Math.abs(cells[x-1][y]) === 1) {
            neighbourCount++;
        }
    
        // center right
        if( typeof cells[x+1] !== "undefined" && 
            typeof cells[x+1][y] !== "undefined" &&
                   Math.abs(cells[x+1][y]) === 1) {
            neighbourCount++;
        }
    
        // bottom left
        if( typeof cells[x-1] !== "undefined" && 
            typeof cells[x-1][y-1] !== "undefined" &&
                   Math.abs(cells[x-1][y-1]) === 1) {
            neighbourCount++;
        }
    
        // bottom center
        if( typeof cells[x] !== "undefined" && 
            typeof cells[x][y-1] !== "undefined" &&
                   Math.abs(cells[x][y-1]) === 1) {
            neighbourCount++;
        }
        // bottom right
        if( typeof cells[x+1] !== "undefined" && 
            typeof cells[x+1][y-1] !== "undefined" &&
                   Math.abs(cells[x+1][y-1]) === 1) {
            neighbourCount++;
        }
    
        return neighbourCount;
    }

    function calculateCells() {
        var neighbourCount;
        var deadCell;
        var aliveCell;
        var dieingCell;
        var eggCell;
    
        var x,y;
    
        for (x=0; x < cells.length; x++) {
            for(y=0; y < cells[x].length; y++) {
                // Ok, we've arrived at our cell, now let's check it's neigbours
                neighbourCount = countNeighbours(x,y);
            
                deadCell    = (cells[x][y] === 0);
                aliveCell   = (cells[x][y] === 1);

                // If the cell is empty and has 3 neighbours, bring it to life.
                if( deadCell && neighbourCount == 3) {
                    cells[x][y] = 2;
                }
                else if( aliveCell ) {
                    if(neighbourCount < 2 || neighbourCount > 3 ) {
                        cells[x][y] = -1; //mark for death
                    }
                } 
            }
        }
    
        // Now we've calculated the changes for this generation, implement them.
        for (x=0; x < cells.length; x++) {
            for(y=0; y < cells[x].length; y++) {
            
                dieingCell  = (cells[x][y] === -1);
                eggCell     = (cells[x][y] === 2);
            
                if(eggCell) {
                    cells[x][y] = 1;
                }
                if(dieingCell) {
                    cells[x][y] = 0;
                }
            }
        }

    }

    function tick() {
        calculateCells();
        ctx.clearRect(0, 0, gui.width, gui.height);
        renderGrid();
        renderCells();
    }

   /* addCell(0,4);
    addCell(6,3);
    addCell(5,3);
    addCell(4,3);
    addCell(11,5);
    addCell(10,6);
    addCell(12,6);
    addCell(10,7);
    addCell(12,7);
    addCell(11,8);
    addCell(12,8);
    addCell(28,38);
    addCell(28,38);
    addCell(28,39);
    addCell(29,39);*/
    
    var s = 7;
    var d = 20;
    // Gosper glider gun, starting positions
    addCell(s,d+2);
    addCell(s,d+3);
    addCell(s+1,d+2);
    addCell(s+1,d+3);
    addCell(s+8,d+3);
    addCell(s+8,d+4);
    addCell(s+9,d+2);
    addCell(s+9,d+4);
    addCell(s+10,d+2);
    addCell(s+10,d+3);
    addCell(s+16,d+4);
    addCell(s+16,d+5);
    addCell(s+16,d+6);
    addCell(s+17,d+4);
    addCell(s+18,d+5);
    addCell(s+22,d+1);
    addCell(s+22,d+2);
    addCell(s+23,d+0);
    addCell(s+23,d+2);
    addCell(s+24,d+0);
    addCell(s+24,d+1);
    addCell(s+24,d+12);
    addCell(s+24,d+13);
    addCell(s+25,d+12);
    addCell(s+25,d+14);
    addCell(s+26,d+12);
    addCell(s+34,d);
    addCell(s+34,d+1);
    addCell(s+35,d);
    addCell(s+35,d+1);
    addCell(s+35,d+7);
    addCell(s+35,d+8);
    addCell(s+35,d+9);
    addCell(s+36,d+7);
    addCell(s+37,d+8);
    

    window.setInterval(tick, 70);

}());