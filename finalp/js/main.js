
// ZACHARY HAMM

// Ideally, we like to avoid global vars, a GL context lives as long as the window does
// So this is a case where it is understandable to have it in global space.
var gl = null;
// The rest is here simply because it made debugging easier...
var normalShader = null;
var myDrawable = null;
var myDrawableInitialized = null;
var modelViewMatrix = null;
var projectionMatrix = null;
var globalTime = 0.0;
var parsedData = null;
var drawables = [];
var cameraPos = [0.0, 0.0, 4.0];
var lightPos = [0.0, 0.0, 4.0];

var cameraFocus = [0.0, 0.0, 0.0];

let fogColor = [0.7, 0.7, 0.7];


function main() {
  const canvas = document.getElementById('glCanvas');
  // Initialize the GL context
  gl = canvas.getContext('webgl2');

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert('Unable to initialize WebGL2. Contact the TA.');
    return;
  }

  // Set clear color to whatever color this is and fully opaque
  gl.clearColor(0.6, 0.7, 0.9, 1.0);
  // Clear the depth buffer
  gl.clearDepth(1.0);
  // Enable the depth function to draw nearer things over farther things
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.DEPTH_TEST);

  // Draw the scene repeatedly
  let then = 0.0;
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const FOV = degreesToRadians(60);
  const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar  = 100.0;
  projectionMatrix = glMatrix.mat4.create();
  glMatrix.mat4.perspective(projectionMatrix,
                   FOV,
                   aspectRatio,
                   zNear,
                   zFar);

  // Setup Controls
  setupUI();

  setupScene();
}

function setupUI() {
  // in index.html we need to setup some callback functions for the sliders
  // right now just have them report the values beside the slider.
  let sliders = ['cam', 'look'];
  let dims = ['X', 'Y', 'Z'];
  // for cam and look UI..
  sliders.forEach(controlType => {
    // for x, y, z control slider...
    dims.forEach(dimension => {
      let slideID = `${controlType}${dimension}`;
      console.log(`Setting up control for ${slideID}`);
      let slider = document.getElementById(slideID);
      let sliderVal = document.getElementById(`${slideID}Val`);
      // These are called "callback functions", essentially when the input
      // value for the slider or the field beside the slider change,
      // run the code we supply here!
      slider.oninput = () => {
        let newVal = slider.value;
        sliderVal.value = newVal;
      };
      sliderVal.oninput = () => {
        let newVal = sliderVal.value;
        slider.value = newVal;
      };
    });
  });
}

// Async as it loads resources over the network.
async function setupScene() {
  // Object Data
  let cubeObjData = await loadNetworkResourceAsText('resources/models/cube.obj');
  let sphereObjData = await loadNetworkResourceAsText('resources/models/sphere.obj');
  let bunnyObjData = await loadNetworkResourceAsText('resources/models/bunny.obj');
  let platformObjData = await loadNetworkResourceAsText('resources/models/platform.obj');
  // Frag and Vert Shaders
  let normalVertSource = await loadNetworkResourceAsText('resources/shaders/verts/normal.vert');
  let normalFragSource = await loadNetworkResourceAsText('resources/shaders/frags/normal.frag');

  let rainbowVertSource = await loadNetworkResourceAsText('resources/shaders/verts/rainbow.vert');
  let rainbowFragSource = await loadNetworkResourceAsText('resources/shaders/frags/rainbow.frag');

  let sphereVertSource = await loadNetworkResourceAsText('resources/shaders/verts/cubemap.vert');
  let sphereFragSource = await loadNetworkResourceAsText('resources/shaders/frags/cubemap.frag');

  let platformVertSource = await loadNetworkResourceAsText('resources/shaders/verts/platform.vert');
  let platformFragSource = await loadNetworkResourceAsText('resources/shaders/frags/platform.frag');

  // Object Positions and Sides
  let cubePosition = [10.0, 6.0, -25.0];
  let bunnyPosition = [5.0, -1.0, -15.0];
  let spherePosition = [0.0, 8.0, 5.0];
  let platformPosition = [5.0, -1.0, -5.0];
  let newPosition = [0.0, 0.0, 0.0];
  let type = 0;
  let type1 = 1;

  let cubeScale = [10.0, 10.0, 10.0];
  let bunnyScale = [80.0, 80.0, 80.0];
  let sphereScale = [0.4, 0.4, 0.4];
  let platformScale = [200.0, 2.0, 200.0];
  let newScale = [5.0, 5.0, 5.0];


  platformShader = new ShaderProgram(platformVertSource, platformFragSource);
  normalShader = new ShaderProgram(normalVertSource, normalFragSource);
  rainbowShader = new ShaderProgram(rainbowVertSource, rainbowFragSource);
  sphereShader = new ShaderProgram(sphereVertSource, sphereFragSource);

  initializeMyCube(cubeObjData, cubePosition, cubeScale, normalShader);
  initializeMyPlatform(platformObjData, platformPosition, platformScale, platformShader);
  initializeMySphere(sphereObjData, spherePosition, sphereScale, sphereShader);
  initializeMyBunny(bunnyObjData, bunnyPosition, bunnyScale, rainbowShader);

}

