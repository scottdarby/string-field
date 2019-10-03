uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMousePos;

const float PI = 3.141592653589793238462643383279502884197169399375105820974944592307816406286208998;
const int MAX_MARCHING_STEPS = 50;
const float EPSILON = 0.0000001;

vec2 rotate2d(vec2 v, float a) {
	return vec2(v.x * cos(a) - v.y * sin(a), v.y * cos(a) + v.x * sin(a)); 
}

// Rotate around a coordinate axis (i.e. in a plane perpendicular to that axis) by angle <a>.
// Read like this: R(p.xz, a) rotates "x towards z".
void pR(inout vec2 p, float a) {
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float sdTorus( vec3 p, vec2 t ) {
	vec2 q = vec2(length(p.xz)-t.x,p.y);
	return length(q)-t.y;
}

float opTwist( vec3 p, float fftValue, float time, float id) {
    float c = cos((fftValue*1.5) *p.y);
    float s = sin((fftValue+0.5)*p.y);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m * p.xz, p.y);
    
    return sdTorus(q, vec2(abs(sin(uTime*0.1))+0.5*(fftValue*0.2), fftValue*0.0001));
}

float opRep( vec3 p, vec3 c ) {
    float idx = mod((floor((p.x)/c.x)), 32.0);
    float idy = mod((floor((p.y)/c.y)), 32.0);
    float idz = mod((floor((p.z)/c.z)), 32.0);
	float id = length(vec3(idx, idy, idz));
    // float fftValue = (((texture( iChannel0, vec2(id+1.0, 0.0) ).x)) * 10.0);
    float fftValue = 1.0;
    vec3 q = mod(p, c) - 0.5 * c;
    vec3 r = q;  
    float rotationAmount = (id * 5.0) + (uTime * 2.0);
    bool xmod2 = mod(idx, 2.0) == 0.0;
    
    // offset even rows
    if (xmod2) {
    	q.y += 1.;
        r.y -= 1.;
    }
    
	pR(q.xy, rotationAmount);
    pR(q.xz, rotationAmount * 0.1);
    
    float shape1 = opTwist(q, fftValue, uTime, id);
    
   if (xmod2) {
        pR(r.xy, rotationAmount);
        pR(r.xz, rotationAmount * 0.1);
        
        float shape2 = opTwist(r, fftValue, uTime, id);
        
    	return min(shape1, shape2);
    } else {
        return shape1;
    }
}


float sceneSDF(vec3 samplePoint) {
	return opRep(samplePoint, vec3(4.0, 4.0, 4.0));
}

vec3 castRay(vec3 pos, vec3 dir) {
	for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
		float dist = sceneSDF(pos);
        if (dist < EPSILON) {
			return pos;
        }
		pos += dist * dir;
	}    
	return pos;
}


float lightPointDiffuse(vec3 pos, vec3 lightPos) {
	float lightDist = length(lightPos - pos);
	float color = 3.0 / (lightDist * lightDist);
	return max(0.0, color*10.0);
}

void main() {
    
	vec2 mousePos = (uMousePos / uResolution.xy) * 2.0 - 1.0;
    
	mousePos *= vec2(PI / 2.0, PI / 2.0).xy;
	
	vec2 screenPos = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
	vec3 cameraPos = vec3(0.0, 0.0, -8.0);
	vec3 cameraDir = vec3(0.0, 0.0, 1.0);
	vec3 planeU = vec3(2.0, 0.0, 0.0);
	vec3 planeV = vec3(0.0, uResolution.y / uResolution.x * 2.0, 0.0);
	vec3 rayDir = normalize(cameraDir + screenPos.x * planeU + screenPos.y * planeV);
	
    cameraPos.yz = rotate2d(cameraPos.yz, mousePos.y);
    rayDir.yz = rotate2d(rayDir.yz, mousePos.y);

    cameraPos.xz = rotate2d(cameraPos.xz, mousePos.x);
    rayDir.xz = rotate2d(rayDir.xz, mousePos.x);
    cameraPos.zy += uTime * 0.3;
    
	vec3 rayPos = castRay(cameraPos, rayDir);
	
    // base color
	vec3 color = vec3(0., 0., 0.);
    // color += (rayDir*0.02);
    color += lightPointDiffuse(rayPos, cameraPos) * 10.0;
	color = pow(color, vec3(0.7));	
	
	gl_FragColor = vec4(color, 1.0);
}