<template>
  <div>
    <canvas 
      ref="canv" 
      @mousedown="startDrawPath" 
      @touchstart="startDrawPathTouch"
      @mouseup="endDrawPath"
      @mouseleave="endDrawPath"
      @touchend="endDrawPath"
      @touchleave="endDrawPath"
      @mousemove="movePath"
      @touchmove.prevent="movePathTouch"
    >
    </canvas>
    <img ref="render" id="render" />
    <div class="color-picker">
      <div 
        class="color-item" 
        :class="{ picked: color == c }"
        @click="color = c" 
        :style="{ backgroundColor: c }" 
        v-for="c in colors">
      </div>
      <div class="clear" @click="clearCanvas">
        🗑 
      </div>
      <div class="clear" @click="undo">
        🔙         
      </div>
    </div>
  </div>
</template>

<script>
function makeid () {
  var text = ''

  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

const UNDO_SIZE = 30
window.undoStack = []
let undoStack = window.undoStack

const ID = makeid()

export default {
  data () {
    return {
      ctx: null,
      isDrawingPath: false,
      color: '#fafafa',
      colors: [
        '#fafafa',
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffaa00',
        '#aaff00',
        '#aa00ff',
        '#ff00aa',
        '#00ffaa',
        '#00aaff'
      ]
    }
  },
  methods: {
    getMousePos (event) {
      const pos = this.$refs.canv.getBoundingClientRect()
      return {
        x: event.clientX - pos.left,
        y: event.clientY - pos.top
      }
    },
    startDrawPath (event) {
      if (event._client === ID) return
      console.log('triggered: start', event)

      this.isDrawingPath = true
      const { x, y } = this.getMousePos(event)
      this.ctx.beginPath()
      this.ctx.strokeStyle = this.color
      this.ctx.moveTo(x, y)
      this.sendRemoteFrame()
    },
    endDrawPath (event) {
      if (event._client === ID) return
      console.log('triggered: end', event)

      this.isDrawingPath = false
      this.ctx.stroke()
      this.enstackUndo()
    },
    movePath (event) {
      if (event._client === ID) return
      if (!this.isDrawingPath) return

      const { x, y } = this.getMousePos(event)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
    },
    movePathTouch (event) {
      this.movePath(event.touches.item(0))
    },
    startDrawPathTouch (event) {
      this.startDrawPath(event.touches.item(0))
    },
    enstackUndo () {
      const data = this.$refs.canv.toDataURL()
      undoStack.push(data)
      if (undoStack.length >= UNDO_SIZE) {
        undoStack.slice(undoStack.length - UNDO_SIZE)
      }
    },
    undo () {
      undoStack.pop()

      this.drawRemoteFrame(undoStack[undoStack.length - 1])
      this.sendRemoteFrame(true)
    },
    sendRemoteFrame (force = false) {
      if (!force && !this.isDrawingPath) return
      setTimeout(() => {
        console.log('frame send')
        if (!force && !this.isDrawingPath) return
        const data = this.$refs.canv.toDataURL()

        this.$socket.emit('frame', data)
        this.sendRemoteFrame()
      }, 1000 / 30)
    },
    drawRemoteFrame (frame) {
      console.log('frame get')

      const { canv, render } = this.$refs
      const { ctx } = this

      render.src = frame
      render.onload = () => {
        ctx.clearRect(0, 0, canv.width, canv.height)
        ctx.drawImage(render, 0, 0, canv.width, canv.height)
      }
    },
    clearCanvas () {
      this.ctx.clearRect(0, 0, this.$refs.canv.width, this.$refs.canv.height)
      this.sendRemoteFrame(true)
    }
  },
  mounted () {
    console.log(this)

    // const { clientX, clientY } = this.$refs.canv.getBoundingClientRect()
    // this.$refs.canv.setAttributeNode({
    //   width: clientX,
    //   height: clientY
    // })

    const { canv } = this.$refs

    canv.width = window.innerWidth
    canv.height = window.innerHeight

    this.ctx = canv.getContext('2d')

    this.$options.sockets.frame = this.drawRemoteFrame
    this.enstackUndo()
  }
}
</script>

<style lang="sass" scoped>
  #render
    visibility: hidden
    overflow: hidden
    width: 100px
    height: 100px

  canvas
    transform: translateZ(0)
    position: absolute
    top: 0
    bottom: 0
    right: 0
    left: 0
    // width: 100vw
    // height: 100vh
  
  .color-picker
    position: absolute
    bottom: 0
    right: 0
    left: 0
    background-color: #000c09 + #111
    height: 75px
    display: flex
    opacity: 0.3
    transition: opacity 0.4s ease-in-out
    align-items: center
    color: #0f8

    .clear
      width: 30px
      height: 30px
      background: #000c09 + #333
      // line-height: 3
      font-size: 1.6em
      padding: 1rem
      margin: 5px

    &:hover
      opacity: 1

    .color-item
      width: 60px - 3px
      height: 60px - 3px
      margin: 5px
      border: 3px solid transparent 

      &.picked
        border-color: #fff
        box-shadow: 0 0 15px #efefef
</style>
