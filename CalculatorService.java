package com.example.averagecalculator.service;

import com.example.averagecalculator.model.CalculatorResponse;
import com.example.averagecalculator.model.NumberWindow;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalculatorService {
    private final WebClient webClient;
    private final NumberWindow numberWindow = new NumberWindow(10);

    public Mono<CalculatorResponse> processNumbers(String numberType) {
        List<Integer> prevState = numberWindow.getNumbers();

        return fetchNumbers(numberType)
                .timeout(Duration.ofMillis(500))
                .onErrorReturn(List.of())
                .map(numbers -> {
                    numbers.forEach(numberWindow::addNumber);
                    return CalculatorResponse.builder()
                            .windowPrevState(prevState)
                            .windowCurrState(numberWindow.getNumbers())
                            .numbersReceived(numbers)
                            .average(numberWindow.calculateAverage())
                            .build();
                });
    }

    private Mono<List<Integer>> fetchNumbers(String numberType) {
        return webClient.get()
                .uri("/numbers/" + numberType)
                .retrieve()
                .bodyToMono(List.class)
                .cast(List.class);
    }
}