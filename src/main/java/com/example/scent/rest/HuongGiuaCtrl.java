package com.example.scent.rest;

import com.example.scent.entity.HuongDau;

import com.example.scent.entity.HuongGiua;
import com.example.scent.service.HuongGiuaSv;
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
@RequestMapping("/rest/huong-giua")
public class HuongGiuaCtrl {
    final
    HuongGiuaSv hgs;

    public HuongGiuaCtrl(HuongGiuaSv hgs) {
        this.hgs = hgs;
    }

    @GetMapping("/getAll")
    public List<HuongGiua> getAll() {
        return hgs.getAll();
    }

    @PostMapping("/add")
    public HuongGiua create(@RequestBody HuongGiua hg) {
        System.out.println("✅ Nhận được: " + hg.getMoTaHuongGiua());
        return hgs.add(hg);
    }

    @PutMapping("/update")
    public HuongGiua update(@RequestBody HuongGiua hg) {
        return hgs.update(hg);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { hgs.delete(id);
    }
}

