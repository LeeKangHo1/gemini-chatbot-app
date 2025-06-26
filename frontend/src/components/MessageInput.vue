<!-- 📄 파일 경로: src/components/MessageInput.vue -->
<template>
  <div class="message-input-form p-3 bg-white border-top">
    <form @submit.prevent="handleSend">
      <div v-if="selectedAttachment" class="mb-2 small text-muted">
        첨부된 파일: {{ selectedAttachment.name }}
        <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="clearAttachment">❌</button>
      </div>

      <div class="input-group">
        <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" multiple style="display: none;" />
        <input ref="attachmentInput" type="file" @change="handleAttachmentChange"
               accept=".txt,.pdf,.md,.py,.js,.csv,.json,.html,.log,.xml,.yaml,.toml"
               style="display: none;" />

        <button class="btn btn-outline-secondary" type="button" @click="triggerFileInput" :disabled="isLoading">🖼️</button>
        <button class="btn btn-outline-secondary" type="button" @click="triggerAttachmentInput" :disabled="isLoading">📎</button>

        <input v-model="localInput" type="text" class="form-control" placeholder="메시지를 입력하세요..." :disabled="isLoading" />
        <button class="btn btn-primary" type="submit" :disabled="isLoading">전송</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  input: String,
  isLoading: Boolean
});
const emit = defineEmits(['update:input', 'send', 'file-selected']);

const localInput = ref(props.input);
const fileInput = ref(null);
const attachmentInput = ref(null);
const selectedImages = ref([]); // ✅ 여러 이미지 저장
const selectedAttachment = ref(null);

watch(() => props.input, (val) => {
  localInput.value = val;
});
watch(localInput, (val) => {
  emit('update:input', val);
});

const triggerFileInput = () => fileInput.value?.click();
const triggerAttachmentInput = () => attachmentInput.value?.click();

const handleFileChange = (event) => {
  const files = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
  selectedImages.value = files;
  emit('file-selected', files); // ✅ 배열로 emit
};

const handleAttachmentChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedAttachment.value = file;
  }
};

const clearAttachment = () => {
  selectedAttachment.value = null;
  attachmentInput.value.value = null;
};

const handleSend = () => {
  const formData = new FormData();

  if (!localInput.value && selectedAttachment.value) {
    const fileName = selectedAttachment.value.name;
    localInput.value = `${fileName} 파일 분석해줘`;
  }

  formData.append('message', localInput.value);

  if (selectedAttachment.value) {
    formData.append('attachment', selectedAttachment.value);
  }

  selectedImages.value.forEach((img) => {
    formData.append('imageFiles', img); // ✅ key는 imageFiles로 여러 개 append
  });

  emit('send', formData);

  localInput.value = '';
  selectedAttachment.value = null;
  selectedImages.value = [];
};
</script>

<style scoped>
.message-input-form {
  background-color: #ffffff;
  border-top: 1px solid #e0e5eb;
  padding: 1rem;
}

.form-control {
  border: 1px solid #ced4da;
}

.form-control:focus {
  outline: none;
  box-shadow: none;
}
</style>
