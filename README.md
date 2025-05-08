# 프론트엔드 사전과제(아이엠파인) - 서교진


## 프로젝트 실행 순서
1. 레포지토리를 클론하거나 **Download ZIP** 버튼을 클릭해 압축 파일을 내려받습니다.
2. 내려받은 ZIP 파일의 압축을 해제합니다.
3. Chrome 브라우저를 열고, 압축 해제된 폴더에서 `index.html` 파일을 **드래그&드롭**하면 즉시 실행됩니다.


## 개발 스택
- **HTML/CSS/JavaScript**: 과제 요구 개발 스택
- **Canvas API**: canvas를 사용해 막대 그래프 등 구현


## 프로젝트 구조 설명
```
IMFINE/
├── .gitignore    – macOS·에디터 등 불필요한 파일을 Git에서 제외
├── README.md     – 프로젝트 개요, 실행 방법, 스택 및 구조 문서
├── index.html    – 애플리케이션 진입점으로 UI 레이아웃과 HTML 요소 정의
├── index.css     – 전체 화면 레이아웃, 버튼, 테이블, 툴팁 등 스타일
└── main.js       – Canvas 그래프 그리기, 데이터 검증·저장·UI 제어 로직
```


## 서비스 화면

### ⓪ 더미데이터 & 로컬스토리지
<table>
  <tr>
    <td align="center">
      <img width="450" alt="더미데이터" src="https://github.com/user-attachments/assets/8c67b369-e275-4f17-a3c0-cf228316af51">
      <br><b>더미데이터</b>
    </td>
  </tr>
</table>


### 1. 초기 더미데이터
- 처음 로드할 때 ```{"id":0, "value":75}``` 등 총 5개의 더미 데이터를 보여줍니다.

### 2. 로컬 스토리지 활용
- ```localStorage```는 사용자가 직접 지우기 전까지 데이터를 유지한다는 장점이 있어,
- 한 번 저장된 데이터는 페이지 새로고침 후에도 유지됩니다.
- 값 추가, 삭제, 수정 모두 **Apply** 시점에 로컬 스토리지에 커밋되어 일관성을 보장합니다.
- 스토리지 용량 초과 시 사용자에게 alert 메시지를 노출합니다.

---

### ① 그래프 & 다운로드
<table>
  <tr>
    <td align="center">
      <img width="450" alt="그래프" src="https://github.com/user-attachments/assets/10429890-3ab4-472c-b4cb-168ea38e480b">
      <br><b>그래프</b>
    </td>
    <td align="center">
      <img width="450" alt="정렬 스위치" src="https://github.com/user-attachments/assets/246d734a-2992-4713-a3b2-c845c9de02b1">
      <br><b>정렬 스위치</b>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td align="center">
      <img width="450" alt="툴팁" src="https://github.com/user-attachments/assets/ac98087d-37e5-4bc7-8c4d-935396b16cad">
      <br><b>툴팁</b>
    </td>
    <td align="center">
      <img width="450" alt="이미지 추출" src="https://github.com/user-attachments/assets/e3ea196e-bec7-45f9-8435-55db3cad9cfe">
      <br><b>이미지 추출</b>
    </td>
  </tr>
</table>


### 1. 그래프
- Canvas API를 사용해 축(axis)과 막대(bar)를 그렸습니다.
- getFilteredData()로 필터링된 값을 기반으로 scaleY를 계산하고, 기준선(100)도 그려주었습니다.
- resizeCanvas()로 컨테이너 너비에 맞춰 리사이징한 뒤, drawChart(progress)로 애니메이션도 구현했습니다.

### 2. 정렬 토글 스위치
- 기본값은 오름차순(sortAsc = true)이며, 체크박스 변화를 감지해 sortAsc를 반전시킵니다.
- 변경 시 applyChanges()를 호출해 재정렬한 뒤 차트, 테이블, JSON을 다시 렌더링합니다.

### 3. 툴팁
- canvas.addEventListener('mousemove')에서 마우스 좌표를 바 위치와 대조해 호버한 항목을 찾습니다.
- 찾은 항목이 있을 경우, tooltip 요소를 e.clientX/Y 위치에 띄워 "ID:x, 값:y"를 표시합니다.

### 4. 이미지 추출하기
- `이미지 추출하기` 버튼 클릭 시 canvas.toDataURL('imgage/png')으로 PNG 데이터 URL을 만들고,
- ```chart.png```를 생성해 파일을 다운로드합니다.

---

### ② 값 편집

<table>
  <tr>
    <td align="center">
      <img width="300" alt="값 편집" src="https://github.com/user-attachments/assets/c44f1792-af61-4d7c-a0d7-b86fde6be92b">
      <br><b>값 편집</b>
    </td>
    <td align="center">
      <img width="300" alt="유효성 검사" src="https://github.com/user-attachments/assets/d1f7e86e-ed25-43e7-a811-5151169f74a3">
      <br><b>유효성 검사</b>
    </td>
    <td align="center">
      <img width="300" alt="데이터 삭제" src="https://github.com/user-attachments/assets/46125b73-1ca0-4c6b-8144-d02abd0533e8">
      <br><b>데이터 삭제</b>
    </td>
  </tr>
</table>


