<template>
  <select 
    class="simple-select__select"
    @change="handleChange"
  >
    <option
      v-for="opt in options"
      :value="opt.value"
      :key="opt.value"
    >
      {{opt.label}}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'SimpleSelect',

  props: {
    options: {
      type: Array as PropType<Array<{ label: string, value: any }>>,
      default: null
    },
  },

  emits: ['change'],

  setup(props, { emit }) {

    const handleChange = ({ target }: { target: HTMLInputElement }) => {
      emit('change', target.value)
    }

    return {
      handleChange,
    }
  },
});
</script>

<style>
.simple-select__select {
  border: none;
  border-bottom: 1px solid black;
  font-size: 16px;
  outline: none;
}
</style>