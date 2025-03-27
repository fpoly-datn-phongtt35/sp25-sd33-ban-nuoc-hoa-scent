package com.example.scent.rest;

import com.example.scent.entity.TaiKhoan;
import com.example.scent.service.TaiKhoanSv;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/rest/tai-khoan")
public class TaiKhoanCtrl {
    final
    TaiKhoanSv tks;

    public TaiKhoanCtrl(TaiKhoanSv tks) {
        this.tks = tks;
    }
    @PostMapping("login")
    public String login(@RequestBody TaiKhoan taiKhoan) {
        return tks.verify(taiKhoan);
    }
    @PostMapping("register")
    public TaiKhoan register(@RequestBody TaiKhoan taiKhoan) {
        return tks.create(taiKhoan);
    }


    @GetMapping("/getAll")
    public List<TaiKhoan> getAll() {
        return tks.getAll();
    }

    @PostMapping("/add")
    public TaiKhoan create(@RequestBody TaiKhoan tk) {
        return tks.add(tk);
    }

    @PutMapping("/update")
    public TaiKhoan update(@RequestBody TaiKhoan tk) {
        return tks.update(tk);
    }

    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable Integer id) { tks.delete(id);
    }
    @GetMapping("page")
    public Page<TaiKhoan> getAllTaiKhoan(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
           ) {
        Pageable pageable = PageRequest.of(page, size);
        return tks.searchByTerm(searchTerm,pageable);
    }
    @GetMapping("/get-staff-accounts")
    public ResponseEntity<Page<TaiKhoan>> getStaffAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<TaiKhoan> result = tks.getStaffAccounts( keyword, page, size);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/get-user-accounts")
    public ResponseEntity<Page<TaiKhoan>> getUserAccounts(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {

        Page<TaiKhoan> result = tks.getUserAccounts( keyword, page, size);
        return ResponseEntity.ok(result);
    }
}

