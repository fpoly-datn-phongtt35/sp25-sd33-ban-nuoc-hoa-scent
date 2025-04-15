package com.example.scent.rest;

import com.example.scent.entity.NhomHuong;
import com.example.scent.entity.NongDo;
import com.example.scent.repo.NongDoInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rest/nong-do")
@CrossOrigin("*")
public class NongDoCtrl {
    @Autowired
    NongDoInterface nongDoRepo;
    @GetMapping
    public List<NongDo> getAll() {
        return nongDoRepo.findAll();
    }
    @PostMapping
    public ResponseEntity<NongDo> add(@RequestBody NongDo nongDo) {
        nongDoRepo.save(nongDo);
        return ResponseEntity.ok(nongDo);
    }
    @PutMapping
    public ResponseEntity<NongDo> update(@RequestBody NongDo nongDo) {
        Optional<NongDo> nd = nongDoRepo.findById(nongDo.getId());

        if (nd.isPresent()) {
            NongDo existing = nd.get();
            existing.setTenNongDo(nongDo.getTenNongDo());
             existing.setMoTa(nongDo.getMoTa());
             existing.setTyLeTinhDau(nongDo.getTyLeTinhDau());
            NongDo updated = nongDoRepo.save(existing);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
