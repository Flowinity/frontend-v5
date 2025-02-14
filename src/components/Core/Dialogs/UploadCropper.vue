<template>
  <CoreDialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      {{ title || $t("dialogs.uploadCropper.title") }}
    </template>
    <v-card-text>
      <v-file-input
        v-model="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
        :label="$t('dialogs.uploadCropper.label')"
      />
      <vue-cropper
        v-if="result && file?.type !== 'image/gif'"
        id="banner-editor"
        :key="key"
        ref="cropper"
        :aspect-ratio="parseInt(aspectRatio)"
        :src="result"
        alt="banner"
      />
      <p v-else-if="result">Cropping unsupported on GIFs.</p>
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-if="result"
        @click="
          $emit('finish', file);
          $emit('update:modelValue', false);
        "
      >
        Skip Crop
      </v-btn>
      <v-btn v-if="supportsRemoval" color="red" @click="$emit('remove')">
        {{ removeText || $t("dialogs.uploadCropper.removeProfile") }}
      </v-btn>
      <v-spacer />
      <v-btn
        @click="
          $emit('update:modelValue', false);
          file = undefined;
          result = undefined;
        "
      >
        {{ $t("generic.cancel") }}
      </v-btn>
      <v-btn color="primary" :loading="loading" @click="save">
        {{ $t("generic.save") }}
      </v-btn>
    </v-card-actions>
  </CoreDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueCropper from "vue-cropperjs";
import CoreDialog from "@/components/Core/Dialogs/Dialog.vue";
import "cropperjs/dist/cropper.css";

export default defineComponent({
  name: "UploadCropper",
  components: { CoreDialog, VueCropper },
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: undefined
    },
    aspectRatio: {
      type: String,
      default: undefined
    },
    removeText: {
      type: String,
      default: undefined
    },
    supportsRemoval: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:modelValue", "finish", "remove"],
  data() {
    return {
      file: undefined as File | undefined,
      result: undefined as string | undefined,
      loading: false,
      key: 0
    };
  },
  watch: {
    async file() {
      if (!this.file) return;
      this.result = undefined;
      await this.fileReader();
      this.key++;
    },
    modelValue() {
      this.file = undefined;
      this.result = undefined;
    }
  },
  methods: {
    async fileReader() {
      if (!this.file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.result = reader.result as string;
        return this.result;
      };
      reader.readAsDataURL(this.file);
    },
    async save() {
      if (!this.file) return;
      if (!this.$refs.cropper) {
        this.$emit("finish", this.file[0]);
        this.$emit("update:modelValue", false);
        return;
      }
      const file = this.$functions.base64ToFile(
        //@ts-ignore
        this.$refs.cropper.getCroppedCanvas().toDataURL("image/png"),
        "tpu-cropped.png"
      );
      this.loading = true;
      await this.$emit("finish", file);
      this.$emit("update:modelValue", false);
      this.loading = false;
    }
  }
});
</script>
