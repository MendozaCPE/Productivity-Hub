// ===================================
// CHARTS.JS - Chart Rendering System
// ===================================

class ChartRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
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
    drawBarChart(data, options = {}) {
        this.clear();
        const {
            labels = [],
            values = [],
            colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'],
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
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(this.width - padding, y);
                this.ctx.stroke();
            }
        }

        // Draw bars
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.2;
            const y = this.height - padding - barHeight;
            const width = barWidth * 0.6;

            // Create gradient
            const gradient = this.ctx.createLinearGradient(x, y + barHeight, x, y);
            gradient.addColorStop(0, colors[index % colors.length]);
            gradient.addColorStop(1, this.lightenColor(colors[index % colors.length], 20));

            // Draw bar with animation effect
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, width, barHeight, 8);
            this.ctx.fill();

            // Draw value on top
            if (showValues && value > 0) {
                this.ctx.fillStyle = '#f1f5f9';
                this.ctx.font = 'bold 12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value, x + width / 2, y - 5);
            }

            // Draw label
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.font = '11px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labels[index] || '', x + width / 2, this.height - padding + 20);
        });
    }

    // Draw Line Chart
    drawLineChart(data, options = {}) {
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
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(this.width - padding, y);
                this.ctx.stroke();
            }
        }

        // Draw each dataset
        datasets.forEach((dataset, datasetIndex) => {
            const { values, color = '#6366f1', label = '' } = dataset;
            const pointSpacing = chartWidth / (values.length - 1 || 1);

            // Draw line
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();

            values.forEach((value, index) => {
                const x = padding + index * pointSpacing;
                const y = this.height - padding - (value / maxValue) * chartHeight;

                if (index === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            });

            this.ctx.stroke();

            // Draw points
            if (showPoints) {
                values.forEach((value, index) => {
                    const x = padding + index * pointSpacing;
                    const y = this.height - padding - (value / maxValue) * chartHeight;

                    // Outer circle
                    this.ctx.fillStyle = color;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
                    this.ctx.fill();

                    // Inner circle
                    this.ctx.fillStyle = '#1e293b';
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }

            // Draw labels
            if (datasetIndex === 0) {
                labels.forEach((label, index) => {
                    const x = padding + index * pointSpacing;
                    this.ctx.fillStyle = '#cbd5e1';
                    this.ctx.font = '11px Inter';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(label, x, this.height - padding + 20);
                });
            }
        });
    }

    // Draw Donut Chart
    drawDonutChart(data, options = {}) {
        this.clear();
        const {
            values = [],
            labels = [],
            colors = ['#6366f1', '#8b5cf6', '#14b8a6', '#10b981', '#f59e0b', '#ef4444'],
            showLabels = true,
            innerRadius = 0.6
        } = options;

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(centerX, centerY) - 40;
        const total = values.reduce((sum, val) => sum + val, 0);

        let currentAngle = -Math.PI / 2;

        values.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            const endAngle = currentAngle + sliceAngle;

            // Draw slice
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
            this.ctx.arc(centerX, centerY, radius * innerRadius, endAngle, currentAngle, true);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw label
            if (showLabels && value > 0) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelRadius = radius * 0.8;
                const labelX = centerX + Math.cos(labelAngle) * labelRadius;
                const labelY = centerY + Math.sin(labelAngle) * labelRadius;

                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`${Math.round((value / total) * 100)}%`, labelX, labelY);
            }

            currentAngle = endAngle;
        });

        // Draw center circle
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * innerRadius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Helper: Lighten color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Export for use in app.js
window.ChartRenderer = ChartRenderer;
