<template>
  <div 
    class="timeline-control"
  >
    <div class="timeline-control__display">
      <div class="timeline-control__current">
        <strong>
          {{ currentValue }}
        </strong>
      </div>
      <button
        class="time-line__play-button"
        @click="handlePlay"
        :class="isPlaying? 'pause': 'play'"
        :disabled="isPlaying"
      ></button>
    </div>
    <div class="timeline-control__ticks">
      <div
        class="timeline-control__tick"
        :class="resolveTickClass(i)"
        v-for="i in ticks"
        :key="i"
        :style="`min-width: ${100/ticks}%`"
        @click="handleTickClick(i - 1)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TimelineControl',

  props: {
    ticks: {
      type: Number,
      default: 10
    },
    firstValue: {
      type: Number,
      default: 0
    },
    currentValue: {
      type: Number,
      default: 1
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
  },

  emits: ['tick', 'play'],

  setup(props, { emit }) {

    const handleTickClick = (index: number) => {
      emit('tick', index)
    }

    const handlePlay = () => {
      emit('play')
    }

    const resolveTickClass = (index: number) => {
      if(index === (props.currentValue - props.firstValue + 1)) {
        return 'timeline-control__tick--active'
      }
      if(index < (props.currentValue - props.firstValue + 1)) {
        return 'timeline-control__tick--filled'
      }
      return ''
    }

    return {
      handleTickClick,
      handlePlay,
      resolveTickClass,
    }
  },
});
</script>

<style>
.timeline-control {
  box-sizing: border-box;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
}

.timeline-control__display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 28px;
}

.timeline-control__ticks {
  display: flex;
  height: 16px;
}

.timeline-control__tick {
  cursor: pointer;
  background-color: whitesmoke;
  border: 1px solid black;
  box-sizing: border-box;
}

.timeline-control__tick--filled {
  background-color: lightseagreen;
}

.timeline-control__tick--active {
  background-color: green;
}

.time-line__play-button {
  box-sizing: border-box;
  height: 20px;
  width: 20px;
  border-color: transparent transparent transparent #202020;
  cursor: pointer;
  /* play state */
  border-style: solid;
  border-width: 10px 0 10px 16px;
}

/* paused state */
.time-line__play-button.pause {
  border-style: double;
  border-width: 0px 0 0px 16px;
}
</style>