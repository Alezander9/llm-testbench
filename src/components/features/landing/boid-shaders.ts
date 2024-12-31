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

    const float width = resolution.x;
    const float height = resolution.y;
    const float PI = 3.141592653589793;
    const float PI_2 = PI * 2.0;
    const float UPPER_BOUNDS = 400.0;
    const float LOWER_BOUNDS = -UPPER_BOUNDS;
    const float SPEED_LIMIT = 9.0;

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
        vec3 birdPosition, birdVelocity;

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

        float limit = SPEED_LIMIT;

        dir = predator * UPPER_BOUNDS - selfPosition;
        dir.z = 0.;
        dist = length(dir);
        distSquared = dist * dist;

        float preyRadius = 150.0;
        float preyRadiusSq = preyRadius * preyRadius;

        // Move birds away from predator
        if (dist < preyRadius) {
            f = (distSquared / preyRadiusSq - 1.0) * delta * 100.;
            velocity += normalize(dir) * f;
            limit += 5.0;
        }

        // Attract flocks to the center
        vec3 central = vec3(0., 0., 0.);
        dir = selfPosition - central;
        dist = length(dir);

        dir.y *= 2.5;
        velocity -= normalize(dir) * delta * 5.;

        for (float y = 0.0; y < height; y++) {
            for (float x = 0.0; x < width; x++) {
                vec2 ref = vec2(x + 0.5, y + 0.5) / resolution.xy;
                birdPosition = texture2D(texturePosition, ref).xyz;

                dir = birdPosition - selfPosition;
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

                    birdVelocity = texture2D(textureVelocity, ref).xyz;

                    f = (0.5 - cos(adjustedPercent * PI_2) * 0.5 + 0.5) * delta;
                    velocity += normalize(birdVelocity) * f;
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

        gl_FragColor = vec4(velocity, 1.0);
    }
`;

// Bird Vertex Shader
export const birdVS = `
    attribute vec2 reference;
    attribute float birdVertex;

    attribute vec3 birdColor;

    uniform sampler2D texturePosition;
    uniform sampler2D textureVelocity;

    varying vec4 vColor;
    varying float z;

    uniform float time;

    void main() {
        vec4 tmpPos = texture2D(texturePosition, reference);
        vec3 pos = tmpPos.xyz;
        vec3 velocity = normalize(texture2D(textureVelocity, reference).xyz);

        vec3 newPosition = position;

        if (birdVertex == 4.0 || birdVertex == 7.0) {
            // flap wings
            newPosition.y = sin(tmpPos.w) * 5.;
        }

        newPosition = mat3(modelMatrix) * newPosition;

        velocity.z *= -1.;
        float xz = length(velocity.xz);
        float xyz = 1.;
        float x = sqrt(1. - velocity.y * velocity.y);

        float cosry = velocity.x / xz;
        float sinry = velocity.z / xz;

        float cosrz = x / xyz;
        float sinrz = velocity.y / xyz;

        mat3 maty = mat3(
            cosry, 0, -sinry,
            0    , 1, 0,
            sinry, 0, cosry
        );

        mat3 matz = mat3(
            cosrz, sinrz, 0,
            -sinrz, cosrz, 0,
            0    , 0    , 1
        );

        newPosition = maty * matz * newPosition;
        newPosition += pos;

        z = newPosition.z;

        vColor = vec4(birdColor, 1.0);
        gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
    }
`;

// Bird Fragment Shader
export const birdFS = `
    varying vec4 vColor;
    varying float z;

    uniform vec3 color;

    void main() {
        float z2 = 0.2 + (1000. - z) / 1000. * vColor.x;
        gl_FragColor = vec4(z2, z2, z2, 1.);
    }
`;
