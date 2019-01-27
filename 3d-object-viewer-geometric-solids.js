// FCT NOVA | FCT-UNL (Faculty of Sciences and Technology of New University of Lisbon)
// Integrated Master (BSc./MSc.) of Computer Engineering

// Computer Graphics and Interfaces (2016-2017)

// Lab Work 2 - 3D Object Viewer - Geometric Solids

// Daniel Filipe Pimenta - no. 45404 - d.pimenta@campus.fct.unl.pt
// Ruben André Barreiro - no. 42648 - r.barreiro@campus.fct.unl.pt

var canvas;
var program;

var mModelView;
var mNormals;
var mProjection;

var mModelViewLoc;
var mNormalsLoc;
var mProjectionLoc;
var redFactorLoc;
var greenFactorLoc;
var blueFactorLoc;

var zBufferElem, backFaceCullingElem;

var zBufferInUse = true;

window.onload = function init() {
    // Get the canvas
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Initial Visibility Depth Control In Use
    zBufferInUse = true;
    backFaceCullingInUse = true;
    var zBufferControl = document.getElementById('zBuffer');
    zBufferControl.checked = true;
    gl.enable(gl.DEPTH_TEST);

    var backFaceCullingControl = document.getElementById('backFaceCulling');
    backFaceCullingControl.checked = true;
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Setup the contexts and the program
    program = initShaders(gl, "vertex-shader-1", "fragment-shader-1");
    gl.useProgram(program);

    // Get uniform locations
    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    redFactorLoc = gl.getUniformLocation(program, "red");
    greenFactorLoc = gl.getUniformLocation(program, "green");
    blueFactorLoc = gl.getUniformLocation(program, "blue");

    // Initialize objects
    cubeInit(gl);
    sphereInit(gl);
    quadPyramidInit(gl);
    torusInit(gl);
    coneInit(gl);
    cylinderInit(gl);

    // Set event listeners
    handleWindowResize();
    handleWireChange();
    handleProjectionChange();
    handleColorFactor();

    zBufferElem = document.getElementById("zBuffer");
    backFaceCullingElem = document.getElementById("backFaceCulling");

    zBufferElem.addEventListener("input", handleZBufferChange);
    backFaceCullingElem.addEventListener("input", handleBackFaceCullingChange);

    document.getElementById("vertex").onchange = load_file;
    document.getElementById("fragment").onchange = load_file;
    document.getElementById("loadBtn").onclick = function() { load_shaders(2); };  // wrapped on anonymous function to avoid onload call
    document.getElementById("unloadBtn").onclick = function() { load_shaders(1) };

    // Initialize matrices (mProjection initialized on windowResize event)
    mModelView = mat4();
    mNormals = transpose(inverse(mModelView));

    render();
}

// Set mProjection according to aspect ratio
function handleWindowResize()
{
    window.onresize = function()  {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        aspect = canvas.width / canvas.height;

        if (aspect > 1)
            mProjection = ortho(-aspect, aspect, -1, 1, -1, 1);
        else
            mProjection = ortho(-1, 1, -1/aspect, 1/aspect, -1, 1);
    };
    window.onresize();
}

function handleWireChange()
{
    var wire = document.getElementById("wireDraw");
    wire.onchange = function() {
        var v = wire.checked ? 1.0 : 0.0;
        gl.uniform1f(redFactorLoc, document.getElementById("redFactor").value = v);
        gl.uniform1f(greenFactorLoc, document.getElementById("greenFactor").value = v);
        gl.uniform1f(blueFactorLoc, document.getElementById("blueFactor").value = v);
    };
}

function handleZBufferChange(e) {
    if(this.checked) {
        zBufferInUse = true;
        gl.enable(gl.DEPTH_TEST);
    }
    else {
        zBufferInUse = false;
        gl.disable(gl.DEPTH_TEST);
    }
}

function handleBackFaceCullingChange(e) {
    if(this.checked) {
        backFaceCullingInUse = true;
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }
    else {
        backFaceCullingInUse = false;
        gl.disable(gl.CULL_FACE);
    }
}


function handleProjectionChange()
{
    var projection = document.getElementById("prj");
    projection.onchange = function() {
        for (var i = 0; i < projection.options.length; i++) {
            var id = projection.options[i].text.toLowerCase()+"Prj";
            document.getElementById(id).hidden = (i != projection.selectedIndex);
        }
    }
    projection.onchange();
}

function handleColorFactor() {
    var redFactor = document.getElementById("redFactor");
    redFactor.oninput = function() {
        gl.uniform1f(redFactorLoc, redFactor.value);
    }
    redFactor.oninput();

    var greenFactor = document.getElementById("greenFactor");
    greenFactor.oninput = function() {
        gl.uniform1f(greenFactorLoc, greenFactor.value);
    }
    greenFactor.oninput();

    var blueFactor = document.getElementById("blueFactor");
    blueFactor.oninput = function() {
        gl.uniform1f(blueFactorLoc, blueFactor.value);
    }
    blueFactor.oninput();
}


