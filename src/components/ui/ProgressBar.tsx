"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * A liquid progress bar rendered with WebGL2, ported from the MetalForge Skia
 * shader (the "liquid" style) for the web. When `progress` is negative it drives
 * itself with a believable ebb-and-flow sim; otherwise it tracks the value.
 * Falls back to a CSS indeterminate bar if WebGL2 is unavailable.
 */

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uResolution; uniform float uTime, progress, alive, warp;
out vec4 fragColor;
const float scale=9.0, amount=0.085, lag=0.55, echo=0.055, bloom=1.0;
const float frontIn=-0.12, frontOut=0.12, feather=1.0, churn=1.0, ripple=1.0, falloff=1.0, trails=3.0, trailGlow=1.0, haze=1.0, vignette=1.0, grain=0.01;
const vec3 background=vec3(0.129,0.129,0.141);
const vec3 c1=vec3(0.035,0.043,0.086), c2=vec3(0.043,0.098,0.290), c3=vec3(0.055,0.310,0.780), c4=vec3(0.259,0.722,0.980), c5=vec3(0.639,0.929,1.0), c6=vec3(0.075,0.329,0.761), c7=vec3(0.2,0.561,0.878);
float h21(vec2 p0){vec2 p=fract(p0*vec2(123.34,345.45));p+=vec2(dot(p,p+vec2(34.345)));return fract(p.x*p.y);}
float vn(vec2 p0){vec2 i=floor(p0),f=fract(p0),w=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1,0)),w.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),w.x),w.y);}
float fbm(vec2 p0){float v=0.0,a=0.5;vec2 p=p0;for(int i=0;i<4;i++){v+=a*vn(p);p=p*2.03+vec2(11.7);a*=0.5;}return v;}
float sstep(float e0,float e1,float x){float t=clamp((x-e0)/(e1-e0),0.0,1.0);return t*t*(3.0-2.0*t);}
float wave(float y,float tt,float amp){float w=sin(y*19.0*ripple+tt*1.55*churn)*0.55+sin(y*31.0*ripple-tt*1.05*churn+1.3)*0.24+sin(y*8.5*ripple+tt*0.62*churn)*0.46;w+=(fbm(vec2(y*2.6*ripple,tt*0.42*churn))-0.5)*1.15;return w*amp;}
void main(){
  vec2 res=max(uResolution,vec2(1.0));
  vec2 fc=floor(gl_FragCoord.xy)+0.5;
  vec2 uv=fc/res; float asp=res.x/res.y; vec2 p=vec2(uv.x*asp,uv.y);
  float uP=clamp(progress*0.01,0.0,1.0); float uA=clamp(alive,0.0,1.0); float t=warp;
  float amp=amount*uA; float ex=mix(frontIn,asp+frontOut,uP);
  float off=wave(uv.y,t,amp); float d=p.x-(ex+off);
  float px=1.6*feather/res.y; float inside=1.0-smoothstep(-px,px,d);
  float dl=max(0.0,-d); float prot=clamp(off/max(amp,0.0001)*0.5+0.5,0.0,1.0); float lum=bloom;
  vec3 col=c1;
  col=mix(col,c2,exp(-dl*2.1*falloff));
  col=mix(col,c3,exp(-dl*5.2*falloff)*0.9);
  col=mix(col,c4,exp(-dl*9.0*falloff)*(0.72+0.28*prot)*lum);
  col=mix(col,c5,exp(-dl*17.0*falloff)*(0.55+0.45*prot)*lum);
  for(int k=1;k<7;k++){ if(float(k)>trails+0.5)break; float fk=float(k);
    float ok=wave(uv.y,t-fk*lag,amp*(1.0+fk*0.22));
    float dk=p.x-(ex+ok-fk*(echo+0.030*uA));
    col+=c6*exp(-abs(dk)*max(0.5,15.0-fk*3.2)*falloff)*(0.34/fk)*trailGlow;
    col+=c7*exp(-abs(dk)*max(0.5,40.0-fk*7.0)*falloff)*(0.16/fk)*lum*trailGlow;
  }
  float hz=fbm(vec2(p.x*1.6-t*0.06*uA*churn,uv.y*1.9+t*0.05*uA*churn));
  col*=mix(1.0,0.86+0.28*hz,haze);
  float vig=smoothstep(0.0,0.42,uv.y)*sstep(1.0,0.58,uv.y);
  col*=mix(1.0,mix(0.78,1.06,vig),vignette);
  col=mix(background,col,inside);
  col+=vec3(h21(fc)-0.5)*grain;
  fragColor=vec4(max(col,vec3(0.0)),1.0);
}`;

const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position=vec4(a,0.0,1.0); }`;

