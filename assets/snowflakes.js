/**
 * Created by g0tmk on 5/20/14.
 * 
 * @description Pixelized random snowflakes
 * @requires underscore */

// Converts from degrees to radians.
Math.radians = (degrees) => { return degrees * Math.PI / 180; };
// Converts from radians to degrees.
Math.degrees = (radians) => { return radians * 180 / Math.PI; };

window.onload = function(){
    /*   SETTINGS   */
    // number of particles
    var PARTICLES = 75;
    // snowflake color
    var COLOR = "rgba(255, 255, 255, 0.8)";
    // size of grid squares, in pixels
    var GRID_SIZE = 10;
    // shallowest snowflake angle (0: they all go down, 90: they can go sideways)
    var ANGLE = 45;
    // speed of snowflakes in grid squares per second
    var SPEED = 3;
    // desired FPS
    var FPS = 2;
    // number of snowflakes that can appear per frame. More than one is natural, too high is bad for performance.
    var SIMULT_FLAKES = 2;
    // canvas dimensions
    var WIDTH = $(document).width();
    var HEIGHT = $(document).height();
    // list that will hold our snowflakes
    var snowflakes = [];
    
    //the chance of a new flake in each frame
    var chance_of_flake = ((PARTICLES * SPEED * Math.cos(ANGLE) * GRID_SIZE * 2) / (FPS * HEIGHT * SIMULT_FLAKES));
    if(chance_of_flake > 1){
        console.log("Flake rate too high, change some settings");
    }
    
    // create the canvas
    var canvas = document.getElementById("snow-canvas");
    var context = canvas.getContext("2d");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    // pre-render a snowflake
    var rendered_snowflake_canvas = _.once(function(){
        var flake_canvas = document.createElement('canvas');
        var flake_context = flake_canvas.getContext("2d");
        flake_canvas.width = GRID_SIZE;
        flake_canvas.height = GRID_SIZE;
        flake_context.fillStyle = COLOR;
        flake_context.fillRect(0, 0, GRID_SIZE, GRID_SIZE);
        return flake_canvas;
    });
    
    // setup handler to update canvas when window size changes
    var update_canvas_dimensions = _.debounce(() => {
        canvas.width  = WIDTH;
        canvas.height = HEIGHT;
    }, 300);
    var check_update_dimensions = function(){
        if (WIDTH != $(document).width()
           || HEIGHT != $(document).height()){
            
            WIDTH  = $(document).width();
            HEIGHT = $(document).height();
            
            update_canvas_dimensions();
        }
    }
    
    //update snowflake positions
    function update(){
        // update all snowflakes
        _.map(snowflakes, (flake) => {
            flake.update()
        });
        
        // remove off-screen snowflakes
        snowflakes = _.filter(snowflakes, (flake) => {
            return flake.onScreen()
        });
        
        // generate some new snowflakes
        _.times(SIMULT_FLAKES, (n) => {
            if(Math.random() < chance_of_flake){
                snowflakes.push(new flake());
            }
        });
    }
    
    //Lets draw the flakes
    function draw(){
        // use setTimeout to limit FPS, combined with requestAnimationFrame() so we don't run in background
        setTimeout(function() {
            requestAnimationFrame(draw);
            
            // live-update the size
            check_update_dimensions();
            
            // start with a clear screen
            context.clearRect(0, 0, WIDTH, HEIGHT);
            context.beginPath();
            
            // draw each flake
            _.map(snowflakes, (flake) => {
                context.drawImage(rendered_snowflake_canvas(), flake.grid_x(), flake.grid_y());
            });
            
            // update the screen
            context.fill();
            
            // update / remove snowflakes
            update();
        }, 1000 / FPS);
    }
    draw();
    
    
    
    /* snowflake obj */
    var flake = function(){
        var x, y, dir;
        
        // return new obj if called in wrong context
        if(window == this) {
            return new flake();
        } else {
            /* Picks a random start location/direction
           Note: also allows for flakes within one screen width off to the left
           or the right */
            x = (Math.random() * WIDTH * 3) - WIDTH;
            y = 0;
            dir = (Math.random() * 2 * ANGLE) - ANGLE;
        }

        /* Updates location by one frame */
        this.update = function(){
            /* if against the bottom of the window, slow down a lot to simulate
               the snow piling up on the ground */
            if (y > HEIGHT+1 - GRID_SIZE) {
                x = x; /* stop moving horizontally */
                y = y + Math.cos(Math.radians(dir)) * 0.001 * SPEED * GRID_SIZE / FPS;
            } else {
                x = x + Math.sin(Math.radians(dir)) * SPEED * GRID_SIZE / FPS;
                y = y + Math.cos(Math.radians(dir)) * SPEED * GRID_SIZE / FPS;
            }
        };
        
        /* Boolean, checks if a flake is on the screen
           Note: also allows for flakes within one screen width off to the left
           or the right */
        this.onScreen = function () {
            return (x < WIDTH*2 
                    && x > -WIDTH
                    && y < HEIGHT
                    && y > 0);
        };
        
        /* Returns x-position of flake projected onto a grid */
        this.grid_x = function(){
            return x - x % GRID_SIZE;
        };
        
        /* Returns y-position of flake projected onto a grid */
        this.grid_y = function(){
            return y - y % GRID_SIZE;
        };
        
        return this;
    };
};