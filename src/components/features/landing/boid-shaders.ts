// Position Update Shader
export const fragmentShaderPosition = `
    uniform float time;
    uniform float delta;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 tmpPos = texture2D(texturePosition, uv);
        vec3 position = tmpPos.xyz;
        vec3 velocity = texture2D(textureVelocity, uv).xyz;

        float phase = tmpPos.w;

        phase = mod((phase + delta + length(velocity.xz) * delta * 3. + max(velocity.y, 0.0) * delta * 6.), 62.83);

        gl_FragColor = vec4(position + velocity * delta * 15., phase);
    }
`;

// Velocity Update Shader
export const fragmentShaderVelocity = `
    uniform float time;
    uniform float testing;
    uniform float delta;
    uniform float separationDistance;
    uniform float alignmentDistance;
    uniform float cohesionDistance;
    uniform float freedomFactor;
    uniform vec3 predator;
    uniform float centerAttractionStrength;
    uniform float predatorRepulsionStrength;
    uniform float predatorRepulsionRadius;
    uniform float speedLimit;
    uniform vec2 windowBounds; 
    uniform float cameraZoom;

    const float width = resolution.x;
    const float height = resolution.y;
    const float PI = 3.141592653589793;
    const float PI_2 = PI * 2.0;

    float zoneRadius;
    float zoneRadiusSquared;
    float separationThresh;
    float alignmentThresh;

    float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        zoneRadius = separationDistance + alignmentDistance + cohesionDistance;
        separationThresh = separationDistance / zoneRadius;
        alignmentThresh = (separationDistance + alignmentDistance) / zoneRadius;
        zoneRadiusSquared = zoneRadius * zoneRadius;

        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec3 boidPosition, boidVelocity;

        vec3 selfPosition = texture2D(texturePosition, uv).xyz;
        vec3 selfVelocity = texture2D(textureVelocity, uv).xyz;

        float dist;
        vec3 dir;
        float distSquared;

        float separationSquared = separationDistance * separationDistance;
        float cohesionSquared = cohesionDistance * cohesionDistance;

        float f;
        float percent;

        vec3 velocity = selfVelocity;

        float limit = speedLimit;

        dir = vec3(predator.x * windowBounds.x / cameraZoom, predator.y * windowBounds.y / cameraZoom, 0.0) - selfPosition;
        dir.z = 0.;
        dist = length(dir);
        distSquared = dist * dist;

        float preyRadius = predatorRepulsionRadius;
        float preyRadiusSq = preyRadius * preyRadius;

        // Move boids away from predator
        if (dist < preyRadius) {
            f = (distSquared / preyRadiusSq - 1.0) * delta * predatorRepulsionStrength;
            velocity += normalize(dir) * f;
            limit += 5.0;
        }

        // Attract flocks to the center
        vec3 central = vec3(0., 0., 0.);
        dir = selfPosition - central;
        dir.z = 0.;
        velocity -= normalize(dir) * delta * centerAttractionStrength;

        for (float y = 0.0; y < height; y++) {
            for (float x = 0.0; x < width; x++) {
                vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
                boidPosition = texture2D(texturePosition, ref).xyz;

                dir = boidPosition - selfPosition;
                dir.z = 0.;
                dist = length(dir);

                if (dist < 0.0001) continue;

                distSquared = dist * dist;

                if (distSquared > zoneRadiusSquared) continue;

                percent = distSquared / zoneRadiusSquared;

                if (percent < separationThresh) { // Separation
                    f = (separationThresh / percent - 1.0) * delta;
                    velocity -= normalize(dir) * f;
                } else if (percent < alignmentThresh) { // Alignment
                    float threshDelta = alignmentThresh - separationThresh;
                    float adjustedPercent = (percent - separationThresh) / threshDelta;

                    boidVelocity = texture2D(textureVelocity, ref).xyz;

                    f = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;
                    velocity += normalize(boidVelocity) * f;
                } else { // Cohesion
                    float threshDelta = 1.0 - alignmentThresh;
                    float adjustedPercent;
                    if (threshDelta == 0.) adjustedPercent = 1.;
                    else adjustedPercent = (percent - alignmentThresh) / threshDelta;

                    f = (0.5 - (cos(adjustedPercent * PI_2) * -0.5 + 0.5)) * delta;
                    velocity += normalize(dir) * f;
                }
            }
        }

        // Speed limits
        if (length(velocity) > limit) {
            velocity = normalize(velocity) * limit;
        }

        velocity.z = 0.;

        gl_FragColor = vec4(velocity, 1.0);
    }
`;

// Boid Vertex Shader
export const boidVS = `
    attribute vec2 reference;
    attribute float boidVertex;
    
    uniform sampler2D texturePosition;
    uniform sampler2D textureVelocity;
    
    varying vec2 vUv;
    
    void main() {
        vec4 tmpPos = texture2D(texturePosition, reference);
        vec3 pos = tmpPos.xyz;
        vec3 velocity = normalize(texture2D(textureVelocity, reference).xyz);
        
        // Create UV coordinates for the quad
        vUv = vec2(
            boidVertex == 0.0 || boidVertex == 3.0 ? 0.0 : 1.0,
            boidVertex == 0.0 || boidVertex == 1.0 ? 0.0 : 1.0
        );
        
        // Rotate quad to face velocity direction
        float angle = atan(velocity.y, velocity.x) + 1.57079632679;
        mat2 rotation = mat2(
            cos(angle), sin(angle),
            -sin(angle), cos(angle)
        );
        // I would have expected the negative sign to be on the top right, but it works when it's on the bottom left
        
        vec2 rotatedPosition = rotation * position.xy;
        vec3 finalPosition = vec3(rotatedPosition, 0.0) + pos;
        
        gl_Position = projectionMatrix * viewMatrix * vec4(finalPosition, 1.0);
    }
`;

// Boid Fragment Shader
export const boidFS = `
    uniform sampler2D logoTexture;
    varying vec2 vUv;
    
    void main() {
        vec4 texColor = texture2D(logoTexture, vUv);
        gl_FragColor = texColor;
    }
`;
