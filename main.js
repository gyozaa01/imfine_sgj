// 더미 데이터
const data = [
  { id: 0, value: 75 },
  { id: 1, value: 20 },
  { id: 2, value: 80 },
  { id: 3, value: 100 },
  { id: 4, value: 70 },
];

// 캔버스 & 컨텍스트 가져오기
const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

const container = document.querySelector(".container");
const margin = { top: 20, right: 20, bottom: 30, left: 30 };

function resizeCanvas() {
  const style = getComputedStyle(container);
  const cw =
    container.clientWidth -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight);
  canvas.width = cw;
  canvas.height = 300;
}

function drawChart() {
  resizeCanvas();

  const W = canvas.width;
  const H = canvas.height;

  // 데이터 중 최대값 기준으로 Y축 스케일 조정
  const maxValue = Math.max(...data.map((d) => d.value), 100);
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

  // Y축 기준선 -> 100
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
  const barW = Math.min(40, (totalW / data.length) * 0.6);
  const gap = (totalW - barW * data.length) / (data.length + 1);

  // 막대 그리기 & X축 레이블
  ctx.fillStyle = "#ccc";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  data.forEach((item, i) => {
    const x = margin.left + gap * (i + 1) + barW * i;
    const barH = item.value * scaleY;
    const y = H - margin.bottom - barH;
    ctx.fillRect(x, y, barW, barH);

    // ID 레이블
    ctx.fillStyle = "#000";
    ctx.fillText(item.id, x + barW / 2, H - margin.bottom + 5);
    ctx.fillStyle = "#ccc";
  });
}

function updateTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";
  data.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>
        <input type="number" value="${item.value}"
               onchange="data[${i}].value = Number(this.value)" />
      </td>
      <td><span class="delete" onclick="deleteValue(${item.id})">삭제</span></td>
    `;
    tbody.appendChild(row);
  });
}

function updateJSON() {
  document.getElementById("json-editor").value = JSON.stringify(data, null, 2);
}

// ID 중복 검사 함수
function hasDuplicateIds(arr) {
  const ids = arr.map((d) => d.id);
  return new Set(ids).size !== ids.length;
}

function applyChanges() {
  updateJSON();
  drawChart();
  updateTable();
}

function addValue() {
  const id = Number(document.getElementById("new-id").value);
  const value = Number(document.getElementById("new-value").value);
  if (isNaN(id) || isNaN(value)) {
    alert("ID와 VALUE에 숫자를 입력하세요.");
    return;
  }
  if (data.some((d) => d.id === id)) {
    alert("ID가 중복됩니다. 다른 ID를 입력하세요.");
    return;
  }
  data.push({ id, value });
  applyChanges();
}

function deleteValue(id) {
  data = data.filter((d) => d.id !== id);
  applyChanges();
}

function applyJson() {
  try {
    const newData = JSON.parse(document.getElementById("json-editor").value);
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
    alert("유효하지 않은 JSON입니다.");
  }
}

// 초기 렌더
drawChart();
updateTable();
updateJSON();
