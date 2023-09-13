
class OBJData {
  constructor(fileContents) {
    this.fileContents = fileContents;
    this.parse(this.fileContents);
  }

  result = {
    models: [],
    materialLibraries: []
  };
  currentMaterial = '';
  currentGroup = '';
  smoothingGroup = 0;
  fileContents = null;

  parse() {

    const stripComment = (lineString) => {
      const commentIndex = lineString.indexOf('#');
      if (commentIndex > -1) { return lineString.substring(0, commentIndex); }
      return lineString;
    };

    const lines = this.fileContents.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = stripComment(lines[i]);

      const lineItems = line.replace(/\s\s+/g, ' ').trim().split(' ');
      if (line.length <= 0) continue;
      switch (lineItems[0].toLowerCase()) {
        case 'o': // Start A New Model
          this.parseObject(lineItems);
          break;
        case 'g': // Start a new polygon group
          this.parseGroup(lineItems);
          break;
        case 'v': // Define a vertex for the current model
          this.parseVertexCoords(lineItems);
          break;
        case 'vt': // Texture Coords
          this.parseTextureCoords(lineItems);
          break;
        case 'vn': // Define a vertex normal for the current model
          this.parseVertexNormal(lineItems);
          break;
        case 's': // Smooth shading statement
          this.parseSmoothShadingStatement(lineItems);
          break;
        case 'f': // Define a Face/Polygon
          this.parsePolygon(lineItems);
          break;
        case 'mtllib': // Reference to a material library file (.mtl)
          this.parseMtlLib(lineItems);
          break;
        case 'usemtl': // Sets the current material to be applied to polygons defined from this point forward
          this.parseUseMtl(lineItems);
          break;
        case 'name':
          this.parseName(lineItems);
        case '#':
          break;
        default:
          console.warn(`Unhandled obj statement at line #${i}: ${line}`);
          break;
      }
    }   

