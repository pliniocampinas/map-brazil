<template>
  <div class="fund-view-switcher" >
    <div 
      class="fund-view-switcher__option" 
      :class="selectedView=='assets-count'?'fund-view-switcher__option--selected':''" 
      @click="$emit('select-view', 'assets-count')"
    >
      <span>Nro. ativos</span>
      <span class="fund-view-switcher__box"></span>
    </div>
    <div 
      class="fund-view-switcher__option" 
      :class="selectedView=='square-meters'?'fund-view-switcher__option--selected':''" 
      @click="$emit('select-view', 'square-meters')"
    >
      <span>Metros²</span>
      <span class="fund-view-switcher__box"></span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: 'FundViewSwitcher',

  props: {
    selectedView: {
      type: String,
      default: 'assets-count'
    }
  },
});
</script>

<style scoped>
.fund-view-switcher {
  background-color: transparent;
  box-sizing: border-box;
  position: absolute;
  right: 0;
  top: 0;
  width: 180px;
  padding: 20px 10px 2px 2px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.fund-view-switcher__option {
  font-weight: 700;
  font-size: small;
  display: flex;
  align-items: center;
  align-self: end;
  gap: 8px;
  background-color: #e0e0f0;
  cursor: pointer;
}

.fund-view-switcher__box {
  border: 1px solid black;
  width: 12px;
  height: 12px;
  display: inline-block;
}

.fund-view-switcher__option--selected {
  text-decoration: underline;
}

.fund-view-switcher__option--selected .fund-view-switcher__box {
  outline: 2px solid var(--app-primary-color);
  background-color: var(--app-secondary-color);
}
</style>