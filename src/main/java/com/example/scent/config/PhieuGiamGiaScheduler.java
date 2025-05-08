package com.example.scent.config;

import com.example.scent.service.PhieuGiamGiaSv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PhieuGiamGiaScheduler {
    private static final Logger logger = LoggerFactory.getLogger(PhieuGiamGiaScheduler.class);

    @Autowired
    private PhieuGiamGiaSv phieuGiamGiaSv;

    @Scheduled(cron = "*/10 * * * * *")
    public void checkAndUpdateExpiredVouchers() {
        logger.info("Scheduler chạy nè!");
        phieuGiamGiaSv.updateExpiredVouchersStatus();
    }
}