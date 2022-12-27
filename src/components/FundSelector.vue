<template>
  <div class="fund-selector" >
    <div>
      <strong>Fundos: </strong>
      <select @change="fundSelected" class="fund-selector__select">
        <option value="">Todos</option>
        <option v-for="(fund, index) in funds" :value="fund.acronym" :key="index">
          {{fund.acronym}}
        </option>
      </select>
    </div>
    <div>
      <p class="fund-selector__paragraph"><strong>Nome: </strong>{{ selectedFundDetails.longName?? '-' }}</p>
      <p class="fund-selector__paragraph"><strong>Administração: </strong>{{ selectedFundDetails.admin?? '-' }}</p>
      <p class="fund-selector__paragraph"><strong>Ativos: </strong>{{ selectedFundDetails.assetsCount?? '-' }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import Fund from "@/interfaces/Fund";
import { computed, defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'FundSelector',

  components: {
  },

  props: {
    selectedFund: {
      type: String,
      default: ''
    },
    funds: {
      type: Array as PropType<Array<Fund>>,
      default: () => []
    },
  },

setup(props, { emit }) {

    return {
      selectedFundDetails: computed(() => {
        const fund = props.funds.find(f => f.acronym == props.selectedFund)
        return {...fund}
      }),
      fundSelected: ({target}: {target: HTMLInputElement}) => {
        emit('fund-selected', target?.value)
      },
    }
  }
});
</script>

<style scoped>
.fund-selector__paragraph {
  margin: 4px;
  font-size: small;
  text-align: justify;
}

.fund-selector__select {
  border: none; 
  border-bottom: 1px solid black; 
}

.fund-selector__select:focus-visible {
  outline: none; 
}
</style>