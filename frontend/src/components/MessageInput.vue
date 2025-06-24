<template>
  <div class="message-input-form p-3 bg-white border-top">
    <form @submit.prevent="handleSend">
      <div class="input-group">
        <!-- 이미지 파일 선택 input -->
        <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" style="display: none;" />

        <!-- 일반 첨부 파일 input -->
        <input ref="attachmentInput" type="file" @change="handleAttachmentChange"
               accept=".txt,.pdf,.md,.py,.js,.csv,.json,.html,.log,.xml,.yaml,.toml"
               style="display: none;" />

        <!-- 버튼: 이미지 선택 -->
        <button class="btn btn-outline-secondary" type="button" @click="triggerFileInput" :disabled="isLoading">🖼️</button>

        <!-- 버튼: 일반 첨부파일 선택 -->
        <button class="btn btn-outline-secondary" type="button" @click="triggerAttachmentInput" :disabled="isLoading">📎</button>

        <!-- 메시지 입력 필드 -->
        <input v-model="localInput" type="text" class="form-control"
               placeholder="메시지를 입력하세요..." :disabled="isLoading" />

        <!-- 전송 버튼 -->
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
const selectedAttachment = ref(null);

// props 변경 → localInput 동기화
watch(() => props.input, (val) => {
  localInput.value = val;
});

// localInput 변경 시 부모에 반영
watch(localInput, (val) => {
  emit('update:input', val);
});

// 이미지 input 트리거
const triggerFileInput = () => {
  fileInput.value?.click();
};

// 첨부파일 input 트리거
const triggerAttachmentInput = () => {
  attachmentInput.value?.click();
};

// 이미지 선택 처리
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    emit('file-selected', file);
  }
};

// 첨부파일 선택 처리
const handleAttachmentChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedAttachment.value = file;
  }
};

// 메시지 전송: formData 구성 후 emit
const handleSend = () => {
  const formData = new FormData();
  formData.append('message', localInput.value);

  if (selectedAttachment.value) {
    formData.append('attachment', selectedAttachment.value);
  }

  emit('send', formData);

  localInput.value = '';
  selectedAttachment.value = null;
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