function drawObject()
{
    var wired = document.getElementById("wireDraw").checked;
    switch (document.getElementById("obj").selectedIndex) {
        case 0:
            if (wired)
                 cubeDrawWireFrame(gl, program);
            else cubeDrawFilled(gl, program);
            break;
        case 1:
            if (wired)
                 sphereDrawWireFrame(gl, program);
            else sphereDrawFilled(gl, program);
            break;
        case 2:
            if (wired)
                 quadPyramidDrawWireFrame(gl, program);
            else quadPyramidDrawFilled(gl, program);
            break;
        case 3:
            if (wired)
                 torusDrawWireFrame(gl, program);
            else torusDrawFilled(gl, program);
            break;
        case 4:
            if (wired)
                 coneDrawWireFrame(gl, program);
            else coneDrawFilled(gl, program);
            break;
        case 5:
            if (wired)
                 cylinderDrawWireFrame(gl, program);
            else cylinderDrawFilled(gl, program);
            break;
        default:
            break;
    }
}

function render()
{
    if(zBufferInUse) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    else {
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

    var ViewEnum = {
        TOP   : { name: "Top"  , position: {x: 0,              y: 0              } },
        OTHER : { name: "Other", position: {x: canvas.width/2, y: 0              } },
        FRONT : { name: "Front", position: {x: 0,              y: canvas.height/2} },
        SIDE  : { name: "Side" , position: {x: canvas.width/2, y: canvas.height/2} }
    };

    for (view in ViewEnum) {
        var v = ViewEnum[view];
        gl.viewport(v.position.x, v.position.y, canvas.width/2, canvas.height/2);
        setMatrices(v);
        gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
        gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
        drawObject();
    }

    window.requestAnimationFrame(render);
}


function setMatrices(view)
{
    switch (view.name.toLowerCase()) {
        case 'top':
            mModelView = rotateX(90);
            break;
        case 'other':
            switch (document.getElementById("prj").selectedIndex) {
                case 0:
                    mModelView = mOblique();
                    mNormals = mat4();
                    break;
                case 1:
                    mModelView = mAxonometric();
                    mNormals = transpose(inverse(mModelView));
                    break;
                case 2:
                    mModelView = mPerspective();
                    mNormals = mat4();
                    break;
                default:
                    break;
            }
            break;
        case 'front':
            mModelView = mat4();
            break;
        case 'side':
            mModelView = rotateY(90);
            break;
        default:
            break;
    }
}

function mOblique()
{
    var l = document.getElementById("fRatio").value;
    var a = document.getElementById("oblAngle").value * (Math.PI / 180);

    return mat4(
        vec4( 1.0, 0.0, -l*Math.cos(a), 0.0 ),
        vec4( 0.0, 1.0, -l*Math.sin(a), 0.0 ),
        vec4( 0.0, 0.0,       1.0,      0.0 ),
        vec4( 0.0, 0.0,       0.0,      1.0 )
    );
}

function mAxonometric()
{
    var gamma = document.getElementById("axoGamma").value;
    var theta = document.getElementById("axoTheta").value;

    return mult(rotateX(gamma), rotateY(theta));
}

function mPerspective()
{
    var d = document.getElementById("persPoint").value;

    return mat4(
        vec4( 1.0, 0.0,  0.0, 0.0 ),
        vec4( 0.0, 1.0,  0.0, 0.0 ),
        vec4( 0.0, 0.0,  1.0, 0.0 ),
        vec4( 0.0, 0.0, -1/d, 1.0 )
    );
}

function load_file()
{
    var selectedFile = this.files[0];
    var reader = new FileReader();
    var id = this.id + "-shader-2";
    reader.onload = (function(f) {
        return function(e) {
            document.getElementById(id).textContent = e.target.result;
        }
    })(selectedFile);
    reader.readAsText(selectedFile);
}

function load_shaders(n)
{
    var t1 = document.getElementById("vertex-shader-"+n).textContent;
    var t2 = document.getElementById("fragment-shader-"+n).textContent;
    if (t1 != "" && t2 != "") {
        document.getElementById("colors").hidden = (n > 1 && prg != -1);
        var prg = initShaders(gl, "vertex-shader-"+n, "fragment-shader-"+n);
        set_program(prg);
    }
}

function set_program(prg)
{
    mModelViewLoc = gl.getUniformLocation(prg, "mModelView");
    mNormalsLoc = gl.getUniformLocation(prg, "mNormals");
    mProjectionLoc = gl.getUniformLocation(prg, "mProjection");
    redFactorLoc = gl.getUniformLocation(prg, "red");
    greenFactorLoc = gl.getUniformLocation(prg, "green");
    blueFactorLoc = gl.getUniformLocation(prg, "blue");

    program = prg;
    gl.useProgram(program);

    if (!document.getElementById("colors").hidden) {
        gl.uniform1f(redFactorLoc, document.getElementById("redFactor").value);
        gl.uniform1f(greenFactorLoc, document.getElementById("greenFactor").value);
        gl.uniform1f(blueFactorLoc, document.getElementById("blueFactor").value);
    }
}
