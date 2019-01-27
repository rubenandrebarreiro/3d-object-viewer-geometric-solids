quadPyramid_vertices = [
    vec3(-0.5, -0.5, +0.5),  // 0
    vec3(+0.5, -0.5, +0.5),  // 1
    vec3(+0.5, -0.5, -0.5),  // 2
    vec3(-0.5, -0.5, -0.5),  // 3
    vec3(+0.0, +0.5, +0.0)   // 4 
];

var quadPyramid_points = [];
var quadPyramid_normals = [];
var quadPyramid_faces = [];
var quadPyramid_edges = [];

var quadPyramid_points_buffer;
var quadPyramid_normals_buffer;
var quadPyramid_faces_buffer;
var quadPyramid_edges_buffer;


// INIT

function quadPyramidInit(gl) {
	quadPyramidBuild();
	quadPyramidUploadData(gl);
}

function quadPyramidBuild()
{
    var v = Math.sqrt(2)/2;
    
    quadPyramidAddFace(0, 1, 2, 3, vec3(0, -1, 0));
    quadPyramidAddFace(0, 4, 3, vec3(-v, +v, 0));   // left
    quadPyramidAddFace(3, 4, 2, vec3(0, +v, -v));   // back
    quadPyramidAddFace(2, 4, 1, vec3(+v, +v, 0));   // right
    quadPyramidAddFace(1, 4, 0, vec3(0, +v, +v));   // front
}

function quadPyramidUploadData(gl)
{
	quadPyramid_points_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_points_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(quadPyramid_points), gl.STATIC_DRAW);

	quadPyramid_normals_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_normals_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(quadPyramid_normals), gl.STATIC_DRAW);

	quadPyramid_faces_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadPyramid_faces_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(quadPyramid_faces), gl.STATIC_DRAW);

	quadPyramid_edges_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadPyramid_edges_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(quadPyramid_edges), gl.STATIC_DRAW);
}

function quadPyramidAddFace()
{
	var offset = quadPyramid_points.length;
    
    var normal = arguments[arguments.length-1]; 
    
    var v;
    for (var i = 0; i < arguments.length-1; i++) {
        v = arguments[i];
        quadPyramid_points.push(quadPyramid_vertices[v]);
        quadPyramid_normals.push(normal);
    }
		
	// Add triangular face (a,b,c)
	quadPyramid_faces.push(offset);
	quadPyramid_faces.push(offset+1);
	quadPyramid_faces.push(offset+2);
    
    if (arguments.length > 4) // Quadrangular face (base)
    {   
        // Add another triangular face (a,c,d)
	   quadPyramid_faces.push(offset);
	   quadPyramid_faces.push(offset+2);
	   quadPyramid_faces.push(offset+3);
    }
    else  // Only triangular faces define edges
    { 
        // Add first edge (a,b)
	   quadPyramid_edges.push(offset);
	   quadPyramid_edges.push(offset+1);  
        
        // Add second edge (a,c)
	   quadPyramid_edges.push(offset);
	   quadPyramid_edges.push(offset+2);  
    }
}

// DRAW

function quadPyramidDrawWireFrame(gl, program)
{
	gl.useProgram(program);

	gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_points_buffer);
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_normals_buffer);
	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadPyramid_edges_buffer);
    gl.drawElements(gl.LINES, quadPyramid_edges.length, gl.UNSIGNED_BYTE, 0);
}

function quadPyramidDrawFilled(gl, program) {
    gl.useProgram(program);

	gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_points_buffer);
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, quadPyramid_normals_buffer);
	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);
        
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadPyramid_faces_buffer);
    gl.drawElements(gl.TRIANGLES, quadPyramid_faces.length, gl.UNSIGNED_BYTE, 0);
}