function drawScene(deltaTime) {
  globalTime += deltaTime;

  // Get camera position and focus from HTML form inputs
  let camPosX = parseFloat(document.getElementById('camXVal').value);
  let camPosY = parseFloat(document.getElementById('camYVal').value);
  let camPosZ = parseFloat(document.getElementById('camZVal').value);
  let lookAtX = parseFloat(document.getElementById('lookXVal').value);
  let lookAtY = parseFloat(document.getElementById('lookYVal').value);
  let lookAtZ = parseFloat(document.getElementById('lookZVal').value);

  cameraPos = [camPosX, camPosY, camPosZ];
  cameraFocus = [lookAtX, lookAtY, lookAtZ];
  
  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let modelMatrix = glMatrix.mat4.create();
  let objectWorldPos = [0.0, 0.0, -8.0]; // or any other position you want
  let rotationAxis = [1.0, 1.0, 0.0];
  glMatrix.mat4.translate(modelMatrix, modelMatrix, objectWorldPos);
  glMatrix.mat4.rotate(modelMatrix,
                       modelMatrix,
                       globalTime,
                       rotationAxis
                      );

  let viewMatrix = glMatrix.mat4.create();
  glMatrix.mat4.lookAt(viewMatrix,
                       cameraPos,
                       cameraFocus,
                       [0.0, 1.0, 0.0]
                      );

  let modelViewMatrix = glMatrix.mat4.create();
  glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
  if (myDrawableInitialized){

    drawables.forEach(drawable => {
      if (drawable) {
        drawable.draw();
      }
    });
  }
}
async function initializeMySphere(objData, position, scale, shader) {

  parsedData = new OBJData(objData);


  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexArrayData(rawData.vertices, gl.FLOAT, 3);
  let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
  let textureCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);

  let bufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aVertexNormal': vertexNormalBuffer,
    'aTextureCoord': textureCoordBuffer,
  };

  const facestwo = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: '../resources/skybox/right.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: '../resources/skybox/left.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: '../resources/skybox/top.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: '../resources/skybox/bottom.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: '../resources/skybox/front.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: '../resources/skybox/back.jpg' },
  ];
    
  const cm_texture = await createCubeMapTexture(facestwo);


  let drawable = new Drawable(shader, bufferMap, null, rawData.vertices.length / 3);

    drawable.uniformLocations = shader.getUniformLocations([
      'uModelViewMatrix',
      'uProjectionMatrix',
      'uNormalMatrix',
      'uLightPosition',
      'uLightColor',
      'uAmbientColor',
      'uShininess', 
      'uCubeMap',
    ]);
    
    drawable.uniformSetup = () => {
  
      gl.uniformMatrix4fv(
        drawable.uniformLocations.uProjectionMatrix,
        false,
        projectionMatrix
      );
  
      let modelMatrix = glMatrix.mat4.create();
      
      glMatrix.mat4.translate(modelMatrix, modelMatrix, position);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, scale);
      //glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime, [1.0, 0.0, 0.0]);
  
      let viewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.lookAt(viewMatrix,
                             cameraPos,
                             cameraFocus,
                             [0.0, 1.0, 0.0]
                            );
      let modelViewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
      gl.uniformMatrix4fv(drawable.uniformLocations.uModelViewMatrix, false, modelViewMatrix);
  
      // handles the lighting calculations
      let normalMatrix = glMatrix.mat3.create();
      let lightingMatrix = glMatrix.mat3.create();
      glMatrix.mat3.fromMat4(lightingMatrix, modelViewMatrix);
      glMatrix.mat3.invert(normalMatrix, lightingMatrix);
      glMatrix.mat3.transpose(normalMatrix, normalMatrix);
  
  
      // lighting 
      gl.uniform3fv(drawable.uniformLocations.uLightPosition, cameraPos);
      gl.uniform3fv(drawable.uniformLocations.uAmbientColor, [0.4, 0.4, 0.4]);

      
      gl.uniformMatrix3fv(drawable.uniformLocations.uNormalMatrix, false, normalMatrix);
  
      gl.uniform1f(drawable.uniformLocations.uShininess, 32.0);
      gl.uniform1i(drawable.uniformLocations.uCubeMap, 1);
  
    };
  

  drawables.push(drawable);


  myDrawableInitialized = true;
}
async function initializeMySkybox(objData, position, scale, shader) {

  parsedData = new OBJData(objData);


  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexArrayData(rawData.vertices, gl.FLOAT, 3);
  let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
  let textureCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);

  let bufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aVertexNormal': vertexNormalBuffer,
    'aTextureCoord': textureCoordBuffer,
  };

  const faces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: '../resources/coit_tower/posx.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: '../resources/coit_tower/negx.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: '../resources/coit_tower/posy.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: '../resources/coit_tower/negy.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: '../resources/coit_tower/posz.jpg' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: '../resources/coit_tower/negz.jpg' },
  ];

 
  const cm_texture = await createCubeMapTexture(faces);


  let drawable = new Drawable(shader, bufferMap, null, rawData.vertices.length / 3);

    drawable.uniformLocations = shader.getUniformLocations([
      'uModelViewMatrix',
      'uProjectionMatrix',
      'uNormalMatrix',
      'uLightPosition',
      'uLightColor',
      'uAmbientColor',
      'uShininess', 
      'uCubeMap',
    ]);
    
    drawable.uniformSetup = () => {
  
      gl.uniformMatrix4fv(
        drawable.uniformLocations.uProjectionMatrix,
        false,
        projectionMatrix
      );
  
      let modelMatrix = glMatrix.mat4.create();
      
      glMatrix.mat4.translate(modelMatrix, modelMatrix, position);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, scale);
      //glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime, [1.0, 0.0, 0.0]);
  
      let viewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.lookAt(viewMatrix,
                             cameraPos,
                             cameraFocus,
                             [0.0, 1.0, 0.0]
                            );
      let modelViewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
      gl.uniformMatrix4fv(drawable.uniformLocations.uModelViewMatrix, false, modelViewMatrix);
  
      // handles the lighting calculations
      let normalMatrix = glMatrix.mat3.create();
      let lightingMatrix = glMatrix.mat3.create();
      glMatrix.mat3.fromMat4(lightingMatrix, modelViewMatrix);
      glMatrix.mat3.invert(normalMatrix, lightingMatrix);
      glMatrix.mat3.transpose(normalMatrix, normalMatrix);
  
  
      // lighting 
      gl.uniform3fv(drawable.uniformLocations.uLightPosition, cameraPos);
      gl.uniform3fv(drawable.uniformLocations.uAmbientColor, [0.4, 0.4, 0.4]);

      
      gl.uniformMatrix3fv(drawable.uniformLocations.uNormalMatrix, false, normalMatrix);
  
      gl.uniform1f(drawable.uniformLocations.uShininess, 32.0);
      gl.uniform1i(drawable.uniformLocations.uCubeMap, 1);
  
    };
  

  drawables.push(drawable);


  myDrawableInitialized = true;
}

