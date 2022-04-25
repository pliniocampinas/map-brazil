<template>
  <div 
    class="timeline-control"
  >
    <div class="timeline-control__display">
      <div class="timeline-control__current">
        {{ currentValue }}
      </div>
      <button @click="handlePlay" :disabled="isPlaying">Play</button>
    </div>
    <div class="timeline-control__ticks">
      <div
        class="timeline-control__tick"
        :class="i <= (currentValue - firstValue + 1)? 'timeline-control__tick--filled': ''"
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

    return {
      handleTickClick,
      handlePlay,
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

.timeline-control__ticks {
  display: flex;
  height: 16px;
}

.timeline-control__tick {
  background-color: whitesmoke;
  border: 1px solid black;
  box-sizing: border-box;
}

.timeline-control__tick--filled {
  background-color: lightseagreen;
}
</style>