// ── autonomous "liquid" sim (plain TS, from the RN component) ──
type Sim = { p: number; activity: number; wt: number; frames: number; target: number; rate: number; mode: string; wait: number; seed: number };
function newSim(): Sim {
  return { p: 0, activity: 0, wt: Math.random() * 20, frames: 0, target: 0, rate: 0.08, mode: "pause", wait: 0.5, seed: (Math.random() * 4294967296) >>> 0 };
}
function rand(s: Sim) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function step(s: Sim, dt: number) {
  let moved = false;
  if (s.mode === "pause") {
    s.wait -= dt;
    if (s.wait <= 0) {
      if (s.p >= 0.999) {
        s.target = 0;
        s.rate = 1.2;
      } else {
        s.target = Math.min(1, s.p + 0.06 + rand(s) * 0.16);
        s.rate = 0.05 + rand(s) * 0.11;
      }
      s.mode = "move";
    }
  }
  if (s.mode === "move") {
    const dir = Math.sign(s.target - s.p);
    s.p += dir * s.rate * dt;
    moved = true;
    if ((dir >= 0 && s.p >= s.target) || (dir < 0 && s.p <= s.target)) {
      s.p = s.target;
      s.mode = "pause";
      s.wait = s.p >= 0.999 ? 1.8 : s.p <= 0.001 ? 0.6 : 0.7 + rand(s) * 1.3;
    }
  }
  s.p = Math.max(0, Math.min(1, s.p));
  s.activity += ((moved ? 1 : 0) - s.activity) * (1 - Math.exp(-(moved ? 3.0 : 0.75) * dt));
  s.wt += dt * (0.35 + s.activity * 1.35);
}

export function ProgressBar({ progress = -1, className, style }: { progress?: number; className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progRef = useRef(progress);
  useEffect(() => {
    progRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) {
      canvas.dataset.fallback = "1";
      return;
    }
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "1";
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {
      res: gl.getUniformLocation(prog, "uResolution"),
      time: gl.getUniformLocation(prog, "uTime"),
      progress: gl.getUniformLocation(prog, "progress"),
      alive: gl.getUniformLocation(prog, "alive"),
      warp: gl.getUniformLocation(prog, "warp"),
    };

    const sim = newSim();
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      resize();
      const manual = progRef.current;
      if (manual >= 0) {
        const gap = Math.min(1, manual / 100) - sim.p;
        sim.p += Math.sign(gap) * Math.min(Math.abs(gap), 0.6 * dt);
        sim.activity += (1 - sim.activity) * (1 - Math.exp(-2 * dt));
        sim.wt += dt * (0.35 + sim.activity * 1.35);
      } else {
        step(sim, dt);
      }
      gl.uniform2f(u.res, canvas.width, canvas.height);
      gl.uniform1f(u.time, (now - t0) / 1000);
      gl.uniform1f(u.progress, sim.p * 100);
      gl.uniform1f(u.alive, reduce ? 0.2 : sim.activity);
      gl.uniform1f(u.warp, reduce ? 0 : sim.wt);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full bar-indeterminate", className)}
      style={style}
    />
  );
}
