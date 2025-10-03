<template>
  <div class="info-list-header">
    <h3>{{ props.title }}</h3>
  </div>
</template>

<script lang="ts" setup>

const props = defineProps<{
  title: string
}>()
</script>

<style scoped lang="less">
.info-list-header {
  height: 60px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E5E7EB;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
}
</style>
