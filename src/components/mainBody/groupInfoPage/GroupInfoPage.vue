<template>
{{ friendsStore.friendInfo }}
</template>
<script setup lang="ts">
import { useFriendsStore } from '@/stores/friendStore';

const friendsStore = useFriendsStore();

</script>
<style scoped lang="less"></style>
