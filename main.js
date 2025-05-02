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

// 캔버스 크기 설정
canvas.width = canvas.clientWidth;
canvas.height = 300;

// 4) drawChart 함수
function drawChart() {
  const W = canvas.width;
  const H = canvas.height;
  const barWidth = 30;
  const gap = 20;

  // 초기화
  ctx.clearRect(0, 0, W, H);

  // 막대 그리기
  ctx.fillStyle = "#ccc";
  data.forEach((item, i) => {
    const x = gap + i * (barWidth + gap);
    const barH = item.value * 2;
    const y = H - barH;
    ctx.fillRect(x, y, barWidth, barH);
  });
}

// 초기 렌더
drawChart();
