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
function drawChart() {
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

    // 데이터 중 최대값 기준으로 Y축 스케일 조정
    const maxValue = Math.max(...displayData.map((d) => d.value), 100);
    const scaleY = (H - margin.top - margin.bottom) / maxValue;

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
      const barH = item.value * scaleY;
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

// 테이블 업데이트
function updateTable() {
  try {
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    getFilteredData().forEach((item, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id}</td>
        <td>
          <input
            type="number"
            value="${item.value}"
            onchange="data.find(d=>d.id===${item.id}).value = Number(this.value)"
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

// ID 중복 검사 함수
function hasDuplicateIds(arr) {
  const ids = arr.map((d) => d.id);
  return new Set(ids).size !== ids.length;
}

// 정렬 변수 (true -> 오름차순, false -> 내림차순)
let sortAsc = true;

// 전체 동기화
function applyChanges() {
  // data를 ID 기본은 오름차순으로 정렬
  data.sort((a, b) => (sortAsc ? a.id - b.id : b.id - a.id));

  saveData(); // 캐시 저장

  // 정렬된 데이터를 반영해 JSON, 차트, 테이블에 모두 갱신
  updateJSON();
  drawChart();
  updateTable();
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
  const id = Number(document.getElementById("new-id").value);
  const value = Number(document.getElementById("new-value").value);

  // 숫자 여부
  if (isNaN(id) || isNaN(value)) {
    alert("ID와 값에 숫자를 입력하세요.");
    return;
  }

  // 정수 여부
  if (!Number.isInteger(id) || !Number.isInteger(value)) {
    alert("ID와 값에는 정수만 입력할 수 있습니다.");
    return;
  }

  // 음수 차단
  if (id < 0 || value < 0) {
    alert("ID와 값에는 음수를 입력할 수 없습니다.");
    return;
  }

  // 값 상한 검증
  const MAX_VALUE = 1000;
  if (value > MAX_VALUE) {
    alert(`값은 최대 ${MAX_VALUE}를 넘을 수 없습니다.`);
    return;
  }

  // 중복 검사
  if (data.some((d) => d.id === id)) {
    alert("ID가 중복됩니다. 다른 ID를 입력하세요.");
    return;
  }

  data.push({ id, value });
  applyChanges();

  // 입력창 초기화
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
  applyChanges();
}

// JSON 적용
function applyJson() {
  const textarea = document.getElementById("json-editor");
  const raw = textarea.value.trim();

  // 아무 입력도 없거나, 빈 배열만 있을 때
  if (!raw || raw === "[]" || raw === "[ ]") {
    // 텍스트박스 내용을 지우고 placeholder만 남김
    textarea.value = "";
    return;
  }

  try {
    const newData = JSON.parse(raw);
    if (!Array.isArray(newData)) {
      alert("JSON은 배열 형태여야 합니다.");
      return;
    }
    if (hasDuplicateIds(newData)) {
      alert("JSON 내에 중복된 ID가 있습니다.");
      return;
    }
    // 타입 검증
    for (const d of newData) {
      if (typeof d.id !== "number" || typeof d.value !== "number") {
        alert("각 항목은 { id: number, value: number } 형태여야 합니다.");
        return;
      }
    }
    data = newData;
    applyChanges();
  } catch (e) {
    alert(
      '유효하지 않은 JSON입니다.\n예시: [{"id":0,"value":75},{"id":1,"value":20}]'
    );
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

  // 임시 링크 생성 후 클릭으로 다운로드 트리거
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
