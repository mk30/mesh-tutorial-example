var regl = require('regl')()
var skelly = require('./skelly.json')
var mat4 = require('gl-mat4')
var normals = require('angle-normals')

var camera = require('regl-camera')(regl, {
  center: [0, 20, 0],
  distance: 50
})

var drawskelly = regl({
  frag: `
    precision mediump float;
    varying vec3 vnormal;
    vec3 hsl2rgb(vec3 hsl) {
      vec3 rgb = clamp( abs(mod(hsl.x*2.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
      return hsl.z - hsl.y * (rgb-0.5)*(3.0-abs(2.0*hsl.y-1.0));
    }
    void main () {
      gl_FragColor = vec4(hsl2rgb(abs(vnormal)), 1.0);
    }`,
  vert: `
    precision mediump float;
    uniform mat4 model, projection, view;
    attribute vec3 position, normal;
    varying vec3 vnormal;
    uniform float t;
    vec3 warp (vec3 p){
      float r = length(p.zx);
      float theta = atan(p.z, p.x);
      return vec3 (r*cos(theta), p.y, r*sin(theta)) +
      vnormal+(1.0+cos(t+p.z));
    }
    void main () {
      vnormal = normal;
      gl_Position = projection * view * model *
      vec4(warp(position), 1.0);
    }`,
  attributes: {
    position: skelly.positions,
    normal: normals(skelly.cells, skelly.positions)
  },
  elements: skelly.cells,
  uniforms: {
    t: function(context, props){
         return context.time
    },
    model: function(context, props){
      var theta = context.time
      var rmat = []
      return mat4.rotateY(rmat, mat4.identity(rmat), theta)
    }
  },
  primitive: "triangles"
})

regl.frame(function() {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(function() {
    drawskelly()
  })
})
