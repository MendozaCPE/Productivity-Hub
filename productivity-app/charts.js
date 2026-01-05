// ===================================
// CHARTS.JS - Chart Rendering System
// ===================================

class ChartRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Disable anti-aliasing for pixel look
        this.ctx.imageSmoothingEnabled = false;
        this.setupCanvas();
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Draw Bar Chart
    drawBarChart(options = {}) {
        this.clear();
        const {
            labels = [],
            values = [],
            // Palette: Hot Pink (#ec4899), Soft Periwinkle (#c7d2fe), Vivid Fuchsia (#d946ef), Rose (#f43f5e), Deep Indigo (#1e1b4b)
            colors = ['#ec4899', '#c7d2fe', '#d946ef', '#f43f5e', '#1e1b4b'],
            showGrid = true,
            showValues = true
        } = options;

        const padding = 40;
        const chartWidth = this.width - padding * 2;
        const chartHeight = this.height - padding * 2;
        const barWidth = chartWidth / values.length;
        const maxValue = Math.max(...values, 1);

        // Draw grid
        if (showGrid) {
            this.ctx.strokeStyle = '#1e1b4b'; // Deep Indigo
            this.ctx.lineWidth = 2; // Thicker grid lines
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, Math.round(y));
                this.ctx.lineTo(this.width - padding, Math.round(y));
                this.ctx.stroke();
            }
        }

        // Draw bars
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.2;
            const y = this.height - padding - barHeight;
            const width = barWidth * 0.6;

            // Draw bar (Solid color, no gradient)
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.beginPath();
            // Regular rect instead of roundRect
            this.ctx.rect(Math.round(x), Math.round(y), Math.round(width), Math.round(barHeight));
            this.ctx.fill();

            // Add border to bars
            this.ctx.strokeStyle = '#1e1b4b';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw value on top
            if (showValues && value > 0) {
                this.ctx.fillStyle = '#1e1b4b';
                this.ctx.font = '10px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value, x + width / 2, y - 10);
            }

            // Draw label
            this.ctx.fillStyle = '#1e1b4b';
            this.ctx.font = '8px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labels[index] || '', x + width / 2, this.height - padding + 20);
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

        // Calculate max value across all datasets
        const allValues = datasets.flatMap(d => d.values);
        const maxValue = Math.max(...allValues, 1);

        // Draw grid
        if (showGrid) {
            this.ctx.strokeStyle = '#1e1b4b';
            this.ctx.lineWidth = 2;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, Math.round(y));
                this.ctx.lineTo(this.width - padding, Math.round(y));
                this.ctx.stroke();
            }
        }

        // Draw each dataset
        datasets.forEach((dataset, datasetIndex) => {
            // Default color: Deep Indigo
            const { values, color = '#1e1b4b', label = '' } = dataset;
            const pointSpacing = chartWidth / (values.length - 1 || 1);

            // Draw line
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 4; // Thicker lines
            this.ctx.lineJoin = 'miter';
            this.ctx.beginPath();

            values.forEach((value, index) => {
                const x = padding + index * pointSpacing;
                const y = this.height - padding - (value / maxValue) * chartHeight;

                if (index === 0) {
                    this.ctx.moveTo(Math.round(x), Math.round(y));
                } else {
                    this.ctx.lineTo(Math.round(x), Math.round(y));
                }
            });

            this.ctx.stroke();

            // Draw points (Square points for pixel theme)
            if (showPoints) {
                values.forEach((value, index) => {
                    const x = padding + index * pointSpacing;
                    const y = this.height - padding - (value / maxValue) * chartHeight;

                    // Outer square
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(Math.round(x - 6), Math.round(y - 6), 12, 12);

                    // Border
                    this.ctx.strokeStyle = '#1e1b4b';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(Math.round(x - 6), Math.round(y - 6), 12, 12);
                });
            }

            // Draw labels
            if (datasetIndex === 0) {
                labels.forEach((label, index) => {
                    const x = padding + index * pointSpacing;
                    this.ctx.fillStyle = '#1e1b4b';
                    this.ctx.font = '8px "Press Start 2P"';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(label, x, this.height - padding + 20);
                });
            }
        });
    }

    // Helper: Lighten color (Simplified for pixel art, maybe reuse or remove if not needed)
    lightenColor(color, percent) {
        return color; // No gradients needed
    }
}

window.ChartRenderer = ChartRenderer;
