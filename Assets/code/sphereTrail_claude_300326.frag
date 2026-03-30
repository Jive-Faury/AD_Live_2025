uniform vec4 uDiffuseColor;
uniform vec4 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uShadowStrength;
uniform vec3 uShadowColor;
uniform sampler2D posMap;
uniform float uWorldSize;
uniform vec2 uCurve;
uniform float uRebirthThreshold;

float pcurve(float x, float a, float b)
{
    float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
    return k * pow(x, a) * pow(1.0 - x, b);
}

out Vertex
{
    vec4 color;
    vec3 worldSpacePos;
    vec3 worldSpaceNorm;
    flat int cameraIndex;
} oVert;

void main()
{
    // Position tête du trail — texel 0 = position la plus récente
    vec4 pos      = texelFetch(posMap, ivec2(TDInstanceID(), 0), 0);
    vec4 pos_next = texelFetch(posMap, ivec2(TDInstanceID(), 1), 0);

    // Masquage naissance — même logique que le trail shader
    float jumpDist    = length(pos_next.xyz - pos.xyz);
    float rebirthMask = 1.0 - step(uRebirthThreshold, jumpDist);

    // Taille via pcurve sur la vie (pos.w = life [0,1])
    float size = pcurve(1.0 - pos.w, uCurve.x, uCurve.y);

    // FIX — pos.w ne multiplie pas la position, uWorldSize seul
    vec4 worldSpacePos = TDDeform(P * size);
    worldSpacePos.xyz += pos.xyz * uWorldSize;

    // Collapse à la position monde si naissance détectée
    worldSpacePos.xyz = mix(pos.xyz * uWorldSize, worldSpacePos.xyz, rebirthMask);

    gl_Position = TDWorldToProj(worldSpacePos, TDInstanceTexCoord(TDUVUnwrapCoord()));

#ifndef TD_PICKING_ACTIVE
    int cameraIndex = TDCameraIndex();
    oVert.cameraIndex = cameraIndex;
    oVert.worldSpacePos.xyz = worldSpacePos.xyz;

    // Alpha masqué à la naissance
    vec4 col = TDInstanceColor(Cd);
    col.a *= rebirthMask;
    oVert.color = col;

    vec3 worldSpaceNorm = normalize(TDDeformNorm(N));
    oVert.worldSpaceNorm.xyz = worldSpaceNorm;
#else
    TDWritePickingValues();
#endif
}