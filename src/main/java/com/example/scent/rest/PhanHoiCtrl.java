package com.example.scent.rest;


import com.example.scent.entity.PhanHoi;
import com.example.scent.service.PhanHoiSv;
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
@RequestMapping("/rest/phan-hoi")
public class PhanHoiCtrl {
    final
    PhanHoiSv phs;

    public PhanHoiCtrl(PhanHoiSv phs) {
        this.phs = phs;
    }

    @GetMapping("/getAll")
    public List<PhanHoi> getAll() {
        return phs.getAll();
    }

    @PostMapping("/add")
    public PhanHoi create(@RequestBody PhanHoi ph) {
        return phs.add(ph);
    }

    @PutMapping("/update")
    public PhanHoi update(@RequestBody PhanHoi ph) {
        return phs.update(ph);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { phs.delete(id);
    }
}


