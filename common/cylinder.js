var cylinder_points = [];
var cylinder_normals = [];
var cylinder_faces = [];
var cylinder_edges = [];

var cylinder_points_buffer;
var cylinder_normals_buffer;
var cylinder_faces_buffer;
var cylinder_edges_buffer;

var CYLINDER_N = 20;

function cylinderAddEdge(a, b, c, d) {
	cylinder_edges.push(a);
	cylinder_edges.push(0);

	cylinder_edges.push(b);
	cylinder_edges.push(CYLINDER_N + 1);

	cylinder_edges.push(a);
	cylinder_edges.push(b);

	cylinder_edges.push(a);
	cylinder_edges.push(c);

	cylinder_edges.push(b);
	cylinder_edges.push(d);
}

function cylinderAddFace(a, b, c, d) {
	cylinder_faces.push(a);
	cylinder_faces.push(c);
	cylinder_faces.push(b);

	cylinder_faces.push(b);
	cylinder_faces.push(c);
	cylinder_faces.push(d);
}

function cylinderAddTriangle(a, b, c) {
	cylinder_faces.push(a);
	cylinder_faces.push(b);
	cylinder_faces.push(c);
}

function cylinderBuild() {
	cylinderBuildVertices();
	cylinderBuildFaces();
	cylinderBuildEdges();
}

function cylinderBuildCircle(offset, dir) {
	var o = 0;

	for (var i = 1; i < CYLINDER_N; i++) {
		o = offset + i;
		
		cylinderAddTriangle(offset, dir? o : o+1, dir ? o + 1 : o);
	}

	cylinderAddTriangle(offset, dir? o + 1: offset+1, dir? offset + 1: o+1);
}

function cylinderBuildEdges() {
	var offset = 2 * (CYLINDER_N + 1);
	var o = 0;
	
	for (var i = 0; i < CYLINDER_N - 1; i++) {
		o = offset + i * 2;
		
		cylinderAddEdge(o, o + 1, o + 2, o + 3);
	}

	cylinderAddEdge(o + 2, o + 3, offset, offset + 1);
}

function cylinderBuildFaces() {
	cylinderBuildCircle(0, false);
	cylinderBuildCircle(CYLINDER_N + 1, true);
	cylinderBuildSurface(2 * (CYLINDER_N + 1));
}

function cylinderBuildSurface(offset) {
	var o = 0;

	for (var i = 0; i < CYLINDER_N - 1; i++) {
		o = offset + i * 2;

		cylinderAddFace(o, o + 1, o + 2, o + 3);
	}

	cylinderAddFace(o + 2, o + 3, offset, offset + 1);
}

function cylinderBuildVertices() {
	var top = [];
	var bottom = [];
	var middle = [];

	var top_normals = [];
	var bottom_normals = [];
	var middle_normals = [];
	
	var up = vec3(0, 1, 0);
	var down = vec3(0, -1, 0);
	
	top.push(vec3(0, 0.5, 0));
    bottom.push(vec3(0, -0.5, 0));	

	top_normals.push(up);
	bottom_normals.push(down);

	var segment = Math.PI * 2 / CYLINDER_N;
    	
	for (var i = 1; i <= CYLINDER_N; i++) {
		var x = Math.cos(i * segment) * 0.5;
		var z = Math.sin(i * segment) * 0.5;
        
		top.push(vec3(x, 0.5, z));
		bottom.push(vec3(x, -0.5, z));
		middle.push(vec3(x, 0.5, z));
		middle.push(vec3(x, -0.5, z));
		
		var normal = normalize(vec3(x, 0, z));

		top_normals.push(up);
		bottom_normals.push(down);
		middle_normals.push(normal);
		middle_normals.push(normal);
	}
    
	cylinder_points = top.concat(bottom).concat(middle)
	cylinder_normals = top_normals.concat(bottom_normals).concat(middle_normals)
}

function cylinderDrawFilled(gl, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_faces_buffer);
    gl.drawElements(gl.TRIANGLES, cylinder_faces.length, gl.UNSIGNED_SHORT, 0);
}

function cylinderDrawWireFrame(gl, program) { 
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_edges_buffer);
    gl.drawElements(gl.LINES, cylinder_edges.length, gl.UNSIGNED_SHORT, 0);   
}

function cylinderInit(gl) {
	cylinderBuild();
	cylinderUploadData(gl);
}

function cylinderUploadData(gl) {
    cylinder_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cylinder_points), gl.STATIC_DRAW);    
    
    cylinder_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cylinder_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cylinder_normals), gl.STATIC_DRAW);
    
    cylinder_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder_faces), gl.STATIC_DRAW);
    
    cylinder_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cylinder_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cylinder_edges), gl.STATIC_DRAW);
}

