#extension GL_EXT_texture_array : require
#define BUMP_MAPPING

const vec3 startHeight = vec3(-10.76, 5.0, 50.0); // {sand, grass, snow}
const vec3 blending = 1.0 / vec3(10.0, 5.0, 20.0); // {sand, grass, snow}

const vec3 WATER_COLOR = vec3(0.09, 0.12, 0.225);

const float cliffStartSlope = 0.5;
const float cliffBlend = 1.0 / 0.3;

const float cliffScaling = 2.0;

uniform vec2 spec[4];

uniform sampler2DArray groundTex;
uniform sampler2DArray normalTex;
uniform sampler2D normalMap;

uniform vec3 lightDir; // Should be pre-normalized. Or else the world will BURN IN RIGHTEOUS FIRE!!

varying float height;

varying vec3 eyeDir;

varying vec2 texCoord;

vec3 phongLighting(in vec3 text, in vec3 normal, in vec2 specProp){
    // Calculate diffuse
    float ndotl = dot(lightDir, normal);
    float diffuse = clamp(ndotl, 0.0, 1.0);
    
    // Calculate specular
    vec3 vRef = normalize(reflect(-lightDir, normal));
    float stemp = clamp(dot(normalize(eyeDir), vRef), 0.0, 1.0);
    float specular = specProp.x * pow(stemp, specProp.y);

    //return text * gl_LightSource[0].ambient.rgb;
    //return text * gl_LightSource[0].diffuse.rgb * diffuse;
    //return text * gl_LightSource[0].specular.rgb * specular;
    return text * (gl_LightSource[0].ambient.rgb + 
                   gl_LightSource[0].diffuse.rgb * diffuse + 
                   gl_LightSource[0].specular.rgb * specular);
}

vec3 blinnLighting(in vec3 text, in vec3 normal, in vec2 specProp){
    // Calculate diffuse
    float ndotl = dot(lightDir, normal);
    float diffuse = clamp(ndotl, 0.0, 1.0);
    
    // Calculate specular
    vec3 halfVec = normalize(normalize(eyeDir) + lightDir);
    float stemp = clamp(dot(halfVec, normal), 0.0, 1.0);
    float specular = specProp.x * pow(stemp, 4.0 * specProp.y);
    //return text * gl_LightSource[0].specular.rgb * specular;
    return text * (gl_LightSource[0].ambient.rgb + 
                   gl_LightSource[0].diffuse.rgb * diffuse + 
                   gl_LightSource[0].specular.rgb * specular);
}

void main()
{
    vec2 srcUV = texCoord * 32.0;
    
    // Use the normalmap to produce a little randomness in the height.
    float heightBump = texture2D(normalMap, srcUV).x * 5.0;
    // Calculating the texture layer factors
    vec3 factors = (vec3(height, height - heightBump, height - heightBump) - startHeight) * blending; // Can be calculated in the vertex shader if need be.
    factors = clamp(factors, 0.0, 1.0);

    // Calculate the layer and it's blend factor with the next layer
    float l = factors.x + factors.y + factors.z - 1.0;
    float layer = floor(l);
    float blend = l - layer;

    // Extract normal and calculate tangent and binormal
    vec3 normal = texture2D(normalMap, texCoord).xyz;
    vec3 tangent = normalize(vec3(normal.y, -normal.x, 0.0));
    vec3 bitangent = normalize(vec3(0.0, -normal.z, normal.y));
    mat3 tangentSpace = mat3(tangent, normal, bitangent);

    // Calculate the cliff factor
    float cliffFactor = (normal.y - cliffStartSlope) * cliffBlend;
    cliffFactor = clamp(cliffFactor, 0.0, 1.0);

    // Texture color
    vec3 text = texture2DArray(groundTex, vec3(srcUV, layer)).xyz;
    vec3 blendText = texture2DArray(groundTex, vec3(srcUV, layer + 1.0)).xyz;
    text = mix(text, blendText, blend);

    text = mix(texture2DArray(groundTex, vec3(srcUV * cliffScaling, 3.0)).xyz, text, cliffFactor);

    // Extract normals and transform them into tangent space
    vec3 bumpNormal = texture2DArray(normalTex, vec3(srcUV, layer)).xzy;
    vec3 blendBump = texture2DArray(normalTex, vec3(srcUV, layer + 1.0)).xzy;
    bumpNormal = mix(bumpNormal, blendBump, blend);
    bumpNormal = mix(texture2DArray(normalTex, vec3(srcUV * cliffScaling, 3.0)).xzy, bumpNormal, cliffFactor);
    bumpNormal = bumpNormal * 2.0 - 1.0;
    bumpNormal = normalize(tangentSpace * bumpNormal);

    // Calculate specular
    vec2 specular = spec[int(layer)];
    vec2 blendSpecular = spec[int(layer+1.0)];
    vec2 matSpecular = mix(specular, blendSpecular, blend);
    matSpecular = mix(spec[3], matSpecular, cliffFactor);

    //vec3 color = phongLighting(text, bumpNormal, matSpecular);
    //vec3 color = phongLighting(text, normal, matSpecular);
    vec3 color = blinnLighting(text, bumpNormal, matSpecular);
    
    gl_FragColor.rgb = mix(WATER_COLOR, color, factors.x);
    gl_FragColor.a = 1.0;
}
