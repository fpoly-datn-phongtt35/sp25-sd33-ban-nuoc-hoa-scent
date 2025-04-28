package com.example.scent.rest;

import com.example.scent.dto.spctDTO2;
import com.example.scent.entity.ChiTietDonHang;

import com.example.scent.service.CTDHSv;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/ctdh")
public class CTDHCtrl {
    final
    CTDHSv ctdhs;

    public CTDHCtrl(CTDHSv ctdhs) {
        this.ctdhs = ctdhs;
    }
    @GetMapping(value = "/don-hang/{idDonHang}/spct", produces = MediaType.APPLICATION_JSON_VALUE)

    public ResponseEntity<List<spctDTO2>> getSpctByDonHang(@PathVariable Integer idDonHang) {
        List<spctDTO2> spctDetails = ctdhs.getSpctDetailsByDonHang(idDonHang);

        if (spctDetails.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(spctDetails);
    }
    @GetMapping("/getAll")
    public List<ChiTietDonHang> getAll() {
        return ctdhs.getAll();
    }

    @PostMapping("/add")
    public ChiTietDonHang create(@RequestBody ChiTietDonHang ctdh) {
        return ctdhs.add(ctdh);
    }

    @PutMapping("/update")
    public ChiTietDonHang update(@RequestBody ChiTietDonHang ctdh) {
        return ctdhs.update(ctdh);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) {
        ctdhs.delete(id);
    }
}
