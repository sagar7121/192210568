class NumberWindow {
    constructor(size) {
        this.windowSize = size;
        this.currentWindow = [];
        this.previousWindow = [];
        this.history = [];
    }

    addNumber(number) {
        const num = parseInt(number);
        if (isNaN(num)) return;

        this.previousWindow = [...this.currentWindow];
        
        if (!this.history.includes(num)) {
            this.history.push(num);
        }

        if (this.currentWindow.length >= this.windowSize) {
            this.currentWindow.shift();
        }
        this.currentWindow.push(num);
    }

    getWindowStates() {
        return {
            windowPrevState: this.previousWindow,
            windowCurrState: this.currentWindow,
            numbers: this.history,
            avg: Number(this.calculateAverage().toFixed(2))
        };
    }

    calculateAverage() {
        if (this.currentWindow.length === 0) return 0;
        const sum = this.currentWindow.reduce((acc, curr) => acc + curr, 0);
        return sum / this.currentWindow.length;
    }
}

module.exports = NumberWindow;