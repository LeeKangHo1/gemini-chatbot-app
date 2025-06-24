<!-- src/components/TypingIndicator.vue -->
<template>
  <div class="typing-indicator">
    <span></span><span></span><span></span>
  </div>
</template>

<script setup>
// 별도 로직 없음 (단순 애니메이션 표시)
</script>

<style scoped>
.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #9E9EA1;
  border-radius: 50%;
  display: inline-block;
  animation: wave 1.3s infinite;
  margin: 0 2px;
}

.typing-indicator span:nth-of-type(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-of-type(3) {
  animation-delay: 0.4s;
}

@keyframes wave {
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-8px);
  }
}
</style>
