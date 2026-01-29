// ===================================
// CHARTS.JS - Chart Rendering System
// ===================================

class ChartRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Enable anti-aliasing for clear text
        this.ctx.imageSmoothingEnabled = true;
        this.setupCanvas();

        // Handle resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            // Note: A real implementation would need to trigger a re-draw here
            // but since we call updateAllCharts on dashboard interval, it will self-correct
        });
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const parent = this.canvas.parentElement;
        const rect = parent.getBoundingClientRect();

        // Adjust for padding if needed, but usually taking parent width is good
        this.canvas.width = rect.width * dpr;
        // Fixed height or based on parent? Let's keep it responsive but with min height
        this.canvas.height = Math.max(300, rect.height) * dpr;

        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = Math.max(300, rect.height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Helper: Create Gradient
    createGradient(ctx, colorStr, y1, y2) {
        const gradient = ctx.createLinearGradient(0, y1, 0, y2);
        gradient.addColorStop(0, colorStr);
        gradient.addColorStop(1, this.adjustOpacity(colorStr, 0.2));
        return gradient;
    }

    adjustOpacity(color, opacity) {
        // Simple hex to rgba conversion
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return color;
    }

    // Draw Bar Chart
    drawBarChart(options = {}) {
        this.clear();
        const {
            labels = [],
            values = [],
            // Premium Palette
            colors = ['#c67c4e', '#e3a985', '#312e81', '#4f46e5', '#818cf8'],
            showGrid = true,
            showValues = true
        } = options;

        const padding = 40;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        const barWidth = (chartWidth / values.length) * 0.6;
        const gap = (chartWidth / values.length) * 0.4;
        const maxValue = Math.max(...values, 5); // Minimum scale of 5

        // Draw grid
        if (showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (let i = 0; i <= 5; i++) {
                const y = this.height - padding - (chartHeight / 5) * i;
                this.ctx.moveTo(padding, Math.round(y));
                this.ctx.lineTo(this.width - padding, Math.round(y));

                // Y-Axis Labels
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.font = '10px Inter';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(Math.round((maxValue / 5) * i), padding - 10, y + 3);
            }
            this.ctx.stroke();
        }

        // Draw bars
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            // Center the bar in its slot
            const slotWidth = chartWidth / values.length;
            const x = padding + index * slotWidth + (slotWidth - barWidth) / 2;
            const y = this.height - padding - barHeight;

            // Gradient Fill
            const color = colors[index % colors.length];
            const gradient = this.ctx.createLinearGradient(0, y, 0, this.height - padding);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, this.adjustOpacity(color, 0.6));

            this.ctx.fillStyle = gradient;

            // Rounded top corners
            this.ctx.beginPath();
            const radius = 6;
            this.ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
            this.ctx.fill();

            // Draw value on top
            if (showValues && value > 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value, x + barWidth / 2, y - 8);
            }

            // Draw label
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = '500 11px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labels[index] || '', x + barWidth / 2, this.height - padding + 20);
        });
    }

    // Draw Line Chart
    drawLineChart(options = {}) {
        this.clear();
        const {
            labels = [],
            datasets = [],
            showGrid = true,
            showPoints = true
        } = options;

        const padding = 40;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;

        const allValues = datasets.flatMap(d => d.values);
        const maxValue = Math.max(...allValues, 10);

        // Draw grid
        if (showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for (let i = 0; i <= 5; i++) {
                const y = this.height - padding - (chartHeight / 5) * i;
                this.ctx.moveTo(padding, Math.round(y));
                this.ctx.lineTo(this.width - padding, Math.round(y));

                // Y-Axis Labels
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                this.ctx.font = '10px Inter';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(Math.round((maxValue / 5) * i) + '%', padding - 10, y + 3);
            }
            this.ctx.stroke();
        }

        // Draw datasets
        datasets.forEach((dataset, datasetIndex) => {
            const { values, color = '#c67c4e', label = '' } = dataset;
            const pointSpacing = chartWidth / (values.length - 1 || 1);

            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            // Smooth curves
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            this.ctx.beginPath();

            // Store points for later (points drawing)
            const points = [];

            values.forEach((value, index) => {
                const x = padding + index * pointSpacing;
                const y = this.height - padding - (value / maxValue) * chartHeight;
                points.push({ x, y });

                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    // Cubic Bezier for smoothing
                    const prev = points[index - 1];
                    const midX = (prev.x + x) / 2;
                    this.ctx.bezierCurveTo(midX, prev.y, midX, y, x, y);
                }
            });

            this.ctx.stroke();

            // Gradient area under line
            this.ctx.lineTo(points[points.length - 1].x, this.height - padding);
            this.ctx.lineTo(points[0].x, this.height - padding);
            this.ctx.closePath();

            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, this.adjustOpacity(color, 0.2));
            gradient.addColorStop(1, this.adjustOpacity(color, 0.0));
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw points
            if (showPoints) {
                points.forEach((p, i) => {
                    // Only draw some points if there are too many
                    if (values.length > 15 && i % Math.ceil(values.length / 10) !== 0) return;

                    this.ctx.fillStyle = '#1e1e1e'; // Background color
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
                    this.ctx.fill();

                    this.ctx.strokeStyle = color;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    this.ctx.stroke();
                });
            }

            // Draw X-Axis labels
            if (datasetIndex === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.font = '500 11px Inter';
                this.ctx.textAlign = 'center';

                labels.forEach((label, index) => {
                    // Filter labels if too crowded
                    if (labels.length > 10 && index % Math.ceil(labels.length / 10) !== 0) return;

                    const x = padding + index * pointSpacing;
                    this.ctx.fillText(label, x, this.height - padding + 20);
                });
            }
        });
    }
}

window.ChartRenderer = ChartRenderer;