### 1. 값 수정 & 저장
- updateTable()로 현재 data를 테이블로 렌더링합니다.
- 사용자가 숫자를 바꾼 뒤 Apply 버튼을 누르면 applyChanges()가 실행되고,
- 테이블에서 값을 읽어 새 배열을 만든 뒤 validateData()로 검증합니다.
- 유효하면 ```로컬스토리지```에 저장하고, 차트, 테이블, JSON에 모두 갱신합니다.

### 2. 유효성 검사
- ```<input type="number"> 에 oninput="this.value=this.value.replace(/[^0-9]/g,'')"``` 를 달아 숫자 외 입력을 차단했습니다.
- 값 편집에서는 따로 ID는 수정할 수 없으며, 값만 변경 가능합니다.
- 최대값을 500으로 제한하여 501과 같은 값을 입력하였을 경우 alert를 띄우며,
- 사용자 경험 향상을 위해 이전 값으로 롤백되게 처리하였습니다.


### 3. 삭제
- 각 행의 삭제 버튼 클릭 시 ```confirm 창을 띄워 "정말 삭제하시겠습니까?"```로 확인을 받습니다.
- 확인을 눌러야만 해당 항목이 삭제되며, 취소하면 그대로 유지되어 실수로 삭제되는 일을 방지하였습니다.

---

### ③ 값 추가

<table>
  <tr>
    <td align="center">
      <img width="450" alt="값 추가" src="https://github.com/user-attachments/assets/62e3d089-519b-423b-8567-bc6e42a6ecab">
      <br><b>값 추가</b>
    </td>
    <td align="center">
      <img width="450" alt="유효성 검사" src="https://github.com/user-attachments/assets/a5ce0c70-2a45-4b52-a743-130da33cf9c3">
      <br><b>유효성 검사</b>
    </td>
  </tr>
</table>


### 1. 추가 및 정렬
- 검증 통과 시 data.push 후 applyChanges 호출한 뒤
- apply 버튼을 누르면 기본적으로 오름차순으로 정렬됩니다.

### 2. 유효성 검사
- 빈 칸 검사: ID 또는 값 중 하나라도 비어 있으면 "ID와 값을 모두 입력해주세요." 알림을 띄웁니다.
- 숫자/음수 검사: ```<input type="number"> + oninput 필터링(this.value.replace(/[^0-9]/g, ''))```으로 음수/문자 입력 자체를 막았습니다.
- 최대값 검사: 값이 500이 넘으면 ```"값은 최대 500을 넘을 수 없습니다."``` 알림을 띄웁니다.
- 중복 ID 검사: hasDuplicateIds()로 중복을 확인하여 ```"중복된 ID가 있습니다. 서로 다른 ID를 사용해주세요."``` 알림을 띄웁니다.

### 3. 입력창 초기화
- 값 추가가 완료되면 입력창을 자동으로 비워 다음 입력에 대비합니다.

---

### ④ 값 고급 편집

<table>
  <tr>
    <td align="center">
      <img width="450" alt="값 고급 추가" src="https://github.com/user-attachments/assets/d730f6df-0653-42ab-98f9-a5d652da2ca8">
      <br><b>값 고급 추가</b>
    </td>
    <td align="center">
      <img width="450" alt="값 고급 삭제" src="https://github.com/user-attachments/assets/6e05f71f-9e23-450d-8b43-2dc711a68e08">
      <br><b>값 고급 삭제</b>
    </td>
  </tr>
</table>


### 1. 추가, 삭제 및 편집
- JSON 에디터에 {"id":10, "value"75"} 형태로 작성하고 Apply 클릭 시 추가됩니다.
- 입력란이 빈 문자열이 되면 전체 데이터 삭제 후 ```placeholder 예시```가 노출됩니다.
- 배열에서 객체 항목을 지우면 해당 항목이 삭제됩니다.

### 2. 유효성 검사
- 잘못된 JSON 문법일 경우 ```"유효하지 않은 JSON입니다."``` 알람을 띄웁니다.
- validateData()로 정수만 허용, 음수 금지, 최대값 초과 시 경고, 중복 ID 금지 등을 검사합니다.

### 3. 자동 포맷팅
- 적용 성공 시 updateJSON()에서 사람이 읽기 좋은 들여쓰기를 적용하여 에디터에 다시 표시됩니다.

---

### ⑤ 데이터 필터링

<table>
  <tr>
    <td align="center">
      <img width="300" alt="ID 필터링" src="https://github.com/user-attachments/assets/6bcef55f-8f1a-438a-8c8f-0e500b8a572a">
      <br><b>ID 필터링</b>
    </td>
    <td align="center">
      <img width="300" alt="값 필터링" src="https://github.com/user-attachments/assets/d3c8c9c3-bcf0-4a0a-8f70-06afc49600e7">
      <br><b>값 필터링</b>
    </td>
    <td align="center">
      <img width="300" alt="유효성 검사" src="https://github.com/user-attachments/assets/10ec6cbd-79dd-41f5-ac8e-c4f369c7fc32">
      <br><b>유효성 검사</b>
    </td>
  </tr>
</table>


### 1. 필터링
- 드롭다운에서 ID와 값 필드를 선택할 수 있습니다.
- 최소, 최대 범위를 지정하면 선택한 필드와 범위에 맞는 데이터만 보여줍니다.
- reset 버튼 클릭 시 전체 데이터를 다시 표시합니다.

### 2. 유효성 검사
- 최소값이 최대값보다 크게 입력한 경우 ```"최소값이 최대값보다 클 수 없습니다."```라고 알림을 띄웁니다.
