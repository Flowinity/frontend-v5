<template>
  <v-card class="text-center justify-center">
    <slot name="header"></slot>
    <v-container>
      <strong
        :class="{
          'text-gradient-custom text-gradient': !user,
          'text-gradient': user
        }"
        style="font-size: 24px"
      >
        {{ title }}
      </strong>
      <slot />
      <p style="font-size: 36px">
        {{ value }}
      </p>
    </v-container>
  </v-card>
</template>

<script lang="ts" setup>
defineProps(["title", "value", "gold", "primaryColor", "user"]);
</script>

<style scoped>
.text-gradient-custom {
  background: -webkit-linear-gradient(
    v-bind("$user.primaryColorResult(primaryColor, gold).gradient1"),
    v-bind("$user.primaryColorResult(primaryColor, gold).gradient2")
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
