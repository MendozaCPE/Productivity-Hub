// ===================================
// CHARTS.JS - Chart Rendering System
// ===================================

class ChartRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Enable anti-aliasing for clear text, even if shapes are blocky
        this.ctx.imageSmoothingEnabled = true;
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
            // Palette: Hot Pink, Soft Periwinkle, Vivid Fuchsia, Rose, Deep Indigo
            colors = ['#ffffff', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373'],
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
            this.ctx.strokeStyle = '#262626'; // Darker grid for dark theme
            this.ctx.lineWidth = 1;
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

            // Draw bar
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.beginPath();
            this.ctx.rect(Math.round(x), Math.round(y), Math.round(width), Math.round(barHeight));
            this.ctx.fill();

            // Add border
            this.ctx.strokeStyle = '#404040';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw value on top - CLEAN FONT
            if (showValues && value > 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 11px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value, x + width / 2, y - 8);
            }

            // Draw label
            this.ctx.fillStyle = '#a3a3a3';
            this.ctx.font = '500 10px Inter';
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
            this.ctx.strokeStyle = '#262626';
            this.ctx.lineWidth = 1;
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
            const { values, color = '#ffffff', label = '' } = dataset;
            const pointSpacing = chartWidth / (values.length - 1 || 1);

            // Draw line
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
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

            // Draw points
            if (showPoints) {
                values.forEach((value, index) => {
                    const x = padding + index * pointSpacing;
                    const y = this.height - padding - (value / maxValue) * chartHeight;

                    // Outer square
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(Math.round(x - 5), Math.round(y - 5), 10, 10);

                    // Border
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(Math.round(x - 5), Math.round(y - 5), 10, 10);
                });
            }

            // Draw labels - CLEAN FONT
            if (datasetIndex === 0) {
                labels.forEach((label, index) => {
                    const x = padding + index * pointSpacing;
                    this.ctx.fillStyle = '#a3a3a3';
                    this.ctx.font = '500 10px Inter';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(label, x, this.height - padding + 20);
                });
            }
        });
    }

    // Helper: Lighten color
    lightenColor(color, percent) {
        return color;
    }
}

window.ChartRenderer = ChartRenderer;
