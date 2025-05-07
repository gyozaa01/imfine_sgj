// 최대값 상수
const MAX_VALUE = 500;

// 공통 검증 함수
function validateData(items) {
  // 1) ID, 값 -> 타입, 정수, 음수, 최대값 검사
  for (const { id, value } of items) {
    if (!Number.isInteger(id) || id < 0) {
      alert("ID는 0 이상의 정수만 가능합니다.");
      return false;
    }
    if (!Number.isInteger(value) || value < 0) {
      alert("값은 0 이상의 정수만 가능합니다.");
      return false;
    }
    if (value > MAX_VALUE) {
      alert(`값은 최대 ${MAX_VALUE}을 넘을 수 없습니다.`);
      return false;
    }
  }

  // 2) 중복 ID 검사
  if (hasDuplicateIds(items)) {
    alert("중복된 ID가 있습니다. 서로 다른 ID를 사용해주세요.");
    return false;
  }

  return true;
}

// ID 중복 검사
function hasDuplicateIds(arr) {
  const ids = arr.map((d) => d.id);
  return new Set(ids).size !== ids.length;
}

// 로컬 스토리지에서 불러오기
function loadData() {
  const raw = localStorage.getItem("chartData");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  // 캐시가 없거나 파싱 실패 시 기본 더미 반환
  return [
    // 더미 데이터
    { id: 0, value: 75 },
    { id: 1, value: 20 },
    { id: 2, value: 80 },
    { id: 3, value: 100 },
    { id: 4, value: 70 },
  ];
}

// 로컬스토리지에 저장
function saveData() {
  try {
    localStorage.setItem("chartData", JSON.stringify(data));
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      alert(
        "저장 공간이 가득 찼습니다. 브라우저 로컬 스토리지를 비우거나\n" +
          "데이터 일부를 삭제해 주세요."
      );
    } else {
      console.error("Storage error:", e);
      alert("알 수 없는 저장 오류가 발생했습니다.");
    }
  }
}

// 초기 데이터 로딩
let data = loadData();

// 캔버스 & 컨텍스트 가져오기
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

const container = document.querySelector(".container");
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

// 필터 설정
let filterField = null;
let filterMin = null;
let filterMax = null;

// 필터된 데이터 반환
function getFilteredData() {
  if (!filterField) return data;
  return data.filter((item) => {
    const v = item[filterField];
    if (filterMin !== null && v < filterMin) return false;
    if (filterMax !== null && v > filterMax) return false;
    return true;
  });
}

// 캔버스 크기 조정
function resizeCanvas() {
  const style = getComputedStyle(container);
  const cw =
    container.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  canvas.width = cw;
  canvas.height = 300;
}

// 차트 그리기
function drawChart(progress = 1) {
  try {
    resizeCanvas();

    const W = canvas.width;
    const H = canvas.height;
    const displayData = getFilteredData();

    // 빈 데이터 처리
    if (displayData.length === 0) {
      // 캔버스 초기화
      ctx.clearRect(0, 0, W, H);
      // 메시지 표시
      ctx.fillStyle = "grey";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "16px Arial";
      ctx.fillText("필터된 결과가 없습니다.", W / 2, H / 2);
      return;
    }

    // 초기화
    ctx.clearRect(0, 0, W, H);

    // 축
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, H - margin.bottom);
    ctx.lineTo(W - margin.right, H - margin.bottom);
    ctx.stroke();

    // Y축 기준선 → 100
    const maxValue = Math.max(...displayData.map((d) => d.value), 100);
    const scaleY = (H - margin.top - margin.bottom) / maxValue;
    const y100 = H - margin.bottom - 100 * scaleY;
    ctx.strokeStyle = "#ddd";
    ctx.beginPath();
    ctx.moveTo(margin.left, y100);
    ctx.lineTo(W - margin.right, y100);
    ctx.stroke();
    ctx.fillStyle = "#000";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("100", margin.left - 5, y100);

    // 막대 너비와 간격 계산
    const totalW = W - margin.left - margin.right;
    const barW = Math.min(40, (totalW / displayData.length) * 0.6);
    const gap = (totalW - barW * displayData.length) / (displayData.length + 1);

    // 막대 그리기 & X축 레이블
    ctx.fillStyle = "#ccc";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    displayData.forEach((item, i) => {
      const x = margin.left + gap * (i + 1) + barW * i;
      const targetH = item.value * scaleY;
      const barH = targetH * progress;
      const y = H - margin.bottom - barH;
      ctx.fillRect(x, y, barW, barH);

      // ID 레이블
      ctx.fillStyle = "#000";
      ctx.fillText(item.id, x + barW / 2, H - margin.bottom + 5);
      ctx.fillStyle = "#ccc";
    });
  } catch (err) {
    console.error(err);
    alert("차트 렌더링 중 오류가 발생했습니다.");
  }
}

