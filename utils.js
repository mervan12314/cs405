function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
    0.1767767, -0.28661165, 0.36959946, 0.3,
    0.30618622, 0.36959946, 0.14016504, -0.25,
    -0.70710678, 0.35355339, 0.61237244, 0.0,
    0.0, 0.0, 0.0, 1.0



    ]);
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // Convert degrees to radians for the rotations
    var radianX = (30 * Math.PI) / 180;
    var radianY = (45 * Math.PI) / 180;
    var radianZ = (60 * Math.PI) / 180;

    // Step 1: Create the individual transformation matrices
    var scaleMatrix = createScaleMatrix(0.5, 0.5, 1.0); // Scaling on x and y, no scaling on z
    var rotationMatrixX = createRotationMatrix_X(radianX); // 30-degree rotation on X-axis
    var rotationMatrixY = createRotationMatrix_Y(radianY); // 45-degree rotation on Y-axis
    var rotationMatrixZ = createRotationMatrix_Z(radianZ); // 60-degree rotation on Z-axis
    var translationMatrix = createTranslationMatrix(0.3, -0.25, 0.0); // Translation on x and y axes

    // Step 2: Combine the transformations in the correct order (Scale -> Rotate -> Translate)
     // Apply scaling (Rotation * Scale)
     var scaledRotationMatrix = multiplyMatrices(scaleMatrix,translationMatrix);
    // Combine rotation matrices first (Z * Y * X)
    var combinedRotationMatrix = multiplyMatrices(rotationMatrixZ, multiplyMatrices(rotationMatrixY, rotationMatrixX));

   

    // Apply translation (Translation * (Rotation * Scale))
    var modelViewMatrix = multiplyMatrices(scaledRotationMatrix, combinedRotationMatrix);

    // Return the final model view matrix as Float32Array
    return new Float32Array(modelViewMatrix);
}


/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 * 
 */

// Define identity matrix (initial position)
const identityMatrix = createIdentityMatrix();

// Define the final transformation matrix (calculated in task 2)
const finalTransformationMatrix = getModelViewMatrix(); // From Task 2

// Linear interpolation function between two matrices
function lerpMatrix(matrixA, matrixB, t) {
    const result = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
        result[i] = matrixA[i] + t * (matrixB[i] - matrixA[i]);
    }
    return result;
}

function interpolateComponents(start, end, t) {
    return start.map((s, i) => s * (1 - t) + end[i] * t);
}

function interpolateRotation(startRotation, endRotation, t) {
    // Use a basic linear interpolation for now, could implement SLERP if needed
    return startRotation.map((s, i) => s * (1 - t) + endRotation[i] * t);
}
function decomposeMatrix(matrix) {
    const scale = [
        Math.hypot(matrix[0], matrix[1], matrix[2]),
        Math.hypot(matrix[4], matrix[5], matrix[6]),
        Math.hypot(matrix[8], matrix[9], matrix[10])
    ];

    const translation = [matrix[12], matrix[13], matrix[14]];

    // Extract rotation matrix (remove scaling from matrix)
    const rotation = [
        matrix[0] / scale[0], matrix[1] / scale[0], matrix[2] / scale[0],
        matrix[4] / scale[1], matrix[5] / scale[1], matrix[6] / scale[1],
        matrix[8] / scale[2], matrix[9] / scale[2], matrix[10] / scale[2]
    ];

    return { translation, rotation, scale };
}

function recombineMatrix(translation, rotation, scale) {
    const result = createIdentityMatrix();

    // Set the scale
    result[0] = rotation[0] * scale[0];
    result[1] = rotation[1] * scale[0];
    result[2] = rotation[2] * scale[0];

    result[4] = rotation[3] * scale[1];
    result[5] = rotation[4] * scale[1];
    result[6] = rotation[5] * scale[1];

    result[8] = rotation[6] * scale[2];
    result[9] = rotation[7] * scale[2];
    result[10] = rotation[8] * scale[2];

    // Set the translation
    result[12] = translation[0];
    result[13] = translation[1];
    result[14] = translation[2];

    return result;
}


// Function to calculate the periodic movement (called continuously)
function getPeriodicMovement(startTime) {
    const timeElapsed = (Date.now() - startTime) / 1000; // Time in seconds
    const period = 10.0; // 10 seconds for full animation cycle (5s each way)
    const phase = timeElapsed % period; // Phase in cycle (0 to 10 seconds)
    
    let t;
    if (phase <= 5) {
        t = phase / 5; // First 5 seconds, t goes from 0 to 1
    } else {
        t = (10 - phase) / 5; // Last 5 seconds, t goes from 1 to 0
    }

    // Decompose both the initial (identity) and target (task 2) matrices
    const initialMatrix = createIdentityMatrix();
    const targetMatrix = getModelViewMatrix();
    
    const initialComponents = decomposeMatrix(initialMatrix);
    const targetComponents = decomposeMatrix(targetMatrix);

    // Interpolate between the components
    const interpolatedTranslation = interpolateComponents(initialComponents.translation, targetComponents.translation, t);
    const interpolatedScale = interpolateComponents(initialComponents.scale, targetComponents.scale, t);
    const interpolatedRotation = interpolateRotation(initialComponents.rotation, targetComponents.rotation, t);

    // Recombine the components into a single matrix
    const interpolatedMatrix = recombineMatrix(interpolatedTranslation, interpolatedRotation, interpolatedScale);

    return getTransposeMatrix(interpolatedMatrix); // Transpose for WebGL use
}















