<!-- src/views/ChatView.vue -->
<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '@/stores/chatStore';
import { marked } from 'marked'; // <--- 1. marked 라이브러리 임포트

const chatStore = useChatStore();
const { messages, isLoading } = storeToRefs(chatStore);

const userInput = ref('');
const messageContainer = ref(null);

// 2. 봇의 메시지를 Markdown으로 변환하는 computed 속성
const renderMarkdown = (text) => {
  // marked.parse가 비동기가 될 수 있으므로 동기 옵션 사용 또는 비동기 처리
  return marked.parse(text, { breaks: true, gfm: true });
};

watch(messages, () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}, { deep: true });

const handleSendMessage = async () => {
  const message = userInput.value.trim();
  if (!message) return;
  userInput.value = '';
  await chatStore.sendMessage(message);
};
</script>

<template>
  <div class="chat-wrapper d-flex flex-column">
    <!-- 3. 메시지 목록에 TransitionGroup 적용 -->
    <transition-group name="message-fade" tag="div" class="message-list flex-grow-1 p-3" ref="messageContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item d-flex mb-4"
        :class="{ 'user': message.role === 'user', 'bot': message.role === 'bot' }"
      >
        <!-- 4. 아바타 추가 -->
        <div class="avatar">
          <span v-if="message.role === 'bot'">🤖</span>
          <span v-else>🧑</span>
        </div>
        
        <div class="message-content">
          <div
            class="message-bubble"
            :class="{
              'bg-primary-subtle': message.role === 'user',
              'bg-light': message.role === 'bot',
              'border': message.role === 'bot',
              'text-danger border-danger': message.isError
            }"
          >
            <!-- 5. 봇 메시지는 v-html로 Markdown 렌더링, 사용자 메시지는 그대로 표시 -->
            <div v-if="message.role === 'bot'" v-html="renderMarkdown(message.text)" class="markdown-content"></div>
            <p v-else class="m-0">{{ message.text }}</p>
          </div>
        </div>
      </div>

      <!-- 로딩 인디케이터도 아바타와 함께 표시 -->
      <div v-if="isLoading" key="loading" class="message-item d-flex mb-4 bot">
        <div class="avatar"><span>🤖</span></div>
        <div class="message-content">
          <div class="message-bubble bg-light border">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>
    </transition-group>

    <div class="message-input-form p-3 bg-white border-top">
      <form @submit.prevent="handleSendMessage">
        <div class="input-group">
          <input
            v-model="userInput"
            type="text"
            class="form-control"
            placeholder="메시지를 입력하세요..."
            :disabled="isLoading"
            aria-label="Message input"
          />
          <button class="btn btn-primary" type="submit" :disabled="isLoading">전송</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 전체 채팅창 컨테이너
.chat-wrapper {
  // 레이아웃 및 크기 설정
  height: calc(100vh - 12rem);
  max-height: 700px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  // 입체감을 위한 디자인
  background-color: #ffffff;
  border: 1px solid #e0e5eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 30px -5px rgba(18, 22, 33, 0.15);
}

// 채팅 내역이 표시되는 영역
.message-list {
  background-color: #f0f4f8; // 채팅 내역 배경색 (차분한 하늘색)
  padding: 1.5rem !important;
  overflow-y: auto;
  flex-grow: 1;
}

// 개별 메시지 아이템 (아바타 + 말풍선 묶음)
.message-item {
  display: flex;
  align-items: flex-end;
  margin-bottom: 1.5rem; // 메시지 간 상하 여백

  // 사용자 메시지는 오른쪽 정렬
  &.user {
    flex-direction: row-reverse;
  }
}

// 아바타 (동그란 아이콘)
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  flex-shrink: 0; // 크기 고정
}

// 봇 아바타 스타일
.message-item.bot .avatar {
  background-color: #6c757d;
  margin-right: 1rem;
}

// 사용자 아바타 스타일
.message-item.user .avatar {
  background-color: #0d6efd;
  margin-left: 1rem;
}

// 말풍선 내용물 컨테이너
.message-content {
  max-width: 80%;
}

// 말풍선 자체 스타일
.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  p {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  // 사용자 말풍선
  .user & {
    border-top-right-radius: 0.25rem;
    background-color: #d1e7ff;
    color: #002b5c;
  }
  
  // 봇 말풍선
  .bot & {
    border-top-left-radius: 0.25rem;
    background-color: #ffffff; // 채팅 내역 배경보다 밝은 흰색
  }
}

// 봇 답변의 Markdown 콘텐츠 스타일
.markdown-content {
  :first-child { margin-top: 0; }
  :last-child { margin-bottom: 0; }
  
  p { margin-bottom: 0.5rem; }
  
  // 코드 블록
  pre {
    background-color: #282c34;
    color: #abb2bf;
    padding: 1rem;
    border-radius: 0.5rem;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  code {
    font-family: 'Courier New', Courier, monospace;
  }

  ul, ol {
    padding-left: 1.5rem;
  }
}

// 메시지 입력 폼 영역
.message-input-form {
  background-color: #ffffff; // 요청대로 흰색 배경 유지
  border-top: 1px solid #e0e5eb;
  padding: 1rem;
}

// 메시지 등장 애니메이션
.message-fade-enter-active {
  transition: all 0.3s ease-out;
}
.message-fade-leave-active {
  transition: all 0.2s ease-in;
}
.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 타이핑 인디케이터 (로딩 중)
.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #9E9EA1;
  border-radius: 50%;
  display: inline-block;
  animation: wave 1.3s infinite;
  margin: 0 2px;
  
  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }
  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
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