<template>
  <CoreDialog
    :model-value="modelValue"
    max-width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      {{ $t("collections.settings.title") }}
    </template>
    <v-card-text v-if="collection">
      <v-text-field v-model="name" :autofocus="true" label="Name" required />
      <v-btn class="ml-n4" color="red" @click="removeBanner">
        {{ $t("collections.settings.removeBanner") }}
      </v-btn>
      <v-btn
        :loading="loading"
        class="float-right"
        @click="downloadCollectionAsZIPFile"
      >
        <v-icon class="mr-1" style="font-size: 20px">mdi-download</v-icon>
        {{ $t("collections.settings.export") }}
      </v-btn>
    </v-card-text>
    <v-card-actions v-if="collection" class="mt-2">
      <v-btn
        v-if="collection.userId === $user.user?.id"
        color="red"
        @click="deleteCollection"
      >
        {{ $t("collections.settings.delete") }}
      </v-btn>
      <v-spacer />
      <v-btn color="blue darken-1" @click="$emit('update:modelValue', false)">
        {{ $t("generic.cancel") }}
      </v-btn>
      <v-btn color="blue darken-1" @click="updateSettings">
        {{ $t("generic.update") }}
      </v-btn>
    </v-card-actions>
  </CoreDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CoreDialog from "@/components/Core/Dialogs/Dialog.vue";
import { Collection } from "@/gql/graphql";

export default defineComponent({
  components: { CoreDialog },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    collection: {
      type: Object as () => Collection,
      default: null
    }
  },
  emits: ["update:modelValue", "refreshCollection"],
  data() {
    return {
      loading: false,
      name: ""
    };
  },
  methods: {
    async updateSettings() {
      await this.axios.patch(`/collections/${this.collection?.id}`, {
        name: this.name
      });
      this.$toast.success("Collection settings updated.");
      this.$emit("update:modelValue", false);
    },
    async deleteCollection() {
      await this.axios.delete(`/collections/${this.collection?.id}`);
      this.$router.push("/collections");
      await this.$app.init();
    },
    async removeBanner() {
      await this.axios.delete(`/collections/${this.collection?.id}/banner`);
      this.$emit("refreshCollection");
    },
    async downloadCollectionAsZIPFile() {
      this.loading = true;

      const { data } = await this.axios.get(
        `/collections/${this.collection?.id}/download`,
        {
          responseType: "blob"
        }
      );
      const blob = new Blob([data], { type: "application/zip" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${this.collection?.name}.zip`;
      link.click();
      this.loading = false;
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler(val) {
        this.name = val?.name || "";
      }
    }
  }
});
</script>
