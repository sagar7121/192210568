package com.example.averagecalculator.controller;

import com.example.averagecalculator.model.CalculatorResponse;
import com.example.averagecalculator.service.CalculatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/numbers")
@RequiredArgsConstructor
public class CalculatorController {
    private final CalculatorService calculatorService;

    @GetMapping("/{numberType}")
    public Mono<ResponseEntity<CalculatorResponse>> getAverage(
            @PathVariable String numberType) {
        if (!isValidNumberType(numberType)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }
        return calculatorService.processNumbers(numberType)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    private boolean isValidNumberType(String numberType) {
        return numberType != null && 
               (numberType.equals("p") || // prime
                numberType.equals("i") || // fibonacci
                numberType.equals("e") || // even
                numberType.equals("r")); // random
    }
}