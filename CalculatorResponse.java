package com.example.averagecalculator.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class CalculatorResponse {
    private List<Integer> windowPrevState;
    private List<Integer> windowCurrState;
    private List<Integer> numbersReceived;
    private double average;
}