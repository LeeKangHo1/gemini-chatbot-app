<!-- src/components/MessageInput.vue -->
<template>
  <div class="message-input-form p-3 bg-white border-top">
    <form @submit.prevent="handleSend">
      <div class="input-group">
        <input ref="fileInput" type="file" @change="handleFileChange" accept="image/*" style="display: none;" />
        <button class="btn btn-outline-secondary" type="button" @click="triggerFileInput" :disabled="isLoading">📎</button>
        <input v-model="localInput" type="text" class="form-control" placeholder="메시지를 입력하세요..." :disabled="isLoading" aria-label="Message input" />
        <button class="btn btn-primary" type="submit" :disabled="isLoading">전송</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  input: String,
  isLoading: Boolean
})
const emit = defineEmits(['update:input', 'send', 'file-selected'])

const localInput = ref(props.input)

watch(() => props.input, (val) => {
  localInput.value = val
})

watch(localInput, (val) => {
  emit('update:input', val)
})

const fileInput = ref(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('file-selected', file)
  }
}

const handleSend = () => {
  emit('send')
}
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
