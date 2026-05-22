/* WebGL Lightning Effect — Neevara Realty */
(function () {
  'use strict';

  window.NeevaraLightning = function (canvasId, opts) {
    var options = Object.assign({
      hue: 42, xOffset: 0, speed: 1.2, intensity: 0.5, size: 1.8
    }, opts);

    var canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    var gl = canvas.getContext('webgl');
    if (!gl) { console.warn('WebGL not supported'); return null; }

    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    var vShaderSrc = 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.0,1.0);}';
    var fShaderSrc = [
      'precision mediump float;',
      'uniform vec2 iResolution;uniform float iTime;',
      'uniform float uHue;uniform float uXOffset;',
      'uniform float uSpeed;uniform float uIntensity;uniform float uSize;',
      'vec3 hsv2rgb(vec3 c){vec3 rgb=clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0);return c.z*mix(vec3(1.0),rgb,c.y);}',
      'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'mat2 rotate2d(float t){float c=cos(t),s=sin(t);return mat2(c,-s,s,c);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);float a=hash12(i),b=hash12(i+vec2(1,0)),c=hash12(i+vec2(0,1)),d=hash12(i+vec2(1,1));vec2 t=smoothstep(0.0,1.0,f);return mix(mix(a,b,t.x),mix(c,d,t.x),t.y);}',
      'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<8;i++){v+=a*noise(p);p*=rotate2d(0.45);p*=2.0;a*=0.5;}return v;}',
      'void main(){vec2 uv=gl_FragCoord.xy/iResolution.xy;uv=2.0*uv-1.0;uv.x*=iResolution.x/iResolution.y;uv.x+=uXOffset;uv+=2.0*fbm(uv*uSize+0.8*iTime*uSpeed)-1.0;float d=abs(uv.x);vec3 c=hsv2rgb(vec3(uHue/360.0,0.6,0.7));vec3 col=c*pow(0.06/d,1.0)*uIntensity;col=pow(col,vec3(1.0));gl_FragColor=vec4(col,1.0);}'
    ].join('\n');

    function compile(src, type) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null; return s;
    }

    var vs = compile(vShaderSrc, gl.VERTEX_SHADER);
    var fs = compile(fShaderSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return null;

    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var verts = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    var pos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'iResolution');
    var uTime = gl.getUniformLocation(prog, 'iTime');
    var uHue = gl.getUniformLocation(prog, 'uHue');
    var uXOff = gl.getUniformLocation(prog, 'uXOffset');
    var uSpd = gl.getUniformLocation(prog, 'uSpeed');
    var uInt = gl.getUniformLocation(prog, 'uIntensity');
    var uSz = gl.getUniformLocation(prog, 'uSize');

    var start = performance.now(), running = true;

    function render() {
      if (!running) return;
      resize();
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uHue, options.hue);
      gl.uniform1f(uXOff, options.xOffset);
      gl.uniform1f(uSpd, options.speed);
      gl.uniform1f(uInt, options.intensity);
      gl.uniform1f(uSz, options.size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }
    render();

    window.addEventListener('resize', resize);

    return {
      setHue: function (h) { options.hue = h; },
      destroy: function () { running = false; window.removeEventListener('resize', resize); }
    };
  };
})();