// 애니메이션
function animateChart(duration = 500) {
  const start = performance.now();
  function frame(now) {
    const elapsed = now - start;
    const p = Math.min(elapsed / duration, 1);
    drawChart(p);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// 테이블 업데이트
function updateTable() {
  try {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    getFilteredData().forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id}</td>
        <td>
          <input
            type="number"
            value="${item.value}"
            oninput="this.value = this.value.replace(/[^0-9]/g, '')"
          />
        </td>
        <td>
          <span class="delete" onclick="deleteValue(${item.id})">삭제</span>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (e) {
    console.error(e);
    alert("테이블 업데이트 중 오류가 발생했습니다.");
  }
}

// JSON 에디터 업데이트
function updateJSON() {
  const ta = document.getElementById("json-editor");

  if (data.length === 0) {
    // 데이터가 없으면 placeholder만 보이도록 value 비우기
    ta.value = "";
  } else {
    // 데이터가 있으면 실제 JSON 표시
    ta.value = JSON.stringify(data, null, 2);
  }
}

// 편집 롤백 처리
function handleInlineEdit(id, inputElem) {
  const oldValue = data.find((d) => d.id === id).value;
  const newValue = Number(inputElem.value);

  // 임시 변경
  data.find((d) => d.id === id).value = newValue;

  // 검증
  if (!validateData(data)) {
    // 실패 시 롤백
    data.find((d) => d.id === id).value = oldValue;
    inputElem.value = oldValue;
    return;
  }

  // 성공 시 저장 및 갱신
  saveData();
  animateChart();
  updateJSON();
}

// 정렬 변수 (true -> 오름차순, false -> 내림차순)
let sortAsc = true;

// 전체 동기화
function applyChanges() {
  // 원본 백업
  const oldData = data.slice();

  // 테이블에서 새 값 읽기
  const rows = Array.from(document.querySelectorAll("#table-body tr"));
  const newData = [];
  for (const row of rows) {
    const id = Number(row.cells[0].textContent);
    const valRaw = row.cells[1].querySelector("input").value.trim();
    if (valRaw === "") {
      alert("모든 값 칸에 숫자를 입력해주세요.");
      // rollback
      updateTable();
      return;
    }
    const value = Number(valRaw);
    if (isNaN(value)) {
      alert("값에는 숫자만 입력할 수 있습니다.");
      updateTable();
      return;
    }
    newData.push({ id, value });
  }

  // 유효성 검사
  if (!validateData(newData)) {
    // rollback
    data = oldData;
    updateJSON();
    updateTable();
    animateChart();
    return;
  }

  // 정렬 후 커밋
  data = newData.sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id));
  saveData(); // 캐시 저장

  // 정렬된 데이터를 반영해 JSON, 차트, 테이블에 모두 갱신
  updateJSON();
  updateTable();
  animateChart();
}

// 토글 이벤트 핸들러
const sortToggle = document.getElementById("sort-toggle");
const sortLabel = document.getElementById("sort-label");

sortToggle.addEventListener("change", () => {
  sortAsc = !sortToggle.checked;
  sortLabel.textContent = sortAsc ? "오름차순" : "내림차순";
  applyChanges();
});

