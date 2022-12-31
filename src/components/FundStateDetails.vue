<template>
  <div class="fund-state-details">
    <h4 class="fund-state-details__heading">Estado:  {{ state.acronym? state.acronym: '' }}</h4>
    <template v-if="state.acronym">
      <p class="fund-state-details__paragraph">Número de ativos: {{ state.assetsCount }}</p>
      <p class="fund-state-details__paragraph">Total de m²: {{ state.totalSquareMeters }}</p>
    </template>
    <template v-else>
      <p class="fund-state-details__paragraph">
        Selecione um estado para ver detalhes
      </p>
      <p class="fund-state-details__paragraph" style="visibility: hidden;">Placeholder</p>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'FundStateDetails',

  components: {
  },

  props: {
    state: {
      type: Object as PropType<{
        acronym: string;
        assetsCount: number;
        totalSquareMeters: number;
      }>,
      default: () => null
    },
  },
});
</script>

<style scoped>
.fund-state-details {
  padding: 8px 4px;
}

.fund-state-details__heading {
  margin: 12px 0px;
}

.fund-state-details__paragraph {
  margin: 6px 0px;
}
</style>