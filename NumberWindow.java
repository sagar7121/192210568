package com.example.averagecalculator.model;

import lombok.Data;
import java.util.LinkedList;
import java.util.List;

@Data
public class NumberWindow {
    private LinkedList<Integer> numbers;
    private final int maxSize;

    public NumberWindow(int maxSize) {
        this.maxSize = maxSize;
        this.numbers = new LinkedList<>();
    }

    public void addNumber(int number) {
        if (!numbers.contains(number)) {
            if (numbers.size() >= maxSize) {
                numbers.removeFirst();
            }
            numbers.addLast(number);
        }
    }

    public List<Integer> getNumbers() {
        return new LinkedList<>(numbers);
    }

    public double calculateAverage() {
        if (numbers.isEmpty()) {
            return 0.0;
        }
        return numbers.stream()
                .mapToDouble(Integer::doubleValue)
                .average()
                .orElse(0.0);
    }
}