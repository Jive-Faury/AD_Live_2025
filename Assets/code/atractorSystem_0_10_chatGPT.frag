uniform float uCross;
uniform float sConst[8];
uniform float uLifeDamping;
uniform float uDrag;
uniform vec4  uWind;
uniform vec4  uTurbulence;
uniform vec3  uFactors;
uniform float uFPS;
uniform vec3  uAttrib;
uniform vec3  uThresh;
uniform float uParabola;
uniform float time;
uniform vec2  uInputMap;
uniform float uInput;
uniform float uSizeVariance;

layout(location = 0) out vec4 position;
layout(location = 1) out vec4 velocity;


//--------------------------------------------------
// Utils
//--------------------------------------------------

float safeRemap(float value, float low1, float high1, float low2, float high2)
{
    float denom = high1 - low1;
    if (abs(denom) < 1e-6) {
        return low2;
    }
    return low2 + (value - low1) * (high2 - low2) / denom;
}

float parabola(float x, float k)
{
    x = clamp(x, 0.0, 1.0);
    return pow(4.0 * x * (1.0 - x), k);
}

float luminanceAvg(vec3 c)
{
    return (c.r + c.g + c.b) * 0.3333333;
}


//--------------------------------------------------
// External input field
//--------------------------------------------------

vec3 externalInput(vec4 pos)
{
    vec2 fieldSize = max(vec2(2.0 * uInputMap.x, 2.0 * uInputMap.y), vec2(1e-6));
    vec2 uv;

    uv.x = safeRemap(pos.x, -fieldSize.x, fieldSize.x, 0.0, 1.0);
    uv.y = safeRemap(pos.y, -fieldSize.y, fieldSize.y, 0.0, 1.0);

    // évite les lectures hors texture si la particule sort du champ
    uv = clamp(uv, vec2(0.0), vec2(1.0));

    vec4 ext = texture(sTD2DInputs[6], uv) * (-uInput);

    // mélange XY -> Z selon life
    ext.z += mix(ext.x, ext.y, pos.w);

    return ext.rgb * 0.99;
}


//--------------------------------------------------
// Motion contributions
//--------------------------------------------------

vec3 windDisplacement(vec4 wind, float variance, float fps)
{
    float dt = (fps > 0.0) ? (1.0 / fps) : 0.0;
    return wind.xyz * (wind.w * dt) * variance;
}

vec3 turbulenceDisplacement(vec4 pos, vec3 turb, vec4 turbulence, float fps)
{
    float dt = (fps > 0.0) ? (1.0 / fps) : 0.0;
    return turb * (turbulence.xyz * turbulence.w * dt) * pos.w;
}


//--------------------------------------------------
// Main
//--------------------------------------------------

void main()
{
    // Sampling
    vec4 pos  = texture(sTD2DInputs[0], vUV.st);
    vec4 vel  = texture(sTD2DInputs[1], vUV.st);
    vec4 init = texture(sTD2DInputs[2], vUV.st);

    vec3 noiseVals = texture(sTD2DInputs[3], vUV.st).rgb;
    vec3 turb      = texture(sTD2DInputs[4], vUV.st).rgb;
    vec3 col       = texture(sTD2DInputs[5], vUV.st).rgb;

    float x = pos.x;
    float y = pos.y;
    float z = pos.z;

    // Constantes dérivées calculées localement
    float damping = sConst[7];
    float a = sConst[0] * damping;
    float b = sConst[1] * damping;
    float c = sConst[2] * damping;
    float d = sConst[3] * damping;
    float e = sConst[4] * damping;
    float f = sConst[5] * damping;
    float k = sConst[6] * damping;

    // Attractor A
    #include <formuleA>
    vec3 attractorA = vec3(dxA * uFactors.x,
                           dyA * uFactors.y,
                           dzA * uFactors.z) * dtA;

    // Attractor B
    #include <formuleB>
    vec3 attractorB = vec3(dxB * uFactors.x,
                           dyB * uFactors.y,
                           dzB * uFactors.z) * dtB;

    // Force de base
    vec3 force = mix(attractorA, attractorB, uCross);

    // Input externe
    force += externalInput(pos);

    // Masquage par attributs / seuils
    float bright = luminanceAvg(col);

    vec3 appliedForce = force;

    if (uAttrib.x != 0.0)
    {
        if (uAttrib.y == 0.0)
        {
            appliedForce *= step(uThresh.x, bright);
        }
        else
        {
            appliedForce *= vec3(step(uThresh, col));
        }
    }

    // Déplacements séparés
    vec3 dragMove = appliedForce * uDrag;

    turb += noiseVals;
    vec3 windMove = windDisplacement(uWind, pos.w, uFPS);
    vec3 turbMove = turbulenceDisplacement(pos, turb, uTurbulence, uFPS);

    vec3 totalMove = dragMove + windMove + turbMove;

    // Position update
    pos.xyz += totalMove;

    // Velocity = déplacement réellement appliqué
    vel.xyz = totalMove;

    //--------------------------------------------------
    // Life
    //--------------------------------------------------
    float life = pos.w - uLifeDamping;

    if (life <= 0.0)
    {
        life    = 1.0;
        pos.xyz = init.xyz;
        vel.xyz = vec3(0.0);
    }

    //--------------------------------------------------
    // Size from life
    //--------------------------------------------------
    float size = parabola(1.0 - life, uParabola);

    // Size variance via init alpha
    float sizeVariance = size * init.a;
    size = mix(size, sizeVariance, uSizeVariance);

    //--------------------------------------------------
    // Outputs
    //--------------------------------------------------
    position = TDOutputSwizzle(vec4(pos.xyz, life));
    velocity = TDOutputSwizzle(vec4(vel.xyz, size));
}