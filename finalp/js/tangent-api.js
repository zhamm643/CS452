class tangentAPI {

    calculateTangents(model){
        let tangentData = [];
        let bitangentData = [];
        // Calculate tangents and bitangents
        const tangents = new Array(model.vertices.length).fill(null).map(() => glMatrix.vec3.create());
        const bitangents = new Array(model.vertices.length).fill(null).map(() => glMatrix.vec3.create());

        model.faces.forEach(face => {
        const face_verts = face.vertices;
        const v0 = model.vertices[face_verts[0].vertexIndex - 1];
        const v1 = model.vertices[face_verts[1].vertexIndex - 1];
        const v2 = model.vertices[face_verts[2].vertexIndex - 1];
        const uv0 = model.textureCoords[face_verts[0].textureCoordsIndex - 1];
        const uv1 = model.textureCoords[face_verts[1].textureCoordsIndex - 1];
        const uv2 = model.textureCoords[face_verts[2].textureCoordsIndex - 1];

        const deltaPos1 = glMatrix.vec3.fromValues(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
        const deltaPos2 = glMatrix.vec3.fromValues(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);

        const deltaUV1 = glMatrix.vec2.fromValues(uv1.u - uv0.u, uv1.v - uv0.v);
        const deltaUV2 = glMatrix.vec2.fromValues(uv2.u - uv0.u, uv2.v - uv0.v);

        const f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);

        const tangent = glMatrix.vec3.fromValues(
            f * (deltaUV2[1] * deltaPos1[0] - deltaUV1[1] * deltaPos2[0]),
            f * (deltaUV2[1] * deltaPos1[1] - deltaUV1[1] * deltaPos2[1]),
            f * (deltaUV2[1] * deltaPos1[2] - deltaUV1[1] * deltaPos2[2])
        );

        const bitangent = glMatrix.vec3.fromValues(
            f * (-deltaUV2[0] * deltaPos1[0] + deltaUV1[0] * deltaPos2[0]),
            f * (-deltaUV2[0] * deltaPos1[1] + deltaUV1[0] * deltaPos2[1]),
            f * (-deltaUV2[0] * deltaPos1[2] + deltaUV1[0] * deltaPos2[2])
        );

        for (const triangle_vert of face_verts) {
            const tan_A = tangents[triangle_vert.vertexIndex - 1];
            const bitan_A = bitangents[triangle_vert.vertexIndex - 1];
            glMatrix.vec3.add(tan_A, tan_A, tangent);
            glMatrix.vec3.add(bitan_A, bitan_A, bitangent);
        }
        });

        // Normalize tangents and bitangents
        tangents.forEach(tangent => glMatrix.vec3.normalize(tangent, tangent));
        bitangents.forEach(bitangent => glMatrix.vec3.normalize(bitangent, bitangent));

        // Flatten tangents and bitangents
        model.faces.forEach(face => {
        face.vertices.forEach(vertex => {
            const t = tangents[vertex.vertexIndex - 1];
            tangentData.push(t[0], t[1], t[2]);

            const b = bitangents[vertex.vertexIndex - 1];
            bitangentData.push(b[0], b[1], b[2]);
        });
        });

        return {
            t: tangentData,
            bt: bitangentData,
        }
    
    }
}