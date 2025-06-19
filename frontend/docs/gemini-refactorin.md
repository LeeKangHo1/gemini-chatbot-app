## 6월 19일 진행

네, 그럼요. 처음 제시해주신 코드와 우리가 함께 리팩터링한 최종 코드가 어떻게 달라졌는지, 그 이유와 함께 명확하게 정리해 드리겠습니다.

### 총평: "기억력 없는 챗봇"에서 "기억력 좋고 안전한 챗봇"으로의 진화

가장 큰 변화는 애플리케이션의 아키텍처를 **Stateless(상태 비저장)**에서 **Stateful(상태 저장)** 방식으로 전환한 것입니다. 이로 인해 코드의 역할과 책임이 재분배되었고, 부가적으로 보안과 사용자 경험이 크게 향상되었습니다.

---

### 1. 백엔드 (Flask) 변경 사항

#### `backend/app/api/chat.py`
*   **[핵심] 세션 관리 기능 추가**:
    *   **Before**: 매 요청마다 `model.start_chat(history=...)`를 호출하여 새로운 대화 세션을 만들었습니다. 서버는 아무것도 기억하지 못했습니다.
    *   **After**: 서버 메모리에 `chat_sessions = {}` 딕셔너리를 두어 각 사용자의 `ChatSession` 객체를 `sessionId`와 함께 저장하고 관리합니다. 이로써 서버가 대화의 맥락을 "기억"하게 되었습니다.
*   **API 요청/응답 구조 변경**:
    *   **Before**: 요청 시 `message`와 `history`를 받았습니다.
    *   **After**: 요청 시 `message`, `sessionId`(선택), `history`(첫 요청 시에만)를 받습니다. 응답으로 `reply`와 함께 `sessionId`를 돌려주어 프론트엔드가 다음 요청에 사용할 수 있게 합니다.
*   **로깅 개선**:
    *   **Before**: `print()` 문으로 디버깅했습니다.
    *   **After**: `from flask import current_app`을 통해 Flask의 정식 로거(`current_app.logger`)를 사용하여 로그를 기록합니다. 이는 실제 운영 환경에 더 적합합니다.

---

### 2. 프론트엔드 (Vue) 변경 사항

#### `frontend/src/stores/chatStore.js`
*   **`sendHistoryCount` 상태 제거**:
    *   **Before**: 프론트엔드가 보낼 대화 기록의 개수를 직접 관리했습니다.
    *   **After**: 서버가 전체 대화 기록을 관리하므로 이 상태 자체가 불필요해져 제거되었습니다. 코드가 단순해졌습니다.
*   **`sessionId` 상태 추가**:
    *   **Before**: 없었습니다.
    *   **After**: 서버로부터 받은 `sessionId`를 저장하기 위한 `sessionId: null` 상태를 추가했습니다. 이 ID는 대화의 "이름표" 역할을 합니다.
*   **[핵심] 로컬 저장소(localStorage) 연동**:
    *   **Before**: 브라우저를 새로고침하면 모든 대화 내용이 사라졌습니다.
    *   **After**:
        1.  스토어 초기화 시 `localStorage`에서 이전 대화 기록(`messages`)을 불러옵니다.
        2.  `$subscribe` 액션을 이용해 `messages` 배열에 변경이 생길 때마다 자동으로 `localStorage`에 저장하는 기능을 추가했습니다. 이로써 사용자 경험(UX)이 크게 향상되었습니다.

#### `frontend/src/services/api.js`
*   **API 호출 함수 시그니처 변경**:
    *   **Before**: `sendMessageToBot(message, history)`
    *   **After**: `sendMessageToBot(message, history, sessionId)`로 변경되어 `sessionId`를 함께 보낼 수 있게 되었습니다.

#### `frontend/src/services/chatService.js`
*   **대화 기록 전송 로직 변경**:
    *   **Before**: `sendHistoryCount`에 맞춰 매번 대화 기록의 일부를 잘라서 보냈습니다. (또한, 봇 메시지를 제외하는 버그가 있었습니다.)
    *   **After**:
        1.  `sessionId`가 **없을 때(첫 요청)**만 `localStorage`에서 불러온 전체 대화 기록을 API에 전송하여 서버가 맥락을 이해하도록 합니다.
        2.  `sessionId`가 **있을 때(이후 모든 요청)**는 대화 기록을 전혀 보내지 않아 데이터 전송량을 획기적으로 줄였습니다.
*   **세션 ID 처리 로직 추가**:
    *   **Before**: 없었습니다.
    *   **After**: 서버로부터 응답받은 `sessionId`를 `chatStore`에 저장하는 로직이 추가되었습니다.

#### `frontend/src/views/ChatView.vue`
*   **UI 요소 제거**:
    *   **Before**: "최근 몇 개의 메시지를 보낼까요?"를 설정하는 `<select>` 드롭다운 메뉴가 있었습니다.
    *   **After**: `sendHistoryCount` 기능이 사라졌으므로 해당 UI를 완전히 제거하여 인터페이스를 단순화했습니다.
*   **[핵심] 보안 강화 (XSS 방지)**:
    *   **Before**: `marked` 라이브러리가 변환한 HTML을 `v-html`로 바로 렌더링하여 XSS 공격에 취약했습니다.
    *   **After**:
        1.  `dompurify` 패키지를 설치했습니다.
        2.  `renderMarkdown` 함수에서 `marked`의 결과물을 `DOMPurify.sanitize()`로 "소독"하는 과정을 추가했습니다. 이로써 악의적인 스크립트가 실행되는 것을 원천 차단하여 앱을 안전하게 만들었습니다.
*   **스토어 구독 활성화**:
    *   **Before**: 없었습니다.
    *   **After**: `onMounted` 훅에서 `chatStore.subscribeToChanges()`를 호출하여 `localStorage` 자동 저장 기능을 활성화시켰습니다.