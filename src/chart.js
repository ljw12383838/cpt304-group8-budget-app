export function createChart(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  container.innerHTML = "";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const radius = 23;

  function drawSegment(color, start, end) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, start, end);
    ctx.stroke();
  }

  return function updateChart(income, expense) {
    const total = income + expense;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSegment("#ffffff", 0, 2 * Math.PI);

    if (total <= 0) {
      drawSegment("#c4b5fd", -Math.PI / 2, Math.PI * 1.5);
      return;
    }

    const expenseRatio = expense / total;
    drawSegment("#8b5cf6", -Math.PI / 2, Math.PI * 1.5);
    drawSegment("#ffb4a6", -Math.PI / 2, -Math.PI / 2 + expenseRatio * 2 * Math.PI);
  };
}
