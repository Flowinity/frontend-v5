<template>
  <v-img
    v-if="announcement"
    :src="announcement.image || 'https://assets.flowinity.com/home/8th.png'"
    :alt="announcement.title"
    max-height="300"
    min-height="300"
    width="100%"
    class="d-flex mx-auto"
    aspect-ratio="32/5"
    cover
  />
</template>

<script setup lang="ts">
import type {
  Announcement,
  AnnouncementQuery
} from "@/troploservices-gql/graphql";

defineProps<{
  announcement:
    | Announcement
    | null
    | undefined
    | AnnouncementQuery["announcement"];
}>();
</script>

<style scoped></style>
