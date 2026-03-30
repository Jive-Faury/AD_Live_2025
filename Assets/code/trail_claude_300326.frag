uniform vec4 uDiffuseColor;
uniform vec4 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform float uShadowStrength;
uniform vec3 uShadowColor;
uniform sampler2D posMap;
uniform float dim, uWorldSize;
uniform float uRebirthThreshold;

out Vertex
{
	vec4 color;
	vec3 worldSpacePos;
	vec3 worldSpaceNorm;
	flat int cameraIndex;
} oVert;

void main()
{
	vec4 worldSpacePos = TDDeform(P);
	vec3 uvUnwrapCoord = TDInstanceTexCoord(TDUVUnwrapCoord());

	float angle = atan(P.y, P.z);
	float dist = length(P.yz);

	// FIX 4 — round() pour éviter la troncature sur l'index texel
	int interpIdx     = int(round(P.x * (dim - 1.0)));
	int interpIdx_Next = clamp(interpIdx + 1, 0, int(dim) - 1);

	ivec2 id      = ivec2(TDInstanceID(), interpIdx);
	ivec2 id_Next = ivec2(TDInstanceID(), interpIdx_Next);

	vec4 pos      = texelFetch(posMap, id,      0);
	vec4 pos_next = texelFetch(posMap, id_Next, 0);

	// FIX 2 — binormal stable avec vecteur up fixe + fallback
	vec3 tangent = normalize(pos_next.xyz - pos.xyz);
	vec3 up = vec3(0.0, 1.0, 0.0);
	if (abs(dot(tangent, up)) > 0.99) up = vec3(1.0, 0.0, 0.0);
	vec3 binormal = normalize(cross(tangent, up));
	vec3 normal   = normalize(cross(binormal, tangent));

	// FIX 1 — pos.w est le rayon sculpt, ne pas multiplier pos.xyz par lui
	// FIX 3 — uWorldSize appliqué uniquement sur pos.xyz (déjà en world space)
	float radius = dist * pos.w;
	vec2 offsets = vec2(cos(angle), sin(angle)) * radius;
	vec3 wsP = pos.xyz * uWorldSize + binormal * offsets.x + normal * offsets.y;

	// Masquage naissance — détection saut de position
	float jumpDist   = length(pos_next.xyz - pos.xyz);
	float rebirthMask = 1.0 - step(uRebirthThreshold, jumpDist);

	// FIX 5 — wsN : fallback sur normal si rayon nul
	vec3 wsN = (radius > 1e-5)
		? normalize(binormal * offsets.x + normal * offsets.y)
		: normal;

	// Masquage : collapse le tube à zéro sur les segments de naissance
	wsP = mix(pos.xyz * uWorldSize, wsP, rebirthMask);

	worldSpacePos.xyz = wsP;
	gl_Position = TDWorldToProj(worldSpacePos, uvUnwrapCoord);

#ifndef TD_PICKING_ACTIVE
	int cameraIndex = TDCameraIndex();
	oVert.cameraIndex = cameraIndex;
	oVert.worldSpacePos.xyz = worldSpacePos.xyz;

	// Masquage alpha sur segment de naissance
	vec4 col = TDInstanceColor(Cd);
	col.a *= rebirthMask;
	oVert.color = col;

	vec3 worldSpaceNorm = normalize(TDDeformNorm(wsN));
	oVert.worldSpaceNorm.xyz = worldSpaceNorm;
#else
	TDWritePickingValues();
#endif
}