cube_vertices = [
    vec3(-0.5, -0.5, +0.5),     // 0
    vec3(+0.5, -0.5, +0.5),     // 1
    vec3(+0.5, +0.5, +0.5),     // 2
    vec3(-0.5, +0.5, +0.5),     // 3
    vec3(-0.5, -0.5, -0.5),     // 4
    vec3(+0.5, -0.5, -0.5),     // 5
    vec3(+0.5, +0.5, -0.5),     // 6
    vec3(-0.5, +0.5, -0.5)      // 7
];

var cube_points = [];
var cube_normals = [];
var cube_faces = [];
var cube_edges = [];

var cube_points_buffer;
var cube_normals_buffer;
var cube_faces_buffer;
var cube_edges_buffer;

function cubeInit(gl) {
    cubeBuild();
    cubeUploadData(gl);
}

function cubeBuild()
{
    cubeAddFace(0,1,2,3,vec3(0,0,1));
    cubeAddFace(1,5,6,2,vec3(1,0,0));
    cubeAddFace(4,7,6,5,vec3(0,0,-1));
    cubeAddFace(0,3,7,4,vec3(-1,0,0));
    cubeAddFace(3,2,6,7,vec3(0,1,0));
    cubeAddFace(0,4,5,1,vec3(0,-1,0));    
}

function cubeUploadData(gl)
{
    cube_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube_points), gl.STATIC_DRAW);
    
    cube_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cube_normals), gl.STATIC_DRAW);
    
    cube_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cube_faces), gl.STATIC_DRAW);
    
    cube_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(cube_edges), gl.STATIC_DRAW);
}

function cubeDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_edges_buffer);
    gl.drawElements(gl.LINES, cube_edges.length, gl.UNSIGNED_BYTE, 0);
}

function cubeDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cube_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube_faces_buffer);
    gl.drawElements(gl.TRIANGLES, cube_faces.length, gl.UNSIGNED_BYTE, 0);
}

function cubeAddFace(a, b, c, d, n)
{
    var offset = cube_points.length;
    
    cube_points.push(cube_vertices[a]);
    cube_points.push(cube_vertices[b]);
    cube_points.push(cube_vertices[c]);
    cube_points.push(cube_vertices[d]);
    for(var i=0; i<4; i++)
        cube_normals.push(n);
    
    // Add 2 triangular faces (a,b,c) and (a,c,d)
    cube_faces.push(offset);
    cube_faces.push(offset+1);
    cube_faces.push(offset+2);
    
    cube_faces.push(offset);
    cube_faces.push(offset+2);
    cube_faces.push(offset+3);
    
    // Add first edge (a,b)
    cube_edges.push(offset);
    cube_edges.push(offset+1);
    
    // Add second edge (b,c)
    cube_edges.push(offset+1);
    cube_edges.push(offset+2);
}