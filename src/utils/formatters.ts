
export const formatCurrencyBrl = (number: number) => {
  return number.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})
}