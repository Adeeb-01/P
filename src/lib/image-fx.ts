/**
 * Shared WebGL image-distortion renderer (client only).
 *
 * ONE offscreen WebGL context serves every project card: a card renders its frame here and
 * immediately copies the result into its own 2D canvas (which lives inside the card, so CSS tilt,
 * skew and scale still apply). Cards only render while their effect is active, so an idle page
 * costs nothing on the GPU. Textures are uploaded once, downscaled to ≤1280px.
 */

const VERTEX = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

// Pointer-centred sine ripple + scroll wobble + RGB chromatic split, object-fit: cover sampling.
const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uCover;
uniform float uAspect;
uniform float uTime;
uniform float uEnergy;
uniform float uScroll;
uniform vec2 uMouse;
void main(){
  vec2 uv=vUv;
  vec2 p=uv-uMouse;
  float d=length(p*vec2(uAspect,1.));
  float wave=sin(d*26.-uTime*7.)*exp(-d*3.2)*.014*uEnergy;
  uv+=normalize(p+1e-5)*wave;
  uv.y+=sin(uv.x*9.+uTime*3.)*.005*uScroll;
  vec2 cuv=(uv-.5)*uCover+.5;
  float split=.0045*uEnergy+.007*uScroll;
  vec2 dir=normalize(p+vec2(1e-5))*split;
  float r=texture2D(uTex,clamp(cuv+dir,0.,1.)).r;
  float g=texture2D(uTex,clamp(cuv,0.,1.)).g;
  float b=texture2D(uTex,clamp(cuv-dir,0.,1.)).b;
  gl_FragColor=vec4(r,g,b,1.);
}`;

const MAX_TEXTURE_WIDTH = 1280;

type TextureEntry = { texture: WebGLTexture; aspect: number; owner: WebGLRenderingContext };

export type FrameParams = {
  width: number;
  height: number;
  time: number;
  energy: number;
  scroll: number;
  mouseX: number;
  mouseY: number;
};

class ImageFx {
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private textures = new Map<string, Promise<TextureEntry | null>>();
  private failed = false;

  /** True once a context has been successfully created (used by QA/diagnostics). */
  get contexts() {
    return this.gl ? 1 : 0;
  }

  private init() {
    if (this.gl || this.failed) return this.gl;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) {
      this.failed = true;
      return null;
    }
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      this.failed = true;
      return null;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    for (const name of ["uTex", "uCover", "uAspect", "uTime", "uEnergy", "uScroll", "uMouse"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    gl.uniform1i(this.uniforms.uTex, 0);
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.gl = null;
      this.textures.clear();
    });
    this.canvas = canvas;
    this.gl = gl;
    this.program = program;
    return gl;
  }

  /** Decode + upload (once per src), downscaled to keep VRAM small. */
  load(src: string) {
    const cached = this.textures.get(src);
    if (cached) return cached;
    const promise = (async (): Promise<TextureEntry | null> => {
      const gl = this.init();
      if (!gl) return null;
      try {
        const blob = await (await fetch(src)).blob();
        const probe = await createImageBitmap(blob);
        const scale = Math.min(1, MAX_TEXTURE_WIDTH / probe.width);
        // UNPACK_FLIP_Y is ignored for ImageBitmap uploads: flip at decode time so v=0 is the bottom row.
        const bitmap = await createImageBitmap(blob, {
          imageOrientation: "flipY",
          resizeWidth: Math.round(probe.width * scale),
          resizeHeight: Math.round(probe.height * scale),
          resizeQuality: "high",
        });
        probe.close();
        if (this.gl !== gl || gl.isContextLost()) { bitmap.close(); return null; }
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bitmap);
        const entry = { texture, aspect: bitmap.width / bitmap.height, owner: gl };
        bitmap.close();
        return entry;
      } catch {
        return null;
      }
    })();
    this.textures.set(src, promise);
    return promise;
  }

  /**
   * Render one frame for a card and copy it into the card's 2D canvas.
   * Returns false if the frame could not be produced (no WebGL context).
   */
  draw(target: CanvasRenderingContext2D, entry: TextureEntry, params: FrameParams) {
    const gl = this.gl;
    const canvas = this.canvas;
    if (!gl || !canvas || gl.isContextLost() || entry.owner !== gl) return false;
    const { width, height } = params;
    // Grow-only backing store: avoids reallocating as different cards render.
    if (canvas.width < width || canvas.height < height) {
      canvas.width = Math.max(canvas.width, width);
      canvas.height = Math.max(canvas.height, height);
    }
    gl.viewport(0, 0, width, height);
    const planeAspect = width / height;
    const cover = entry.aspect > planeAspect ? [planeAspect / entry.aspect, 1] : [1, entry.aspect / planeAspect];
    gl.bindTexture(gl.TEXTURE_2D, entry.texture);
    gl.uniform2f(this.uniforms.uCover, cover[0], cover[1]);
    gl.uniform1f(this.uniforms.uAspect, planeAspect);
    gl.uniform1f(this.uniforms.uTime, params.time);
    gl.uniform1f(this.uniforms.uEnergy, params.energy);
    gl.uniform1f(this.uniforms.uScroll, params.scroll);
    gl.uniform2f(this.uniforms.uMouse, params.mouseX, params.mouseY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // GL's origin is bottom-left: the rendered region is the bottom `height` rows of the canvas.
    target.drawImage(canvas, 0, canvas.height - height, width, height, 0, 0, width, height);
    return true;
  }
}

let instance: ImageFx | null = null;

/** Lazily-created singleton — never touches the DOM until a card actually needs it. */
export function imageFx() {
  instance ??= new ImageFx();
  return instance;
}
