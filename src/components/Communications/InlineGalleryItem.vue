<template>
  <v-card
    class="rounded-xl d-flex flex-column"
    elevation="8"
    style="cursor: pointer"
    @click="$emit('clickItem', item)"
  >
    <v-img
      :gradient="item.name ? 'to bottom, rgba(0,0,0,.1), rgba(0,0,0,1.0)' : ''"
      :src="
        !item?.media_formats?.gif
          ? 'https://i.troplo.com/i/' + item.attachment
          : item.media_formats.gif.url
      "
      class="white--text align-end"
      height="200px"
      transition="none"
    >
      <template #placeholder>
        <v-row align="center" class="fill-height ma-0" justify="center">
          <v-progress-circular color="grey lighten-5" indeterminate />
        </v-row>
      </template>
      <v-card-title>
        {{ item.name }}
      </v-card-title>
    </v-img>
  </v-card>
</template>

<script lang="ts" setup>
defineProps(["item"]);
defineEmits(["clickItem"]);
</script>
