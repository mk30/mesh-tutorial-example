var regl = require('regl')()
var mesh = require('./skelly.json')
var mat4 = require('gl-mat4')
var normals = require('angle-normals')
var camera = require('regl-camera')(regl, {
  center: [0, 20, 0],
  distance: 50 
})

function skelly (regl){
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vnormal;
      void main () {
        gl_FragColor = vec4(abs(vnormal), 1.0);
      }`,
    vert: `
      precision mediump float;
      uniform mat4 model, projection, view;
      attribute vec3 position, normal;
      varying vec3 vnormal;
      void main () {
        vnormal = normal;
        gl_Position = projection * view * model * vec4(position, 1.0);
      }`,
    attributes: {
      position: mesh.positions,
      normal: normals(mesh.cells, mesh.positions)
    },
    elements: mesh.cells,
    uniforms: {
      model: function(context, props){
        var rmat = []
        var rmati = mat4.identity(rmat)
        var theta = context.time
        mat4.rotateY(rmati, rmati, theta)
        return rmat
      }
    },
    primitive: "triangles"
  })
}
var draw = {
  skelly: skelly(regl)
}
regl.frame(function() {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  camera(function() {
    draw.skelly()
  })
})