    return this.result;
  }

  currentModel() {
    if (this.result.models.length == 0) {
      this.result.models.push({
        name: this.defaultModelName,
        vertices: [],
        textureCoords: [],
        vertexNormals: [],
        faces: []
      });
      this.currentGroup = '';
      this.smoothingGroup = 0;
    }

    return this.result.models[this.result.models.length - 1];
  }

  getModelAtIndex(index) {
    return this.result.models[index];
  }

  /**
   * getIndexableDataFromModelAtIndex - generates indexable raw geometry data for the model at specified index
   * @param {Number} index the index of the model you are interested in (multiple models may exist in one obj file) 
   */
  getIndexableDataFromModelAtIndex(index) {
    const model = this.result.models[index];
    /*
    There is no guarantee this function works for 100% of obj models.
    This assumes for each vertex there is exactly one normal, one position, one texture coord.
    Some models do not abide by this, such as discrete models.
    */
    const faces = model.faces;
    const vertices = model.vertices;
    const textureCoords = model.textureCoords;
    const vertexNormals = model.vertexNormals;

    let indexData = [];
    faces.forEach(face => {
      // A face can have 3+ vertices.
      // Since we want triangles, we turn the face into a fan of triangles.
      // http://docs.safe.com/fme/2017.1/html/FME_Desktop_Documentation/FME_Workbench/!FME_Geometry/IFMETriangleFan.htm
      let face_verts = face.vertices;
      let initial_vert = face_verts[0];
      for (let i = 1; i < face_verts.length - 1; ++i){
        let triangle = [initial_vert, face_verts[i], face_verts[i + 1]];
        triangle.forEach(triangleVert => {
          indexData.push(triangleVert.vertexIndex - 1);
        });
      }
    });

    let textureData = [];
    textureCoords.forEach(coord => {
      textureData.push(coord.u);
      textureData.push(coord.v);
    });

    let normalData = [];
    vertexNormals.forEach(normal => {
      normalData.push(normal.x);
      normalData.push(normal.y);
      normalData.push(normal.z);
    });

    let vertexData = [];
    vertices.forEach(vertex => {
      vertexData.push(vertex.x);
      vertexData.push(vertex.y);
      vertexData.push(vertex.z);
    });

    return {
      indices: indexData,
      uvs: textureData,
      normals: normalData,
      vertices: vertexData
    }
  }

  /**
   * getFlattenedDataFromModelAtIndex - generates flattened geometry data, prefer the indexable method if model is not discrete
   * @param {Number} index the index of the model you are interested in (multiple models may exist in one obj file) 
   */
  getFlattenedDataFromModelAtIndex(index) {
    const model = this.result.models[index];
    let vertexData = [];
    let normalData = [];
    let textureData = [];
    let tangentData = [];
    let bitangentData = [];
    let nameData = this.defaultModelName;

    if (model.vertexNormals.length === 0) {
      model.vertexNormals = model.vertices.map(() => ({ x: 0, y: 0, z: 0 }));
    
      model.faces.forEach(face => {
        face.vertices.forEach(vertex => {
          const normal = model.vertexNormals[vertex.vertexIndex - 1];
          normal.x += face.normal.x;
          normal.y += face.normal.y;
          normal.z += face.normal.z;
        });
      });
    }
    model.faces.forEach(face => {
      face.vertices.forEach(vertex => {
        const v = model.vertices[vertex.vertexIndex - 1];
        vertexData.push(v.x, v.y, v.z);
    
        const n = model.vertexNormals[vertex.vertexIndex - 1];
        if (n) {
          normalData.push(n.x, n.y, n.z);
        } else {
          console.warn("No normal data loaded for model ==", nameData);
        }
        const t = model.textureCoords[vertex.textureCoordsIndex - 1];
        if(t){
          textureData.push(t.u, t.v);
        } else{
          console.warn("No texture data loaded for model ==", nameData);
        }
      });
    });
    if(textureData.length > 0){
      let tanData = new tangentAPI(model);
      let rawData = tanData.calculateTangents(model);

      tangentData = rawData.t;
      bitangentData = rawData.bt;
    }
  
    // console.log(rawData);
    if (normalData.length < 1) console.warn("No normal data loaded for model =", nameData);
    // console.log("Normal Data\n" + normalData);
    if (vertexData.length < 1) console.warn("No vertex data loaded for model =", nameData);
    // console.log("Vertex Data\n" + vertexData);
    if (textureData.length < 1) console.warn("No texture data loaded for model =", nameData);
    // console.log("Texture Data\n" + textureData);
    if (tangentData.length < 1) console.warn("No tangent data loaded for model =", nameData);
    // console.log("Tangent Data\n" + tangentData);
    if (bitangentData.length < 1) console.warn("No bitangent data loaded for model =", nameData);
    // console.log("Bitangent Data\n" + bitangentData);
    
    return {
      uvs: textureData,
      vertices: vertexData,
      normals: normalData,
      tangents: tangentData,
      bitangents: bitangentData,
      name: nameData,
    };
}


  parseObject(lineItems) {
    const modelName = lineItems.length >= 2 ? lineItems[1] : this.defaultModelName;
    this.result.models.push({
      name: modelName,
      vertices: [],
      textureCoords: [],
      vertexNormals: [],
      faces: []
    });
    this.currentGroup = '';
    this.smoothingGroup = 0;
  }

  parseGroup(lineItems) {
    if (lineItems.length != 2) { throw 'Group statements must have exactly 1 argument (eg. g group_1)'; }

    this.currentGroup = lineItems[1];
  }

  parseVertexCoords(lineItems) {
    const x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
    const y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
    const z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

    this.currentModel().vertices.push({ x, y, z });
  }

  parseTextureCoords(lineItems) {
    const u = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
    const v = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
    const w = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;
  
  
    if (lineItems.length >= 4)
      this.currentModel().textureCoords.push({ u, v, w });
    else
      this.currentModel().textureCoords.push({ u, v });
  }
  

  parseVertexNormal(lineItems) {
    const x = lineItems.length >= 2 ? parseFloat(lineItems[1]) : 0.0;
    const y = lineItems.length >= 3 ? parseFloat(lineItems[2]) : 0.0;
    const z = lineItems.length >= 4 ? parseFloat(lineItems[3]) : 0.0;

    this.currentModel().vertexNormals.push({ x, y, z });
  }

  parsePolygon(lineItems) {
    const totalVertices = (lineItems.length - 1);
    if (totalVertices < 3) { throw (`Face statement has less than 3 vertices${this.filePath}${this.lineNumber}`); }

    const face = {
      material: this.currentMaterial,
      group: this.currentGroup,
      smoothingGroup: this.smoothingGroup,
      vertices: []
    };

    for (let i = 0; i < totalVertices; i += 1) {
      const vertexString = lineItems[i + 1];
      const vertexValues = vertexString.split('/');

      if (vertexValues.length < 1 || vertexValues.length > 3) { throw (`Too many values (separated by /) for a single vertex${this.filePath}${this.lineNumber}`); }

      let vertexIndex = 0;
      let textureCoordsIndex = 0;
      let vertexNormalIndex = 0;
      vertexIndex = parseInt(vertexValues[0]);
      if (vertexValues.length > 1 && (!vertexValues[1] == '')) { textureCoordsIndex = parseInt(vertexValues[1]); }
      if (vertexValues.length > 2) { vertexNormalIndex = parseInt(vertexValues[2]); }

      if (vertexIndex == 0) { throw 'Faces uses invalid vertex index of 0'; }

      // Negative vertex indices refer to the nth last defined vertex
      // convert these to postive indices for simplicity
      if (vertexIndex < 0) { vertexIndex = this.currentModel().vertices.length + 1 + vertexIndex; }

      face.vertices.push({
        vertexIndex,
        textureCoordsIndex,
        vertexNormalIndex
      });
    }

      // Calculate face normal and store it in the face
      // A surface normal can be calculated by taking the vector cross product of two edges of that triangle.
      const model = this.currentModel();
      const v1 = model.vertices[face.vertices[0].vertexIndex - 1];
      const v2 = model.vertices[face.vertices[1].vertexIndex - 1];
      const v3 = model.vertices[face.vertices[2].vertexIndex - 1];
      const a = glMatrix.vec3.fromValues(v2.x - v1.x, v2.y - v1.y, v2.z - v1.z);
      const b = glMatrix.vec3.fromValues(v3.x - v1.x, v3.y - v1.y, v3.z - v1.z);
      const normal = glMatrix.vec3.create();
      glMatrix.vec3.cross(normal, a, b);

      face.normal = {
        x: normal[0],
        y: normal[1],
        z: normal[2],
      }  

    this.currentModel().faces.push(face);
  }

  parseMtlLib(lineItems) {
    if (lineItems.length >= 2) { this.result.materialLibraries.push(lineItems[1]); }
  }

  parseUseMtl(lineItems) {
    if (lineItems.length >= 2) { this.currentMaterial = lineItems[1]; }
  }

  parseSmoothShadingStatement(lineItems) {
    if (lineItems.length != 2) { throw 'Smoothing group statements must have exactly 1 argument (eg. s <number|off>)'; }

    const groupNumber = (lineItems[1].toLowerCase() == 'off') ? 0 : parseInt(lineItems[1]);
    this.smoothingGroup = groupNumber;
  }
  parseName(lineItems) {
    if (lineItems.length >= 1) { this.defaultModelName = lineItems[1]; }
  }

  // Add this method to the OBJData class to create a cube mesh with texture coordinate

}