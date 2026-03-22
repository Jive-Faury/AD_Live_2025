const float pi = 3.1415926535;

layout (local_size_x = 8, local_size_y = 8) in;

uniform float frame;

uniform bool reset;
uniform float noiseScale;
uniform float noiseAmplitude;
uniform float lifeLimit;
uniform float initialPointVariance, uVelDamp;

float random(vec2 n) {
    return fract(sin(dot(n.xy, vec2(12.9898, 78.233)))* 43758.5453);
}

vec3 pointOnSphere(float theta, float phi) {
  vec3 point = vec3(0.0);
  point.x = sin(theta) * cos(phi);
  point.y = sin(theta) * sin(phi);
  point.z = cos(theta);
  return point;
}

// this curl noise function is based on https://github.com/cabbibo/glsl-curl-noise/blob/master/curl.glsl

vec3 snoiseVec3(vec3 x) {
  float s  = TDSimplexNoise(vec3( x ));
  float s1 = TDSimplexNoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = TDSimplexNoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;
}

vec3 curlNoise(vec3 p) {
  const float e = 0.00001;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}

//////// Parabola Function For Life
  float parabola( float x, float k ) // fonction parabola pour interpolation size
  {
      return pow( 4.0*x*(1.0-x), k );
  }

void main()
{
  bool initParticle = false;
  
    vec3 pos = vec3(0.0, 0.0, 0.0);
    vec3 vel = vec3(0.0, 0.0, 0.0);
    float age = 0.0;
    float life = 1.0;
    
    if(reset == false){
      vec4 temp1 = imageLoad(sTDComputeOutputs[0], ivec2(gl_GlobalInvocationID.xy));
      vec4 temp2 = imageLoad(sTDComputeOutputs[1], ivec2(gl_GlobalInvocationID.xy));
      pos = temp1.rgb;
      vel = temp2.rgb;
      age = temp1.a;
      life = temp2.a;
      
      if(age < life){
        vel = curlNoise(pos * vec3(noiseScale)) * vec3(noiseAmplitude);
        pos += vel * uVelDamp;
        age++;
      } else {
        initParticle = true;
      }
    } else {
      initParticle = true;
    }
    
    if(initParticle == true){
      vec4 temp = texelFetch(sTD2DInputs[0], ivec2(gl_GlobalInvocationID.xy), 0);
      pos = texelFetch(sTD2DInputs[1], ivec2(random(temp.xy + pos.xy) * uTD2DInfos[1].res.z, 0), 0).xyz;
      pos += pointOnSphere(pi * random(temp.xy), 2.0 * pi * random(temp.yz)) * random(temp.zx) * initialPointVariance;
      vel = pointOnSphere(pi * random(temp.xx), 2 * pi * random(temp.yy)) * initialPointVariance;
      age = 0;
      life = random(vec2(temp.zz)) * lifeLimit;
    }
  
//////// Size en rapport avec Life
    //float size = parabola(1/age , uParabola);

    imageStore(sTDComputeOutputs[0], ivec2(gl_GlobalInvocationID.xy), TDOutputSwizzle(vec4(pos, age)));
    imageStore(sTDComputeOutputs[1], ivec2(gl_GlobalInvocationID.xy), TDOutputSwizzle(vec4(vel, life)));
}