async function initializeMyCube(objData, position, scale, shader) {

  parsedData = new OBJData(objData);


  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexArrayData(rawData.vertices, gl.FLOAT, 3);
  let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
  let textureCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);
  let vertexTangentBuffer = new VertexArrayData(rawData.tangents, gl.FLOAT, 3);
  let vertexBitangentBuffer = new VertexArrayData(rawData.bitangents, gl.FLOAT, 3);

  let bufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aVertexNormal': vertexNormalBuffer,
    'aTextureCoord': textureCoordBuffer,
    'aVertexTangent': vertexTangentBuffer,
    'aVertexBitangent': vertexBitangentBuffer,
  };

  let drawable = new Drawable(shader, bufferMap, null, rawData.vertices.length / 3);

    const texture = gl.createTexture();
    const image = new Image();
    image.src = '../resources/images/toy_box_assets/toy_box_normal.png'; // set image source
    
    if (texture && image) {
      image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.activeTexture(gl.TEXTURE1);
      };
    }

    drawable.uniformLocations = shader.getUniformLocations([
      'uModelViewMatrix',
      'uProjectionMatrix',
      'uNormalMatrix',
      'uNormalMap',
      'uLightDirection',
      'uLightColor',
      'uAmbientColor',
      'uTBN',
    ]);
  
    drawable.uniformSetup = () => {

      gl.uniformMatrix4fv(
        drawable.uniformLocations.uProjectionMatrix,
        false,
        projectionMatrix
      );

      let modelMatrix = glMatrix.mat4.create();
    
      glMatrix.mat4.translate(modelMatrix, modelMatrix, position);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, scale);
      //glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime, [0.0, 1.0, 0.0]);
  
      let viewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.lookAt(viewMatrix, cameraPos, cameraFocus, [0.0, 1.0, 0.0]);
      let modelViewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
      gl.uniformMatrix4fv(drawable.uniformLocations.uModelViewMatrix, false, modelViewMatrix);
  
      // handles the lighting calculations
      let normalMatrix = glMatrix.mat3.create();
      let lightingMatrix = glMatrix.mat3.create();
      glMatrix.mat3.fromMat4(lightingMatrix, modelViewMatrix);
      glMatrix.mat3.invert(normalMatrix, lightingMatrix);
      glMatrix.mat3.transpose(normalMatrix, normalMatrix);

        // normal map texture setup
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(drawable.uniformLocations.uNormalMap, 1); 
      // tangent and bitangent and normal setup (tbn)
      const tangent = glMatrix.vec3.create();
      glMatrix.vec3.normalize(tangent, rawData.tangents.slice(0, 3));

      const bitangent = glMatrix.vec3.create();
      glMatrix.vec3.normalize(bitangent, rawData.bitangents.slice(0, 3));

      const normal = glMatrix.vec3.create();
      glMatrix.vec3.normalize(normal, rawData.normals.slice(0, 3));

      const tbn = glMatrix.mat3.fromValues(tangent[0], bitangent[0], normal[0],
                                            tangent[1], bitangent[1], normal[1],
                                            tangent[2], bitangent[2], normal[2]);
      //console.log(tbn);
      gl.uniformMatrix3fv(drawable.uniformLocations.uTBN, false, tbn);
    
      // lighting 
      gl.uniform3fv(drawable.uniformLocations.uLightDirection, cameraPos);
      gl.uniform3fv(drawable.uniformLocations.uAmbientColor, [0.8, 0.8, 0.8]);
      gl.uniform3fv(drawable.uniformLocations.uLightColor, [1.0, 1.0, 1.0]);

    };
  
  drawables.push(drawable);


  myDrawableInitialized = true;
}

