<template>
  <v-card :height="cardHeight" class="text-center justify-center">
    <v-container>
      <v-tabs v-model="tab" align-tabs="center" class="mb-3 mt-n3">
        <v-tab value="uploads">{{ $t("stats.uploads") }}</v-tab>
        <v-tab value="messages">{{ $t("stats.messages") }}</v-tab>
        <v-tab value="hours">{{ $t("stats.hours") }}</v-tab>
      </v-tabs>
      <template v-if="tab === 'uploads'">
        <strong
          :class="{
            'text-gradient-custom text-gradient': !user,
            'text-gradient': user
          }"
          style="font-size: 24px"
        >
          {{ $t("stats.uploadStats") }}
        </strong>
        <div class="mx-1">
          <Chart
            v-if="uploadGraph || $app.site.stats.uploadGraph"
            id="global-uploads"
            :color="primaryColorResult.primary"
            :data="uploadGraph || $app.site.stats.uploadGraph"
            :height="height"
            name="Uploads"
            type="line"
          />
        </div>
      </template>
      <template v-if="tab === 'messages'">
        <strong
          :class="{
            'text-gradient-custom text-gradient': !user,
            'text-gradient': user
          }"
          style="font-size: 24px"
        >
          {{ $t("stats.messageStats") }}
        </strong>
        <div class="mx-1">
          <Chart
            v-if="messageGraph || $app.site.stats.messageGraph"
            id="global-messages"
            :color="primaryColorResult.primary"
            :data="messageGraph || $app.site.stats.messageGraph"
            :height="height"
            name="Messages"
            type="line"
          />
        </div>
      </template>
      <template v-if="tab === 'hours'">
        <strong
          :class="{
            'text-gradient-custom text-gradient': !user,
            'text-gradient': user
          }"
          style="font-size: 24px"
        >
          {{ $t("stats.hourStats") }}
        </strong>
        <div class="mx-1">
          <Chart
            v-if="pulseGraph || $app.site.stats.pulseGraph"
            id="global-hours"
            :color="primaryColorResult.primary"
            :data="pulseGraph || $app.site.stats.pulseGraph"
            :height="height"
            name="Hours"
            type="line"
          />
        </div>
      </template>
    </v-container>
    <v-card-subtitle v-if="cache" class="text-left mt-n4">
      <small>
        {{ $t("generic.cache") }}: {{ $date($app.site._redis).fromNow() }}
      </small>
    </v-card-subtitle>
  </v-card>
</template>

<script lang="ts">
import Chart from "@/components/Core/Chart.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: { Chart },
  props: {
    uploadGraph: {
      type: Object
    },
    messageGraph: {
      type: Object
    },
    pulseGraph: {
      type: Object
    },
    height: {
      type: Number,
      default: 420
    },
    cardHeight: {
      type: Number,
      default: 555
    },
    gold: {
      type: Boolean,
      default: false
    },
    primaryColor: {
      type: String
    },
    user: {
      type: Boolean,
      default: false
    },
    cache: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tab: "uploads"
    };
  },
  computed: {
    primaryColorResult() {
      return this.$user.primaryColorResult(
        this.primaryColor || this.$user.theme.colors.primary,
        this.gold
      );
    }
  }
});
</script>

<style scoped>
.text-gradient-custom {
  background: -webkit-linear-gradient(
    v-bind("primaryColorResult.gradient1"),
    v-bind("primaryColorResult.gradient2")
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
