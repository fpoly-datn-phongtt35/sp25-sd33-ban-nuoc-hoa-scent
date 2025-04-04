package com.example.scent.rest;

import com.example.scent.reques.MomoRequest;
import com.example.scent.service.MoMoPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rest/momo")

//@Slf4j
public class MoMoPaymentCtrl {

    private static final Logger log = LoggerFactory.getLogger(MoMoPaymentCtrl.class);

    private final MoMoPaymentService moMoPaymentService;
    public MoMoPaymentCtrl(MoMoPaymentService moMoPaymentService) {
        this.moMoPaymentService = moMoPaymentService;
    }

    @PostMapping("/pay")
    public ResponseEntity<?> createPayment(@RequestBody MomoRequest dto) {
        return ResponseEntity.ok(moMoPaymentService.createPayment(dto));
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestBody String callbackBody) {
        log.info("[MoMo Callback] Body: {}", callbackBody);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/check-status")
    public ResponseEntity<?> checkTransaction(@RequestBody MomoRequest dto) {
        return ResponseEntity.ok(moMoPaymentService.checkTransactionStatus(dto.getOrderId()));
    }
}
