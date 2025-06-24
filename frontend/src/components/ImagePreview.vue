<!-- src/components/ImagePreview.vue -->
<template>
  <div class="image-preview-wrapper p-3 border-top">
    <div class="image-preview-container">
      <img :src="imageUrl" alt="Image preview" class="img-thumbnail" />
      <button class="btn-close" @click="$emit('remove')" aria-label="Remove image"></button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  imageUrl: String
})
const emit = defineEmits(['remove'])
</script>

<style scoped>
.image-preview-wrapper {
  background-color: #f8f9fa;
}
.image-preview-container {
  position: relative;
  display: inline-block;
  max-width: 150px;
}
.image-preview-container .img-thumbnail {
  max-width: 100%;
  height: auto;
}
.image-preview-container .btn-close {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: white;
  border-radius: 50%;
  padding: 0.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
</style>