async function initializeMyBunny(objData, position, scale, shader) {

  parsedData = new OBJData(objData);


  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexArrayData(rawData.vertices, gl.FLOAT, 3);
  let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
  let textureCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);
  let vertexTangentBuffer = new VertexArrayData(rawData.tangents, gl.FLOAT, 3);
  let vertexBitangentBuffer = new VertexArrayData(rawData.bitangents, gl.FLOAT, 3);

  let bufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aVertexNormal': vertexNormalBuffer,
    'aTextureCoord': textureCoordBuffer,
    'aVertexTangent': vertexTangentBuffer,
    'aVertexBitangent': vertexBitangentBuffer,
  };

  let drawable = new Drawable(shader, bufferMap, null, rawData.vertices.length / 3);

// BUNNY (Rainbow)
    drawable.uniformLocations = shader.getUniformLocations([
      'uModelViewMatrix',
      'uProjectionMatrix',
      'uNormalMatrix',
      'uTime', 
    ]);
  
    drawable.uniformSetup = () => {
      
      gl.uniformMatrix4fv(
        drawable.uniformLocations.uProjectionMatrix,
        false,
        projectionMatrix
      );
      let modelMatrix = glMatrix.mat4.create();

        glMatrix.mat4.translate(modelMatrix, modelMatrix, position); // translate the first sphere to the left
        glMatrix.mat4.scale(modelMatrix, modelMatrix, scale);
        // glMatrix.mat4.rotate(modelMatrix, modelMatrix, globalTime, [0.0, 1.0, 0.0])

      let viewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.lookAt(viewMatrix,
                           cameraPos,
                           cameraFocus,
                           [0.0, 1.0, 0.0]
                          );
      let modelViewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
      gl.uniformMatrix4fv(drawable.uniformLocations.uModelViewMatrix, false, modelViewMatrix);

      let time = performance.now() * 0.001; // Convert time to seconds
      gl.uniform1f(drawable.uniformLocations.uTime, time); 
      
    };  
  
  drawables.push(drawable);


  myDrawableInitialized = true;
}