// 값 추가
function addValue() {
  const idRaw = document.getElementById("new-id").value.trim();
  const valueRaw = document.getElementById("new-value").value.trim();

  // 1) 빈 값 검사
  if (!idRaw || !valueRaw) {
    alert("ID와 값을 모두 입력해주세요.");
    return;
  }

  // 2) 숫자 변환
  const id = Number(idRaw);
  const value = Number(valueRaw);

  if (isNaN(id) || isNaN(value)) {
    alert("ID와 값에 숫자만 입력할 수 있습니다.");
    return;
  }

  // 3) 새 데이터 합친 임시 배열로 검증
  const candidate = [...data, { id, value }];
  if (!validateData(candidate)) {
    // validateData 내부에서 alert이 띄워지고 false를 반환
    return;
  }

  // 4) 검증 통과 -> data 교체 및 화면 갱신
  data = candidate;
  applyChanges();

  // 5) 입력창 초기화
  document.getElementById("new-id").value = "";
  document.getElementById("new-value").value = "";
}

// 값 삭제
function deleteValue(id) {
  // 삭제 전 확인 alert
  const ok = confirm("정말 삭제하시겠습니까?");
  if (!ok) return;

  // 확인했으면 해당 항목 삭제
  data = data.filter((d) => d.id !== id);

  // 저장 및 UI 갱신
  saveData();
  updateJSON(); // JSON 에디터
  updateTable(); // 테이블
  animateChart(); // 차트
}

// JSON 적용
function applyJson() {
  const textarea = document.getElementById("json-editor");
  const oldRaw = textarea.value;
  const oldData = data.slice(); // data 배열 백업
  const raw = oldRaw.trim();

  // 빈 입력 -> 전체 삭제
  if (!raw) {
    data = [];
    saveData();
    updateJSON();
    updateTable();
    animateChart();
    return;
  }

  try {
    const newData = JSON.parse(raw);

    if (!Array.isArray(newData)) {
      alert("JSON은 배열 형태여야 합니다.");
      textarea.value = oldRaw;
      return;
    }
    if (!validateData(newData)) {
      // validateData 내부에서 alert 발생
      textarea.value = oldRaw;
      return;
    }

    // 여기서 바로 data 교체
    data = newData;
    saveData();
    // UI만 갱신
    updateJSON();
    updateTable();
    animateChart();
  } catch (e) {
    alert("유효하지 않은 JSON입니다.");
    textarea.value = oldRaw;
  }
}

// 필터 적용
function applyFilter() {
  filterField = document.getElementById("filter-field").value;
  const toNum = (id) => {
    const v = Number(document.getElementById(id).value);
    return isNaN(v) ? null : v;
  };
  filterMin = toNum("filter-min");
  filterMax = toNum("filter-max");
  drawChart();
  updateTable();
}

// 필터 초기화
function clearFilter() {
  document.getElementById("filter-field").value = "id";
  document.getElementById("filter-min").value = "";
  document.getElementById("filter-max").value = "";
  filterField = filterMin = filterMax = null;
  drawChart();
  updateTable();
}

// 툴팁 element 가져오기
const tooltip = document.getElementById("tooltip");

// canvas 위 마우스 무브 핸들러
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // drawChart 내부와 동일한 계산
  const W = canvas.width;
  const H = canvas.height;
  const displayData = getFilteredData();
  const maxValue = Math.max(...displayData.map((d) => d.value), 100);
  const scaleY = (H - margin.top - margin.bottom) / maxValue;
  const totalW = W - margin.left - margin.right;
  const barW = Math.min(40, (totalW / displayData.length) * 0.6);
  const gap = (totalW - barW * displayData.length) / (displayData.length + 1);

  // 마우스가 어떤 막대 위에 있는지 검사
  let found = null;
  displayData.forEach((item, i) => {
    const x = margin.left + gap * (i + 1) + barW * i;
    const y = H - margin.bottom - item.value * scaleY;
    if (mx >= x && mx <= x + barW && my >= y && my <= H - margin.bottom) {
      found = item;
    }
  });

  if (found) {
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
    tooltip.textContent = `ID: ${found.id}, 값: ${found.value}`;
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
});

// canvas에서 벗어나면 툴팁 숨기기
canvas.addEventListener("mouseout", () => {
  tooltip.style.display = "none";
});

// 이미지 다운로드 버튼 핸들러
const downloadBtn = document.getElementById("download-btn");
downloadBtn.addEventListener("click", () => {
  // 현재 차트가 그려진 canvas
  const canvas = document.getElementById("chart");

  // 데이터 URL 생성
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "chart.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// 초기 렌더
drawChart();
updateTable();
updateJSON();
