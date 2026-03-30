uniform float uCross;
uniform float sConst[8];
uniform float uLifeDamping;
uniform float uDrag;
uniform vec4 uWind;
uniform vec4 uTurbulence;
uniform vec3 uFactors;
uniform float uFPS;
uniform vec3 uAttrib;
uniform vec3 uThresh;
uniform float uParabola;
uniform float time;
uniform vec2 uInputMap;
uniform float uInput;
uniform float uSizeVariance;
uniform vec3 uRotation;

layout(location = 0) out vec4 position;
layout(location = 1) out vec4 velocity;

//////// Constants
float damping = sConst[7];
float a = sConst[0] * damping;
float b = sConst[1] * damping;
float c = sConst[2] * damping;
float d = sConst[3] * damping;
float e = sConst[4] * damping;
float f = sConst[5] * damping;
float k = sConst[6] * damping;

//////// reMap Function
float reMap(in float value, in float low1, in float high1, in float low2, in float high2){
    return float(low2 + (value - low1) * (high2 - low2) / (high1 - low1));
}

//////// Rotation Matrix
mat3 rotationMatrix(float rx, float ry, float rz){
    float cx = cos(rx); float sx = sin(rx);
    float cy = cos(ry); float sy = sin(ry);
    float cz = cos(rz); float sz = sin(rz);

    mat3 Rx = mat3(
        1.0,  0.0,  0.0,
        0.0,  cx,  -sx,
        0.0,  sx,   cx
    );
    mat3 Ry = mat3(
        cy,  0.0,  sy,
        0.0, 1.0,  0.0,
       -sy,  0.0,  cy
    );
    mat3 Rz = mat3(
        cz, -sz,  0.0,
        sz,  cz,  0.0,
        0.0, 0.0, 1.0
    );
    return Rz * Ry * Rx;
}

//////// External Input
vec3 externalInput(in vec4 pos)
{
    vec2 currPos = pos.xy;
    vec2 fieldSize = vec2(2.0 * uInputMap.x, 2.0 * uInputMap.y);
    currPos.x = reMap(currPos.x, -fieldSize.x, fieldSize.x, 0.0, 1.0);
    currPos.y = reMap(currPos.y, -fieldSize.y, fieldSize.y, 0.0, 1.0);
    currPos = clamp(currPos, 0.0, 1.0);
    vec4 externals = texture(sTD2DInputs[6], currPos) * -uInput;
    externals.z += mix(externals.x, externals.y, pos.w);
    return externals.rgb * 0.99;
}

//////// Wind Force (delta only)
vec3 windForce(in vec4 wind, float variance){
    return (wind.xyz * (wind.w / uFPS)) * variance;
}

//////// Turb Force (delta only)
vec3 turbForce(in vec3 turb, in vec4 turbulence, float life){
    return turb * (turbulence.xyz * turbulence.w / uFPS) * life;
}

//////// Parabola Function For Life
float parabola(float x, float k){
    return pow(4.0 * x * (1.0 - x), k);
}


void main()
{

//////// Sampling Textures
    vec4 pos  = texture(sTD2DInputs[0], vUV.st);
    vec4 vel  = texture(sTD2DInputs[1], vUV.st);
    vec4 init = texture(sTD2DInputs[2], vUV.st);
    vec3 noiseVals = texture(sTD2DInputs[3], vUV.st).rgb;
    vec3 turb = texture(sTD2DInputs[4], vUV.st).rgb;
    vec3 col  = texture(sTD2DInputs[5], vUV.st).rgb;

//////// Definition Variables
    float x = pos.x;
    float y = pos.y;
    float z = pos.z;

//////// Equations Strange Attractors
#include <formuleA>
    vec3 attractorA = vec3(dxA * uFactors.x, dyA * uFactors.y, dzA * uFactors.z) * dtA;
#include <formuleB>
    vec3 attractorB = vec3(dxB * uFactors.x, dyB * uFactors.y, dzB * uFactors.z) * dtB;

//////// Mix + Rotation
    mat3 rot = rotationMatrix(uRotation.x, uRotation.y, uRotation.z);
    vec3 force = rot * mix(attractorA, attractorB, uCross);

//////// External Input
    force += externalInput(pos);

//////// Color Attribute Modulation
    float bright = 0.33333 * (col.r + col.g + col.b);

    if(uAttrib.x < 0.001){
        pos.xyz += force * uDrag;
    }
    else{
        if(uAttrib.y < 0.001){
            pos.xyz += (force * step(uThresh.x, bright)) * uDrag;
        }
        else{
            pos.xyz += (force * vec3(step(uThresh, col))) * uDrag;
        }
    }

//////// Wind + Turbulence
    pos.xyz += windForce(uWind, pos.w);
    turb += noiseVals;
    pos.xyz += turbForce(turb, uTurbulence, pos.w);

//////// Velocity
    vel.xyz = force;

//////// Life
    float life = pos.w;
    life -= uLifeDamping;
    if(life <= -uLifeDamping){
        life = 1.0;
        pos.xyz = init.xyz;
       vel.xyz = vec3(0.0);
    }

//////// Size
    float size = parabola(1.0 - life, uParabola);

//////// Size Variance
    float sizeVariance = size * init.a;
    size = mix(size, sizeVariance, uSizeVariance);

    position = vec4(pos.xyz, life);
    velocity = vec4(vel.xyz, size);
}