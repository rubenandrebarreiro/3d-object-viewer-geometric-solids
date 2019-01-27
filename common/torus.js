var torus_points = [];
var torus_normals = [];
var torus_faces = [];
var torus_edges = [];

var torus_points_buffer;
var torus_normals_buffer;
var torus_faces_buffer;
var torus_edges_buffer;

var torus_PPD=20;
var torus_DISKS=20;
var torus_DISK_RADIUS = 0.2;
var torus_RADIUS = 0.5;

function torusInit(gl) {
    torusBuild(torus_PPD, torus_DISKS, torus_RADIUS, torus_DISK_RADIUS);
    torusUploadData(gl);
}
function torusGetIndex(d, p){
    diskOffset = d%torus_DISKS*torus_PPD;
    return diskOffset+(p%torus_PPD);
}

// Generate points using polar coordinates
function torusBuild() 
{ 
    var diskStep = 2*Math.PI/torus_DISKS;
    var pointStep = 2*Math.PI/torus_PPD;
    
    // Generate points
    for(var phi=0; phi<2*Math.PI; phi+=diskStep) {
        for(var theta=0; theta<2*Math.PI; theta+=pointStep) {
            // "em pé"
            /*var pt = vec3(
                (torus_RADIUS+torus_DISK_RADIUS*Math.cos(theta))*Math.cos(phi),
                (torus_RADIUS+torus_DISK_RADIUS*Math.cos(theta))*Math.sin(phi),
                torus_DISK_RADIUS*Math.sin(theta)
            );*/
            // "deitado"
            var pt = vec3(
                (torus_RADIUS+torus_DISK_RADIUS*Math.cos(theta))*Math.cos(phi),
                torus_DISK_RADIUS*Math.sin(theta),
                (torus_RADIUS+torus_DISK_RADIUS*Math.cos(theta))*Math.sin(phi)
            );
            torus_points.push(pt);
            // normal - "deitado"
            var normal = vec3(
                (torus_DISK_RADIUS*Math.cos(theta))*Math.cos(phi),
                torus_DISK_RADIUS*Math.sin(theta),
                (torus_DISK_RADIUS*Math.cos(theta))*Math.sin(phi)
            ); 
            torus_normals.push(normalize(normal));
        }
    }
    
    //Edges
    for(d=0; d<torus_DISKS; d++){
        for(p=0; p<torus_PPD; p++){
            //Edge from point to next point in disk
            torus_edges.push(torusGetIndex(d,p));
            torus_edges.push(torusGetIndex(d,p+1));
            
            //Edge from point to same point in next disk
            torus_edges.push(torusGetIndex(d,p));
            torus_edges.push(torusGetIndex(d+1,p));  

        }
    }
    
    //Faces
    for(d=0; d<torus_DISKS; d++){
        diskOffset = d*torus_PPD;
        for(p=0; p<torus_PPD; p++){
            torus_faces.push(torusGetIndex(d,p));
            torus_faces.push(torusGetIndex(d,p+1));
            torus_faces.push(torusGetIndex(d+1,p)); 
            
            torus_faces.push(torusGetIndex(d+1,p));
            torus_faces.push(torusGetIndex(d,p+1));
            torus_faces.push(torusGetIndex(d+1,p+1)); 
        }
    }
    
}

function torusUploadData(gl)
{
    torus_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_points), gl.STATIC_DRAW);
    
    torus_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_normals), gl.STATIC_DRAW);
    
    torus_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_faces), gl.STATIC_DRAW);
    
    torus_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_edges), gl.STATIC_DRAW);
}

function torusDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.drawElements(gl.LINES, torus_edges.length, gl.UNSIGNED_SHORT, 0);
}

function torusDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.drawElements(gl.TRIANGLES, torus_faces.length, gl.UNSIGNED_SHORT, 0);
}