async function initializeMyPlatform(objData, position, scale, shader) {

  
  parsedData = new OBJData(objData);


  let rawData = parsedData.getFlattenedDataFromModelAtIndex(0);

  let vertexPositionBuffer = new VertexArrayData(rawData.vertices, gl.FLOAT, 3);
  let vertexNormalBuffer = new VertexArrayData(rawData.normals, gl.FLOAT, 3);
  let textureCoordBuffer = new VertexArrayData(rawData.uvs, gl.FLOAT, 2);
  let vertexTangentBuffer = new VertexArrayData(rawData.tangents, gl.FLOAT, 3);
  let vertexBitangentBuffer = new VertexArrayData(rawData.bitangents, gl.FLOAT, 3);

  let bufferMap = {
    'aVertexPosition': vertexPositionBuffer,
    'aVertexNormal': vertexNormalBuffer,
    'aTextureCoord': textureCoordBuffer,
    'aVertexTangent': vertexTangentBuffer,
    'aVertexBitangent': vertexBitangentBuffer,
  };

  let drawable = new Drawable(shader, bufferMap, null, rawData.vertices.length / 3);

    drawable.uniformLocations = shader.getUniformLocations([
      'model',
      'view',
      'projection',
      'lightPosition',
      'lightColor'
    ]);
    
    drawable.uniformSetup = () => {
      // Set the projection, model, and view matrices
      gl.uniformMatrix4fv(drawable.uniformLocations.projection, false, projectionMatrix);
      let modelMatrix = glMatrix.mat4.create();
      glMatrix.mat4.translate(modelMatrix, modelMatrix, position);
      glMatrix.mat4.scale(modelMatrix, modelMatrix, scale);
      gl.uniformMatrix4fv(drawable.uniformLocations.model, false, modelMatrix);

      let viewMatrix = glMatrix.mat4.create();
      glMatrix.mat4.lookAt(viewMatrix,
                           cameraPos,
                           cameraFocus,
                           [0.0, 1.0, 0.0]
                          );
      gl.uniformMatrix4fv(drawable.uniformLocations.view, false, viewMatrix);

      // Set the light position and light color
      gl.uniform3fv(drawable.uniformLocations.lightPosition, cameraPos);
      gl.uniform3fv(drawable.uniformLocations.lightColor, [1.0, 1.0, 1.0]);
    };

    

    drawables.push(drawable);


  myDrawableInitialized = true;
}

function loadTextureImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = src;
    image.onload = () => resolve(image);
  });
}

async function createCubeMapTexture(faces) {
  const cm_texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cm_texture);

  const loadedImages = await Promise.all(faces.map(face => loadTextureImage(face.src)));

  loadedImages.forEach((image, index) => {
    const target = faces[index].target;
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cm_texture);
    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  });

  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

  return cm_texture;
}



// After all the DOM has loaded, we can run the main function.
window.onload = main;