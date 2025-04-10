package com.example.scent.rest;

import com.example.scent.dto.CartItemDTO;
import com.example.scent.service.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    // Lấy giỏ hàng của tài khoản
    @GetMapping("/{idTaiKhoan}")
    public ResponseEntity<List<CartItemDTO>> getCart(@PathVariable Integer idTaiKhoan) {
        List<CartItemDTO> cartItems = cartService.getCartItems(idTaiKhoan);
        return ResponseEntity.ok(cartItems);
    }

    // Thêm sản phẩm vào giỏ
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addToCart(
            @RequestParam Integer idTaiKhoan,
            @RequestParam Integer idSpct,
            @RequestParam Integer soLuong) {
        logger.info("Adding to cart: idTaiKhoan={}, idSpct={}, soLuong={}", idTaiKhoan, idSpct, soLuong);
        try {
            cartService.addToCart(idTaiKhoan, idSpct, soLuong);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Thêm vào giỏ hàng thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Cập nhật số lượng
    @PutMapping("/update")
    public ResponseEntity<Map<String, String>> updateCartItem(
            @RequestParam Integer idTaiKhoan,
            @RequestParam Integer idSpct,
            @RequestParam Integer soLuong) {
        try {
            cartService.updateCartItem(idTaiKhoan, idSpct, soLuong);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cập nhật giỏ hàng thành công!");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Xóa sản phẩm khỏi giỏ
    @DeleteMapping("/remove")
    public ResponseEntity<Map<String, String>> removeFromCart(
            @RequestParam Integer idTaiKhoan,
            @RequestParam Integer idSpct) {
        try {
            cartService.removeFromCart(idTaiKhoan, idSpct);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa khỏi giỏ hàng thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    // Xóa nhiều sản phẩm khỏi giỏ
    @DeleteMapping("/remove-multiple")
    public ResponseEntity<Map<String, String>> removeMultipleFromCart(
            @RequestParam Integer idTaiKhoan,
            @RequestParam List<Integer> idSpcts) {
        try {
            cartService.removeMultipleFromCart(idTaiKhoan, idSpcts);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa nhiều sản phẩm khỏi giỏ hàng thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Không thể xóa sản phẩm khỏi giỏ hàng: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Xóa toàn bộ giỏ
    @DeleteMapping("/clear/{idTaiKhoan}")
    public ResponseEntity<String> clearCart(@PathVariable Integer idTaiKhoan) {
        try {
            cartService.clearCart(idTaiKhoan);
            return ResponseEntity.ok("Xóa toàn bộ giỏ hàng thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}