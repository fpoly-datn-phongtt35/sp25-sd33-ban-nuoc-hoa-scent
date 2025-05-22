
USE scent;
GO

-- Xóa dữ liệu cũ trong các bảng để tránh trùng lặp


-- 1. Chèn dữ liệu vào bảng phieu_giam_gia
-- Sửa giá trị tối đa (gia_tri_toi_da) để hợp lý hơn với thực tế
INSERT INTO phieu_giam_gia (ma_giam_gia, gia_tri_giam, ngay_bat_dau, ngay_het_han, so_luong, gia_tri_toi_da, dieu_kien_ap_dung,trang_thai)
VALUES 
('SALE2320', 0.20, '2025-01-01', '2025-01-31', 100, 500000, 2000000,1),
('DISCOUNT132130', 0.10, '2025-02-15', '2025-03-15', 200, 300000, 1500000,1);
GO

-- 2. Chèn dữ liệu vào bảng khach_hang
-- Chuẩn hóa định dạng tên và địa chỉ
INSERT INTO khach_hang (ten_khach_hang, dia_chi, email, sdt)
VALUES 
(N'Nguyễn Văn A', N'123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', 'nguyenvan@example.com', '0123456789'),
(N'Trần Thị B', N'456 Lê Lợi, Quận 3, TP. Hồ Chí Minh', 'tranthib@example.com', '0987654321');
GO

-- 3. Chèn dữ liệu vào bảng huong_dau
INSERT INTO huong_dau (mota)
VALUES
(N'Hương tươi mát, dịu nhẹ của trái thơm, mùi sương, quýt, đu đủ, cam Bergamot, đậu khấu, chanh'),
(N'Quả quýt, hoa lavender, bạc hà, hương thảo'),
(N'Bùng nổ mạnh mẽ với sự tươi mát và sảng khoái của nhựa Elemi cùng với sự cay nồng của gia vị'),
(N'Hương cam Bergamot Calabria tươi mát và mạnh mẽ, mang lại cảm giác sảng khoái và cuốn hút'),
(N'Quả chanh vàng, quả bưởi, hồng tiêu, cam Bergamot, ngò thơm, cây bạc hà, hương An-đê-hít'),
(N'Cam Bergamot, quả cam, quýt hồng'),
(N'Hương An-đê-hít, quả cam, hương nước biển'),
(N'Cam Bergamot, Mandora, hoa tím'),
(N'Rau mùi, quả lựu, quýt, đào, hoa nhài, hoa hồng Bungary'),
(N'Cam chanh, hoa thủy tiên'),
(N'Bạc hà, táo xanh, chanh'),
(N'Chanh, tinh dầu hoa cam, cam Bergamot, hoa hồng'),
(N'Hương vị hoa trái cây và chút cay nồng của tiêu đen'),
(N'Dầu chanh, dầu Mandarin, cây bời lời đỏ, dầu Elemi, dầu tiêu đen'),
(N'Quả yuzu, quả lựu, hương nước'),
(N'Gia vị, tiêu hồng, nho đen'),
(N'Chinotto, quả chanh vàng, quả quýt hồng, tiêu đen, cây hương thảo'),
(N'Quả chanh vàng, quả lý chua đen, quả táo xanh, cam Bergamot, quả dứa (quả thơm)'),
(N'Bạch đậu khấu, cam Bergamot, hạt tiêu hồng, hoa nghệ tây'),
(N'Cam Bergamot, quả cherry, quả mọng'),
(N'Cam Bergamot, hương bưởi, hương đào, hương cam'),
(N'Cam Bergamot, quả chanh vàng, quả đào, quả mơ, quả dứa'),
(N'Hoa gỗ, nghệ tây, hoa nhài'),
(N'Quýt Mandarin và nghệ'),
(N'Cây bã đậu, cam Bergamot, quả quýt, lá cà chua'),
(N'Cây hương thảo, bạch đậu khấu, quả bưởi'),
(N'Hạt tiêu hồng, hoa nhài, quả quýt hồng'),
(N'Quả quýt hồng, cây bách xù, quả bưởi, cam Bergamot'),
(N'Quả quýt hồng, quả bưởi'),
(N'Hồng tiêu, quả kiwi, cây đại hoàng (Rhuburb)');
GO

-- 4. Chèn dữ liệu vào bảng huong_giua
INSERT INTO huong_giua (mota)
VALUES
(N'Sự ngọt ngào, say đắm của nhục đậu khấu, hoa violet, gốc cây oris, hoa nhài, huệ, thung lũng, hoa hồng'),
(N'Hoa lan Nam Phi, hoa nhài, hoa mộc tê'),
(N'Mang theo sự thanh khiết của hoa oải hương cho ta cảm giác bình yên và thư thái'),
(N'Sự hòa quyện của tiêu Sichuan cay nồng, hoa oải hương thơm ngát, nhục đậu khấu và hồi, tạo nên một lớp hương đầy phức tạp và tinh tế'),
(N'Dưa gang, hoa nhài, gừng, nhục đậu khấu'),
(N'Hoa diên vĩ, hoa nhài, hoa hồng'),
(N'Tiêu, hoa cam Neroli, gỗ tuyết tùng'),
(N'Wisteria, hoa hồng, Osmanthus'),
(N'Mimosa, đinh hương, hoa cam, cỏ ba lá, hoa hồng'),
(N'Hoa nhài, gỗ Teak, hương lau'),
(N'Đậu Tonka, hoa phong lữ, Ambroxan'),
(N'Hoa lan dạ hương, hoa Clary Sage, gỗ tuyết tùng và phong lữ'),
(N'Hương thơm nhẹ nhàng từ nhựa của nhũ hương đan chặt lấy sự ngọt ngào của bạch đậu khấu'),
(N'Dầu bưởi, dầu phong lữ, hoa oải hương, dầu xô thơm'),
(N'Hoa sen, hoa mộc lan, hoa mẫu đơn'),
(N'Hoa huệ, hoa linh lan thung lũng, caramel'),
(N'Hoa hồng, hoa phong lữ, tiêu'),
(N'Hoa hồng, hoa nhài, gỗ Bu-lô'),
(N'Hoa mộc tê, hoa nhài'),
(N'Hương hoa hồng, hương vanilla, hoa trắng'),
(N'Hoa phong lữ, hoa nhài, hương vải, hoa hồng'),
(N'Hoa nhài, hoa hồng, hoa diên vĩ, hoa phong lữ, gỗ tuyết tùng'),
(N'Gỗ hổ phách, long diên hương'),
(N'Hoa oải hương, bạch đậu khấu và cây xô thơm Clary'),
(N'Tiêu, hoa hồng'),
(N'Hoa ngọc lan tây, hoa huệ trắng'),
(N'Heliotrope, hoa dành dành, hoa nhài'),
(N'Cây hương thảo, gỗ cẩm lai Brazil, tiêu'),
(N'Nước biển, cây bách xù'),
(N'Hoa nhài, hoa anh thảo, quả dưa hấu');
GO

-- 5. Chèn dữ liệu vào bảng huong_cuoi
INSERT INTO huong_cuoi (mota)
VALUES
(N'Hương thơm bền bỉ, nồng nàn của gỗ đàn hương, xạ hương, tuyết tùng, gỗ cây oakmoss'),
(N'Gỗ đàn hương, xạ hương, gỗ tuyết tùng'),
(N'Hương xạ hương và hương gỗ kết hợp với nhau tạo ra sự nam tính và quyến rũ'),
(N'Ambroxan và vanilla mang đến sự ấm áp, sâu lắng và gợi cảm, giúp hương thơm kéo dài và để lại ấn tượng mạnh mẽ'),
(N'Hương Labdanum, cây hoắc hương, gỗ đàn hương, gỗ tuyết tùng, hổ phách, nhang (hương), Amberwood'),
(N'Cỏ hương bài, xạ hương, cây hoắc hương, hương vanilla'),
(N'Đậu Tonka, hổ phách, hương vanilla, xạ hương trắng'),
(N'Hương vanilla, đậu Tonka, cây hoắc hương'),
(N'Nhựa Labdanum, hổ phách, gỗ đàn hương, đậu Tonka, nhựa Opoponax, cầy hương, vanilla'),
(N'Hoắc hương, hổ phách, xạ hương trắng'),
(N'Hương vanilla, cỏ Vetiver, địa y, tuyết tùng'),
(N'Đậu Tonka, xạ hương và hổ phách'),
(N'Trầm hương được bùng nổ sự nam tính của mình. Đi kèm với nó húng quế và da thuộc nắm vai trò khiến cho mùi hương trở nên tự nhiên, dễ chịu hơn'),
(N'Benzoin Resinoid, Patchouli và Vanilla'),
(N'Xạ hương, gỗ gụ, hổ phách'),
(N'Hổ phách, gỗ Akigala, gỗ đàn hương, hoa lan, vanilla'),
(N'Gỗ tuyết tùng Texas, cây hoắc hương, đậu Tonka, hương vanilla, gỗ đàn hương, rêu sồi'),
(N'Hương vanilla, long diên hương, xạ hương, cây hoắc hương'),
(N'Hoắc hương, hương Ambroxan, hương Cashmeran'),
(N'Cỏ xạ hương, gỗ hổ phách, phấn'),
(N'Xạ hương, hoắc hương, hương vanilla, cỏ hương bài'),
(N'Hổ phách, xạ hương, hương vanilla, gỗ đàn hương, cỏ hương bài'),
(N'Gỗ tuyết tùng'),
(N'Gỗ đàn hương, cỏ hương bài và da thuộc'),
(N'Gỗ đàn hương, cây hoắc hương'),
(N'Gỗ tuyết tùng Virginia, da thuộc, da lộn, cỏ hương bài'),
(N'Hương vanilla, hương Ambroxan, hoa huệ, gỗ tuyết tùng, cỏ hương bài, cây hoắc hương'),
(N'Xạ hương, rêu sồi, nhang (hương)'),
(N'Amberwood, xạ hương'),
(N'Xạ hương, gỗ đàn hương, cây chanh vàng');
GO

-- 6. Chèn dữ liệu vào bảng thuong_hieu
-- Sửa quốc gia cho hợp lý và thêm mô tả
INSERT INTO thuong_hieu (ten_thuong_hieu, quoc_gia, mo_ta)
VALUES 
(N'Chanel', N'Pháp', N'Thương hiệu nước hoa cao cấp từ Pháp'),
(N'Versace', N'Ý', N'Thương hiệu nước hoa sang trọng từ Ý'),
(N'Gucci', N'Ý', N'Thương hiệu nước hoa nổi tiếng từ Ý'),
(N'Calvin Klein', N'Mỹ', N'Thương hiệu nước hoa hiện đại từ Mỹ'),
(N'Dior', N'Pháp', N'Thương hiệu nước hoa danh tiếng từ Pháp'),
(N'Armaf', N'Ả Rập', N'Thương hiệu nước hoa cao cấp từ Ả Rập'),
(N'Lacoste', N'Pháp', N'Thương hiệu nước hoa phong cách thể thao từ Pháp'),
(N'Dolce & Gabbana', N'Ý', N'Thương hiệu nước hoa quyến rũ từ Ý');
GO
select*from thuong_hieu
-- 7. Chèn dữ liệu vào bảng danh_muc
-- Sửa mô tả cho danh mục Unisex
INSERT INTO danh_muc (ten_danh_muc, mo_ta)
VALUES 
(N'Nước hoa nam', N'Danh mục nước hoa dành cho nam giới'),
(N'Nước hoa nữ', N'Danh mục nước hoa dành cho nữ giới'),
(N'Unisex', N'Danh mục nước hoa phù hợp cho cả nam và nữ');
GO

-- 8. Chèn dữ liệu vào bảng nhom_huong
INSERT INTO nhom_huong (ten_nhom, mo_ta)
VALUES
(N'Citrus (hương thơm cam, chanh)', N'Thanh mát và tươi trẻ'),
(N'Floral Woody Musk (gỗ xạ hương)', N'Lưu mùi bền bỉ'),
(N'Aromatic Fougere (hương thơm thảo mộc)', N'Mùi cỏ cây như thảo mộc'),
(N'Citrus Aromatic (hương cam chanh thơm ngát)', N'Sự nhẹ nhàng và thanh thoát'),
(N'Woody Aromatic (hương gỗ thơm)', N'Lịch lãm, trầm ổn'),
(N'Hương thơm hoa cỏ Chypre', N'Kết hợp bởi hương cam quýt, hương hoa và rêu'),
(N'Oriental Woody (hương gỗ phương đông)', N'Tinh tế, nam tính, lịch lãm'),
(N'Oriental Floral (hương hoa cỏ phương đông)', N'Kết hợp tinh tế giữa sự ngọt ngào, ấm áp của các nốt hương phương Đông với sự tươi mới, nhẹ nhàng từ các loài hoa'),
(N'Oriental Fougere (hương thơm dương xỉ)', N'Toát lên vẻ táo bạo, mạnh mẽ của những “tay chơi” thời đại mới'),
(N'Hương gỗ tươi mát', N'Tươi mát và tự nhiên'),
(N'Floral Fruity (hoa cỏ, trái cây)', N'Mùi hoa cỏ, trái cây ngọt ngào'),
(N'Oriental Floral (hoa cỏ phương đông)', N'Thanh mát và lôi cuốn'),
(N'Hương hoa cỏ síp', N'Dịu dàng, hấp dẫn'),
(N'Woody Spicy (hương gỗ cay)', N'Kết hợp giữa sự ấm áp của gỗ và hương cay nồng từ gia vị'),
(N'Floral Aldehyde (hoa cỏ aldehyde)', N'Sang trọng và cổ điển, thường mang phong cách vintage'),
(N'Green (hương xanh)', N'Mùi hương tươi mát, như cỏ non và lá cây vừa cắt'),
(N'Fruity (trái cây)', N'Mùi hương ngọt ngào và dễ chịu từ các loại trái cây'),
(N'Marine (hương biển)', N'Mát lạnh, sảng khoái, mang cảm giác của biển cả'),
(N'Leather (da thuộc)', N'Nam tính, mạnh mẽ, có chiều sâu và cá tính'),
(N'Gourmand (ngọt ngào thực phẩm)', N'Hương ngọt như vani, caramel, socola, mang đến cảm giác "ngon miệng"'),
(N'Musk (xạ hương)', N'Quyến rũ, mềm mại, thường được dùng làm nền cho nhiều loại nước hoa'),
(N'Chypre Fruity (síp trái cây)', N'Sự hòa quyện giữa rêu sồi, trái cây và hoắc hương'),
(N'Floral Green (hoa cỏ xanh)', N'Sự tươi mới, nhẹ nhàng, thích hợp với mùa xuân và hè');
GO

-- 9. Chèn dữ liệu vào bảng san_pham
-- Sửa id_thuong_hieu, id_danh_muc, id_huong_dau, id_huong_giua, id_huong_cuoi để khớp với dữ liệu thực tế
-- id_thuong_hieu: 1000 (Chanel), 1001 (Versace), 1002 (Gucci), 1003 (Calvin Klein), 1004 (Dior), 1005 (Armaf), 1006 (Lacoste), 1007 (Dolce & Gabbana)
-- id_danh_muc: 1000 (Nước hoa nam), 1001 (Nước hoa nữ), 1002 (Unisex)
-- id_huong_dau, id_huong_giua, id_huong_cuoi: 1000 đến 1029
INSERT INTO san_pham (ten, mo_ta, id_thuong_hieu, id_danh_muc, id_huong_dau, id_huong_giua, id_huong_cuoi, trang_thai)
VALUES 
-- SP0001
(N'Nước Hoa Calvin Klein (CK) CK One Cho Cả Nam Và Nữ', N'Nước hoa Calvin Klein CK One là dòng nước hoa hàng hiệu của thương hiệu Calvin Klein dành cho cả nam và nữ thuộc dòng Cam Quýt - Thơm Ngát. Calvin Klein CK One mang trong mình sự tươi mát và tinh khiết và đồng thời thể hiện được một cái nhìn mới của nước hoa.', 1003, 1002, 1000, 1000, 1000, 1),
-- SP0002
(N'Nước Hoa Calvin Klein CK Be EDT Màu Đen', N'Nước hoa CK Be là dòng nước hoa unisex của thương hiệu nổi tiếng Calvin Klein. Được giới thiệu vào năm 1996, CK Be mang trong mình một phong cách tự do, thoải mái và cá tính, phù hợp cho cả nam và nữ. Với hương thơm tươi mát và quyến rũ, CK Be đã nhanh chóng chiếm được cảm tình của người dùng trên toàn thế giới.', 1003, 1000, 1001, 1001, 1001, 1),
-- SP0003
(N'Nước Hoa Nam Dior Sauvage Eau Forte Parfum', N'Nước Hoa Nam Dior Sauvage Eau Forte Parfum là chai nước hoa nam đẳng cấp của thương hiệu Dior nổi tiếng. Dior Sauvage Eau Forte mang đến sự tươi mát và nồng nàn. Công thức dạng nước hòa quyện với công thức dạng dầu thơm để tạo ra loại nước hoa cô đặc cao này.i', 1004, 1000, 1002, 1002, 1002, 1),
-- SP0004
(N'Nước Hoa Nam Dior Sauvage EDP', N'Nước hoa nam Dior Sauvage EDP của thương hiệu Christian Dior ra đời năm 2018, được biết đến là phiên bản tiếp nối sự thành công vang dội của dòng nước hoa Dior Sauvage đã làm cánh mày râu “điêu đứng”. Mùi hương nam tính, mạnh mẽ và cuốn hút. Mùi hương đời thường và quen thuộc chinh phục những người khó tính nhất', 1004, 1000, 1003, 1003, 1003, 1),
-- SP0005
(N'Nước Hoa Nam Chanel Bleu De Chanel Eau De Parfum (EDP)', N'Nước hoa nam Bleu de Chanel EDP là dòng nước hoa danh tiếng nhất của thương hiệu Chanel được ra mắt vào năm 2014 sau sự thành công của Chanel Bleu EDT vào năm 2010. Nhờ bàn tay phù phép ma thuật của Jacques Polge, mùi hương này thật sự đã trở thành thứ vũ khí hữu hiệu không thể nào thiếu đối với phái mạnh và phá vỡ mọi qui ước, mọi khuôn khổ khiến nhiều người phải trầm trồ với hương thơm mới mẻ này', 1000, 1000, 1004, 1004, 1004, 1),
-- SP0006
(N'Nước Hoa Nữ Chanel Coco Mademoiselle EDP', N'Nước Hoa Nữ Chanel Coco Mademoiselle EDP là một chai nước hoa phiên bản bổ sung cho nét tính cách đầy tương phản của Gabrielle Chanel với hương thơm sinh động, tươi mát và phức cảm, Chanel Coco Mademoiselle dành cho phái đẹp yêu thích mùi hương hoa cỏ.', 1000, 1001, 1005, 1005, 1005, 1),
-- SP0007
(N'Nước Hoa Nam Chanel Allure Homme Sport Eau De Toilette (EDT)', N'Nước Hoa Nam Chanel Allure Homme Sport Eau De Toilette là một trong những dòng nước hoa dành cho nam giới nổi bật của thương hiệu Chanel. Phiên bản Allure Homme Sport là sự kết hợp hài hòa giữa sự sáng tạo trong nghệ thuật chế tác nước hoa và phong cách sống hiện đại. Và đây cũng sẽ là mẫu nước hoa dành cho những người đàn ông yêu thích sự thanh lịch, mạnh mẽ và luôn muốn thể hiện phong cách riêng của mình.', 1000, 1000, 1006, 1006, 1006, 1),
-- SP0008
(N'Nước Hoa Nữ Gucci Guilty Elixir De Parfum Pour Femme Parfum', N'Nước hoa Gucci Guilty Elixir De Parfum Pour Femme là một tác phẩm hương thơm đẳng cấp từ thương hiệu thời trang nổi tiếng Gucci. Được giới thiệu đến công chúng vào năm 2023, đây là một phiên bản mới mẻ và quyến rũ của dòng Gucci Guilty.', 1002, 1001, 1007, 1007, 1007, 1),
-- SP0009
(N'Nước Hoa Nữ Chanel Coco Vaporisateur Spray EDP', N'Nước hoa nữ Coco EDP của thương hiệu Chanel được ra mắt năm 1984, được chế tạo bởi chuyên gia nước hoa nổi tiếng Jacques Polge. Chanel Coco EDP gợi nên sự pha trộn giữa các nền văn minh, khởi nguồn từ những tuyến đường thông thương giữa thành phố Venice và khu vực phương Đông cổ xưa, mang đến phong cách quý phái ngập tràn gợi cảm và ấm áp. Nhờ đó đã tạo nên sự khác biệt, cuốn hút mọi góc nhìn', 1000, 1001, 1008, 1008, 1008, 1),
-- SP0010
(N'Nước Hoa Nữ Chanel Chance Eau Fraiche Eau De Toilette (EDT)', N'Nước hoa nữ Chance Eau Fraiche EDT của thương hiệu Chanel được ra đời vào năm 2007 bởi Jacques Polge nhà điều chế nước hoa tài hoa. Chance Eau Fraiche đã thật sự ghi dấu ấn lớn trong nền công nghiệp nước hoa và là một trong những cái tên nổi bật góp phần tạo nên tên tuổi của dòng nước hoa Chanel nữ', 1000, 1001, 1009, 1009, 1009, 1),
-- SP0011
(N'Nước Hoa Nam Versace Eros EDT', N'Nước hoa nam Versace Eros Eau de Parfum của thương hiệu Versace được ra mắt năm 2020 là bản nâng cấp từ phiên bản Versace Eros EDT, mang đến cho người dùng cái nhìn hoàn toàn mới. Lấy cảm hứng từ thần thoại Hy Lạp - vị thần tình yêu Eros luôn mang đến hạnh phúc cho mọi người, siêu phẩm nước hoa này như mang đến một luồng năng lượng tích cực, thể hiện niềm đam mê và ham muốn mãnh liệt của người dùng.', 1001, 1000, 1010, 1010, 1010, 1),
-- SP0012
(N'Nước Hoa Nam Versace Pour Homme EDT', N'Nước hoa nam Versace Pour Homme EDT được thương hiệu Versace cho ra mắt năm 2008. Mùi hương được pha trộn bởi nhà pha chế nổi tiếng Alberto Morillas. Versace Pour Homme EDT được kết hợp để trở thành cặp đôi quyến rũ cùng với Versace Pour Femme, cặp đôi này là một gợi ý cho bạn sự lựa chọn hoàn hảo dành cho bản thân và “ai kia”. Nếu Pour Femme quyến rũ, sâu lắng thì Pour Homme đầy mạnh mẽ và đam mê', 1001, 1000, 1011, 1011, 1011, 1),
-- SP0013
(N'Nước Hoa Nam Versace Pour Homme Oud Noir EDP', N'Nước hoa nam Versace Pour Homme Oud Noir của thương hiệu Versace được ra mắt vào năm 2013. Cảm hứng của chai nước hoa này đến từ "sự hấp dẫn, lôi cuốn của ánh hoàng hôn trên sa mạc và cơn gió ấm thoáng qua" một mùi hương nam nồng nàn với nốt hương gỗ trầm làm chủ đạo và được các nốt hương cay nồng khác làm nổi bật hơn. Versace Pour Homme Oud Noir EDP mang một hương vị nam tính đầy gợi cảm nhưng xen lẫn bên trong đó là một vẻ đẹp bí ẩn lạnh lùng khiến cho phụ nữ bị cuốn hút bởi người sử dụng', 1001, 1000, 1012, 1012, 1012, 1),
-- SP0014
(N'Nước Hoa Nam Versace Eros Parfum', N'Eros Parfum by Versace là một hương thơm Amber Fougere dành cho nam giới. Đây là một hương thơm mới. Eros Parfum được ra mắt vào năm 2021.', 1001, 1000, 1013, 1013, 1013, 1),
-- SP0015
(N'Nước Hoa Nữ Versace Bright Crystal EDT N-MĐ', N'Nước hoa nữ Versace Bright Crystal của thương hiệu Versace được ra đời năm 2006 làm cả thế giới sửng sốt bởi mùi hương và thiết kế độc đáo. Đây là dòng nước hoa kinh điển được tạo nên bởi nhà sáng chế Alberto Morillas. Versace Bright Crystal EDT với vẻ đẹp của một viên kim cương lấp lánh, là “báu vật” hoàn hảo cho những bữa tiệc lãng mạn và là chất xúc tác cho những mối tình thăng hoa', 1001, 1001, 1014, 1014, 1014, 1),
-- SP0016
(N'Nước Hoa Nữ Versace Crystal Noir Parfum T-RS', N'Nước hoa nữ Versace Crystal Noir của thương hiệu Versace được ra đời năm 2004 làm cả thế giới sửng sốt bởi mùi hương và thiết kế độc đáo. Đây là dòng nước hoa kinh điển được tạo nên bởi nhà sáng chế Antoine Lie. Versace Crystal Noir Parfum với vẻ đẹp huyền bí, quyến rũ, là lựa chọn hoàn hảo cho những buổi tối lãng mạn', 1001, 1001, 1015, 1015, 1015, 1),
-- SP0017
(N'Nước Hoa Nam Versace Eros Flame Eau De Parfum (EDP)', N'Nước hoa nam Versace Eros Flame được thương hiệu Versace cho ra mắt vào năm 2018 bởi chuyên gia pha chế khá nổi tiếng Aurelien Guichard. Vẫn lấy cảm hứng từ vị thần tình yêu Hy Lạp cổ đại nhưng sản phẩm lại có hương thơm chiều sâu và bùng nổ hơn. Versace Eros Flame EDP giữ lại sự nam tính, quyến rũ của Versace Eros thêm vào đó là sự cá tính, táo bạo và đầy sang trọng', 1001, 1000, 1016, 1016, 1016, 1),
-- SP0018
(N'Nước Hoa Nam Armaf Club De Nuit Intense Man Eau De Toilette', N'Nước hoa nam Club de Nuit Intense Man của thương hiệu Armaf được ra mắt năm 2015 và được giới chuyên môn đánh giá sánh ngang 8-10 với đàn anh Creed Aventus lừng danh. Đây là dòng nước hoa mang hương vị mạnh mẽ, cá tính dành cho chàng trai đam mê hương gỗ cay nồng. Armaf Club de Nuit Intense Man EDT là sự kết hợp đầy dung dị của những hương thơm đến từ những loại quả thuần khiết, đậm chất dân dã', 1005, 1000, 1017, 1017, 1017, 1),
-- SP0019
(N'Nước Hoa Unisex Armaf Uniq Oud Forever Eau De Parfum', N'Nước Hoa Unisex Armaf Uniq Oud Forever Eau De Parfum 100ml là chai nước hoa cao cấp đến từ thương hiệu Armaf của Ả Rập. Armaf Uniq Oud Forever mang đến sự kết hợp hoàn hảo giữa mùi hương quyến rũ và thiết kế sang trọng, mang đến một trải nghiệm đậm chất cổ điển nhưng cũng không kém phần hiện đại.', 1005, 1002, 1018, 1018, 1018, 1),
-- SP0020
(N'Nước Hoa Nữ Armaf Yum Yum EDP', N'Nước Hoa Nữ Armaf Yum Yum EDP 100ml là chai nước hoa dành riêng cho phái đẹp đầy quyến rũ đến từ hãng Armaf của Ả Rập. Với thiết kế lạ mắt và hương thơm hấp dẫn như một món tráng miệng, Yum Yum nhanh chóng trở thành tâm điểm chú ý trong làng nước hoa. Đây không chỉ là một chai nước hoa, mà còn là tuyên ngôn phong cách dành cho những cô gái tự tin và biết tận hưởng cuộc sống.', 1005, 1001, 1019, 1019, 1019, 1),
-- SP0021
(N'Nước Hoa Nữ Armaf Club De Nuit Woman EDP', N'Nước hoa nữ Club De Nuit Woman 105ml của thương hiệu Armaf được ra mắt vào năm 2015 đang làm mưa làm gió thị trường nước hoa tại Việt Nam. Cùng với Club De Nuit Intense Man được xem là bản dupe khá hoàn hảo của Creed Aventus. Với Club De Nuit for Women thì đây là phiên bản có cấu tạo & sự phân bố các nốt hương gần như chuẩn xác nhất so với Chanel Coco Mademoiselle.', 1005, 1001, 1020, 1020, 1020, 1),
-- SP0022
(N'Nước Hoa Nam Armaf Club De Nuit El Cielo Pour Homme EDP', N'Nước Hoa Nam Armaf Club De Nuit El Cielo Pour Homme EDP 100ml là chai nước hoa dành cho nam giới của thương hiệu Armaf. Nước hoa Club De Nuit El Cielo với hương thơm nồng nàn, quyến rũ và đầy nam tính, phù hợp khi đi tiệc, sự kiện hoặc những dịp đặc biệt.', 1005, 1000, 1021, 1021, 1021, 1),
-- SP0023
(N'Nước Hoa Unisex Armaf Club De Nuit Untold EDP 105ml', N'Nước hoa unisex Club De Nuit Untold EDP của thương hiệu Armaf được ra mắt năm 2022. Đây là bản clone của mùi hương của MFK Baccarat Rouge 540 EDP - chai nước hoa unisex rất đình đám trong thời gian gần đây. Những ai yêu thích mùi hương tinh khiết, thanh sạch và nhẹ nhàng mà vẫn muốn cho mình thần thái sang trọng, quý phái chắc chắn sẽ không thất vọng khi "kết đôi" với Club De Nuit Untold', 1005, 1002, 1022, 1022, 1022, 1),
-- SP0024
(N'Nước Hoa Nam Lacoste L.12.12 Blanc Eau Intense EDT', N'Nước Hoa Nam Lacoste L.12.12 Blanc Eau Intense EDT 100ml là hương thơm dành riêng cho phái mạnh đến từ thương hiệu Lacoste đã thành công khi phác hoạ hình ảnh người đàn ông mạnh mẽ, gai góc và lịch lãm.', 1006, 1000, 1023, 1023, 1023, 1),
-- SP0025
(N'Nước Hoa Nam Lacoste Essential Pour Homme EDT', N'Nước Hoa Lacoste Essential Pour Homme EDT 125ml là chai nước hoa nam cao cấp, được giới chuyên môn đánh giá cao tới từ thương hiệu Lacoste nổi tiếng Pháp. Lacoste Essential Pour Homme với hương gỗ thơm với phong cách nam tính, trẻ trung, quyến rũ phù hợp cho nam giới trong cả ngày dài năng động.', 1006, 1000, 1024, 1024, 1024, 1),
-- SP0026
(N'Nước Hoa Lacoste L.12.12 White Blanc Cho Nam 175ml N-MĐ', N'Nước hoa nam Eau de L.12.12. White EDT của thương hiệu Lacoste được ra mắt vào năm 2011. Mùi hương nằm trong BST L.12.12 dành cho nam - bộ sưu tập này lấy cảm hứng từ chiếc áo phông của thương hiệu Lacoste. Tất cả sản phẩm của BST này đều mang phong cách thể thao, khỏe khoắn. Nhưng ở mỗi chai nước hoa đều mang những đặc tính hương thơm riêng biệt. Với Lacoste Eau de L.12.12 White EDT các chàng tìm thấy được sự năng động, trẻ trung qua hương thơm tự nhiên, tươi mát và tao nhã.', 1006, 1000, 1025, 1025, 1025, 1),
-- SP0027
(N'Nước Hoa Nữ Lacoste Pour Femme Elixir EDP', N'Nước hoa nữ Lacoste Pour Femme EDP của thương hiệu Lacoste được giới thiệu vào năm 2003. Lacoste Pour Femme EDP là hương thơm tự nhiên dễ chịu, vô cùng thanh lịch và tràn đầy cá tính thể thao. Thông điệp của mùi hương gửi gắm qua hình ảnh Catherine Hurley nhón chân lả lướt trên mặt bàn biểu tượng cho vẻ đẹp thanh thản, tự do, không trói buộc của người phụ nữ mang trên mình hương thơm này', 1006, 1001, 1026, 1026, 1026, 1),
-- SP0028
(N'Nước Hoa Nam Dolce & Gabbana D&G Light Blue Pour Homme EDT', N'Nước Hoa Nam Dolce & Gabbana D&G Light Blue Pour Homme 200ml là dòng nước hoa nam cao cấp đến từ thương hiệu Dolce & Gabbana Ý. D&G Light Blue có mùi vị cam chanh nam tính, cuốn hút ngay từ khi có mặt trên thị trường Dolce & Gabbana D&G Light Blue pour Homme được nhiều tín đồ nước hoa săn đón', 1007, 1000, 1027, 1027, 1027, 1),
-- SP0029
(N'Nước Hoa Nam Dolce & Gabbana D&G Light Blue Eau Intense Pour Homme EDP', N'Nước Hoa Nam Dolce & Gabbana Light Blue Eau Intense Pour Homme EDP 100ml là dòng nước hoa dành cho phái mạnh đến từ thương hiệu Dolce & Gabbana nổi tiếng của Ý. Chai nước hoa với hương thơm vô cùng tươi mát, mạnh mẽ và rắn rỏi nên được các chàng trai ưa chuộng', 1007, 1000, 1028, 1028, 1028, 1),
-- SP0030
(N'Nước Hoa Nữ Dolce & Gabbana D&G L’Imperatrice 3 Pour Femme Eau De Toilette', N'Nước Hoa Nữ Dolce & Gabbana D&G L’Imperatrice 3 Pour Femme Eau De Toilette 100ml nằm trong bộ sưu tập D&G Anthology sở hữu hương vị đặc trưng của dưa hấu, kiwi, hoa anh thảo hồng và xạ hương', 1007, 1001, 1029, 1029, 1029, 0);
GO

-- 10. Cập nhật id_nhom_huong cho bảng san_pham
-- id_nhom_huong: 1000 đến 1012
UPDATE san_pham
SET id_nhom_huong = CASE id
    WHEN '1000' THEN 1000  -- Citrus (hương thơm cam, chanh)
    WHEN '1001' THEN 1001  -- Floral Woody Musk (gỗ xạ hương)
    WHEN '1002' THEN 1002  -- Aromatic Fougere (hương thơm thảo mộc)
    WHEN '1003' THEN 1003  -- Citrus Aromatic (hương cam chanh thơm ngát)
    WHEN '1004' THEN 1004  -- Woody Aromatic (hương gỗ thơm)
    WHEN '1005' THEN 1005  -- Hương thơm hoa cỏ Chypre
    WHEN '1006' THEN 1006  -- Oriental Woody (hương gỗ phương đông)
    WHEN '1007' THEN 1007  -- Oriental Floral (hương hoa cỏ phương đông)
    WHEN '1008' THEN 1008  -- Oriental Fougere (hương thơm dương xỉ)
    WHEN '1009' THEN 1009  -- Hương gỗ tươi mát
    WHEN '1010' THEN 1010  -- Floral Fruity (hoa cỏ, trái cây)
    WHEN '1011' THEN 1011  -- Oriental Floral (hoa cỏ phương đông)
    WHEN '1012' THEN 1012  -- Hương hoa cỏ síp
    WHEN '1013' THEN 1000  -- Citrus (hương thơm cam, chanh)
    WHEN '1014' THEN 1001  -- Floral Woody Musk (gỗ xạ hương)
    WHEN '1015' THEN 1002  -- Aromatic Fougere (hương thơm thảo mộc)
    WHEN '1016' THEN 1003  -- Citrus Aromatic (hương cam chanh thơm ngát)
    WHEN '1017' THEN 1004  -- Woody Aromatic (hương gỗ thơm)
    WHEN '1018' THEN 1005  -- Hương thơm hoa cỏ Chypre
    WHEN '1019' THEN 1006  -- Oriental Woody (hương gỗ phương đông)
    WHEN '1020' THEN 1007  -- Oriental Floral (hương hoa cỏ phương đông)
    WHEN '1021' THEN 1008  -- Oriental Fougere (hương thơm dương xỉ)
    WHEN '1022' THEN 1009  -- Hương gỗ tươi mát
    WHEN '1023' THEN 1010  -- Floral Fruity (hoa cỏ, trái cây)
    WHEN '1024' THEN 1011  -- Oriental Floral (hoa cỏ phương đông)
    WHEN '1025' THEN 1012  -- Hương hoa cỏ síp
    WHEN '1026' THEN 1000  -- Citrus (hương thơm cam, chanh)
    WHEN '1027' THEN 1001  -- Floral Woody Musk (gỗ xạ hương)
    WHEN '1028' THEN 1002  -- Aromatic Fougere (hương thơm thảo mộc)
    WHEN '1029' THEN 1003  -- Citrus Aromatic (hương cam chanh thơm ngát)
    ELSE NULL
END;
GO

-- 11. Chèn dữ liệu vào bảng hinh_anh
-- Sửa id_san_pham: giảm đi 1 (1001 thành 1000, 1002 thành 1001, ..., 1030 thành 1029)
INSERT INTO hinh_anh (link, id_san_pham)
VALUES
-- 1001 -> 1000
('https://i.ibb.co/rC8r4mK/nuoc-hoa-calvin-klein-ck-ck-one-cho-ca-nam-va-nu-15ml-5c6299a13d249-12022019170209.webp', 1000),
('https://i.ibb.co/DDgL0Jf0/calvin-klein-ck-one-3-1-jpg.webp', 1000),
('https://i.ibb.co/0y8xYCq8/calvin-klein-ck-one-7-1-jpg.webp', 1000),
-- 1002 -> 1001
('https://i.ibb.co/JRk5gyNK/nuoc-hoa-calvin-klein-ck-be-huong-thom-phan-tang-manh-me-15ml-5c60dc199b5f2-11022019092113.webp', 1001),
('https://i.ibb.co/hFZLYTW5/calvin-klein-ck-be-3-2-jpg.webp', 1001),
('https://i.ibb.co/S7DQJGFN/calvin-klein-ck-be-4-2-jpg.webp', 1001),
-- 1003 -> 1002
('https://i.ibb.co/r231z11S/nuoc-hoa-nam-dior-sauvage-eau-forte-parfum-10ml-670deef52a3e9-15102024112629.webp', 1002),
('https://i.ibb.co/qK0yHG8/nuoc-hoa-nam-dior-sauvage-eau-forte-parfum-100ml-66fa0e682a401-30092024093520.webp', 1002),
('https://i.ibb.co/Cp6jmJ7G/dior-sauvage-eau-forte-parfum-01-56390a4bd6e747c9a73cdd42efc29874-master.jpg', 1002),
-- 1004 -> 1003
('https://i.ibb.co/wrM4wfK1/nuoc-hoa-nam-christian-dior-sauvage-edp-dam-chat-hien-dai-100ml-5eec8f69593c6-19062020171153.webp', 1003),
('https://i.ibb.co/jvg5b15V/dior-sauvage-edp-10ml-8c589e65059e41db86a61ff49fd51777-master.jpg', 1003),
('https://i.ibb.co/3mYXZyf6/dior-sauvage-edp-7-6e4efe34ea0345e6a8cf0f8ec90c098c-master.jpg', 1003),
-- 1005 -> 1004
('https://i.ibb.co/4R5v2xT8/nuoc-hoa-nam-chanel-bleu-de-chanel-eau-de-parfum-edp-100ml-673ee2b02ebb9-21112024143512.webp', 1004),
-- 1006 -> 1005
('https://i.ibb.co/hJxcXcwr/nuoc-hoa-nu-chanel-coco-mademoiselle-edp-100ml-phien-ban-le-hoi-2024-67495f61b86b8-29112024132953.webp', 1005),
('https://i.ibb.co/bMrk8JYM/chanel-coco-mademoiselle-edp-10ml-cbcfced184d84fbfab969c2fb05c75bd-master.jpg', 1005),
('https://i.ibb.co/HD0HVJKF/chanel-coco-mademoiselle-edp-6-8aa90e818d764c0a84d44dcb4dc930c5-master.jpg', 1005),
-- 1007 -> 1006
('https://i.ibb.co/ZpRvNn98/nuoc-hoa-nam-chanel-allure-homme-sport-eau-de-toilette-edt-100ml-6762487ad5e00-18122024105850.webp', 1006),
('https://i.ibb.co/jZD7Z1cb/chanel-allure-home-sport-edt-10ml-ab08965543e84e45993ef2f2427b2d78-master.jpg', 1006),
('https://i.ibb.co/T3vgRLR/chanel-allure-home-sport-edt-3-0bfd3d7ac0fb4d0f8082de100342db29-master.jpg', 1006),
-- 1008 -> 1007
('https://i.ibb.co/HpHhbn6g/nuoc-hoa-nu-gucci-guilty-elixir-de-parfum-pour-femme-parfum-5ml-66adaf91c0d50-03082024111825.webp', 1007),
('https://i.ibb.co/TBdtmnjd/1700044131-4775.png', 1007),
('https://i.ibb.co/k2pLbdwz/1700044131-8844.png', 1007),
-- 1009 -> 1008
('https://i.ibb.co/Zz8NSygD/nuoc-hoa-nu-chanel-coco-vaporisateur-spray-edp-50ml-6781d4bbe50c4-11012025091731.webp', 1008),
('https://i.ibb.co/00ycBNn/chanel-coco-edp-10ml-43a161d1fbdd40719a465f24cb8fad8e-master.jpg', 1008),
('https://i.ibb.co/0vq7F7R/chanel-coco-edp-6-9fe62afd393e4b88a11a937035825712-master.jpg', 1008),
-- 1010 -> 1009
('https://i.ibb.co/B2bKWd2v/nuoc-hoa-nu-chanel-chance-eau-fraiche-edt-100ml-676b6a829f5c0-25122024091426.webp', 1009),
('https://i.ibb.co/xq82dqTZ/chanel-chance-eau-fraiche-edt-10ml-130da1d0640a43ac8997959619c937ab-master.jpg', 1009),
('https://i.ibb.co/9HKf6dHw/chanel-chance-eau-fraiche-edt-6-1e5ba2820698416a8b306501b53772bf-master.jpg', 1009),
-- 1011 -> 1010
('https://i.ibb.co/bjNbpDkg/nuoc-hoa-versace-eros-cho-nam-say-dam-phai-nu-minisize-5ml-5db936dcd37ed-30102019140812.webp', 1010),
('https://i.ibb.co/s9YJ1Lhf/versace-eros-edp-10ml-7db33c88077f4e548a7834291e6af024-master.jpg', 1010),
('https://i.ibb.co/rKHJ0XvM/versace-eros-edp-6-6145306dd3444e729c9c90d7e2bc40fb-master.jpg', 1010),
-- 1012 -> 1011
('https://i.ibb.co/5hjDN9pV/nuoc-hoa-nam-versace-pour-homme-100ml-6752798f12686-06122024111159.webp', 1011),
('https://i.ibb.co/f3TQ24K/versace-pour-homme-edt-10ml-0c6df6654991402184c88ff4957835a8-master.jpg', 1011),
('https://i.ibb.co/Ld5Ff4RJ/versace-pour-homme-edt-8-4a9959bafa2e49549680d215bce26daf-master.jpg', 1011),
-- 1013 -> 1012
('https://i.ibb.co/xtws7Tm5/nuoc-hoa-nam-versace-pour-homme-oud-noir-100ml-t-hn-677f298b9ba34-09012025084235.webp', 1012),
('https://i.ibb.co/WNVbZW61/versace-pour-homme-oud-noir-edp-10ml-568e5949e28f441684549f0e2a99ef03-master.jpg', 1012),
('https://i.ibb.co/yFHTG7Wt/versace-pour-homme-oud-noir-edp-1-bff335cebbd24ba898b94785a2bf24f5-master.jpg', 1012),
-- 1014 -> 1013
('https://i.ibb.co/Y4vLNcrt/nuoc-hoa-nam-versace-eros-parfum-100ml-6284667403eef-18052022102228.webp', 1013),
-- 1015 -> 1014
('https://i.ibb.co/Nnbv5nN9/nuoc-hoa-nu-versace-bright-crystal-edt-200ml-674d36c9e1226-02122024112545.webp', 1014),
('https://i.ibb.co/JjP5Y84t/versace-bright-crystal-edt-10ml-d64ce95a5a76413ab568b81142abd8bb-master.jpg', 1014),
('https://i.ibb.co/NnG0Lgw0/versace-bright-crystal-edt-4-8e4c8fe97e514ef781d3c8dfc9d8d541-master.jpg', 1014),
-- 1016 -> 1015
('https://i.ibb.co/jk9SP0jc/nuoc-hoa-nu-versace-crystal-noir-parfum-90ml-6749613b9ab3d-29112024133747.webp', 1015),
('https://i.ibb.co/KpMRx2T9/versace-crystal-noir-edt-10ml-29fc83a10e3d401599949b5c5a061894-master.jpg', 1015),
('https://i.ibb.co/TNh231r/versace-crystal-noir-edt-6-40f1121d014d40f1b35fddbf93b62f00-master.jpg', 1015),
-- 1017 -> 1016
('https://i.ibb.co/36Mbgcn/nuoc-hoa-nam-versace-eros-flame-eau-de-parfum-edp-100ml-674680f5f137f-27112024091621.webp', 1016),
('https://i.ibb.co/VcFTjMy6/versace-eros-flame-edp-10ml-1e270bbbbeac4ec6a2e39a7085a93a42-master.jpg', 1016),
('https://i.ibb.co/0RDVZKy3/versace-eros-flame-edp-5-01f74a9ad5794c43a84f6402a63c36c9-master.jpg', 1016),
-- 1018 -> 1017
('https://i.ibb.co/n836nYry/nuoc-hoa-nam-armaf-club-de-nuit-intense-man-eau-de-toilette-105ml-6711b6a62a9b0-18102024081518.webp', 1017),
('https://i.ibb.co/Rkc64TYR/armaf-club-de-nuit-intense-man-edt-10ml-fabcb22ad4d1413b95632c53ff7cbec0-master.jpg', 1017),
('https://i.ibb.co/8gsvrpTy/armaf-club-de-nuit-intense-man-edt-3-6fade200fff240ca8c2ec00d3e661fdb-master.jpg', 1017),
-- 1019 -> 1018
('https://i.ibb.co/27B4qXg8/nuoc-hoa-unisex-armaf-uniq-oud-forever-eau-de-parfum-100ml-677cd8604f904-07012025143144.webp', 1018),
('https://i.ibb.co/zTD0T7jp/nuoc-hoa-unisex-armaf-uniq-oud-forever-eau-de-parfum-100ml-677cd8604ee1e-07012025143144.webp', 1018),
('https://i.ibb.co/Q74xGNjp/nuoc-hoa-unisex-armaf-uniq-oud-forever-eau-de-parfum-100ml-677cd8604f47c-07012025143144.webp', 1018),
-- 1020 -> 1019
('https://i.ibb.co/rRbjDnj7/nuoc-hoa-nu-armaf-yum-yum-edp-100ml-677ba24b611b6-06012025162843.webp', 1019),
('https://i.ibb.co/9HSPV1VY/nuoc-hoa-nu-armaf-yum-yum-edp-100ml-677ba24b61b38-06012025162843.webp', 1019),
('https://i.ibb.co/9HSPV1VY/nuoc-hoa-nu-armaf-yum-yum-edp-100ml-677ba24b61b38-06012025162843.webp', 1019),
-- 1021 -> 1020
('https://i.ibb.co/CKKzsGd9/nuoc-hoa-nu-armaf-club-de-nuit-eau-de-parfum-105ml-6712004dd0bf0-18102024132933.webp', 1020),
('https://i.ibb.co/7trCCrX4/armaf-club-de-nuit-woman-edp-10ml-e931e4eb0e70431f8c75ccdde34a6964-master.jpg', 1020),
('https://i.ibb.co/HfjXYFTX/armaf-club-de-nuit-woman-edp-6-c165304cf5e846c1ae8d41755aab2d46-master.jpg', 1020),
-- 1022 -> 1021
('https://i.ibb.co/zWN4LnZm/nuo-c-hoa-nam-armaf-club-de-nuit-el-cielo-pour-homme-edp-100ml-6667f91b718e2-11062024141331.webp', 1021),
('https://i.ibb.co/xtVwjbyg/nuoc-hoa-nam-armaf-club-de-nuit-el-cielo-pour-homme-edp-100ml-03-jpg-1718090060-11062024141420.webp', 1021),
('https://i.ibb.co/JWvBT3t4/nuoc-hoa-nam-armaf-club-de-nuit-el-cielo-pour-homme-edp-100ml-01-jpg-1718090067-11062024141427.webp', 1021),
-- 1023 -> 1022
('https://i.ibb.co/1Jp5YfQk/nuoc-hoa-unisex-armaf-club-de-nuit-untold-edp-105ml-63f9779e4ad3b-25022023095110.webp', 1022),
('https://i.ibb.co/wFZXY9JH/armaf-club-de-nuit-untold-edp-10ml-9621e096a9bc4dc2a02745a7a31eac0b-compact.jpg', 1022),
('https://i.ibb.co/S7xKxkGJ/armaf-club-de-nuit-untold-edp-1-99c56ba4f71948bd94a2ff5a2354da14-master.jpg', 1022),
-- 1024 -> 1023
('https://i.ibb.co/DH2KL5pq/nuoc-hoa-nam-lacoste-l-12-12-blanc-eau-intense-edt-100ml-66fa728b84474-30092024164235.webp', 1023),
('https://i.ibb.co/XxvcPXSC/nuoc-hoa-nam-lacoste-l-12-12-blanc-eau-intense-edt-100ml-66fa728b84f69-30092024164235.webp', 1023),
('https://i.ibb.co/BHZkyDwy/nuoc-hoa-nam-lacoste-l-12-12-blanc-eau-intense-edt-100ml-66fa728b85373-30092024164235.webp', 1023),
-- 1025 -> 1024
('https://i.ibb.co/8gtzTMTW/nuoc-hoa-nam-lacoste-essential-pour-homme-edt-125ml-64239e14a14e1-29032023091028.webp', 1024),
('https://i.ibb.co/5gz6Nnpg/nuoc-hoa-nam-lacoste-essential-pour-homme-edt-2-jpg-1678670831-13032023082711-jpg-1680055855-2903202.webp', 1024),
('https://i.ibb.co/B2x5gdCS/nuoc-hoa-nam-lacoste-essential-pour-homme-edt-4-jpg-1678670885-13032023082805-jpg-1680055867-2903202.webp', 1024),
-- 1026 -> 1025
('https://i.ibb.co/5XZG9HVC/nuoc-hoa-lacoste-l-12-12-white-blanc-cho-nam-175ml-6075055bea200-13042021094339.webp', 1025),
('https://i.ibb.co/CsWVnrS9/lacoste-eau-de-l-12-12-white-edt-10ml-02beea3d51044320b03de2921f9b7716-master.jpg', 1025),
('https://i.ibb.co/0jcv0PBS/lacoste-eau-de-l-12-12-white-edt-6-44e0639ae305450681e1753187acf263-master.jpg', 1025),
-- 1027 -> 1026
('https://i.ibb.co/4ZhYxyd7/nuoc-hoa-nu-lacoste-pour-femme-elixir-edp-90ml-67497996371a3-29112024152142.webp', 1026),
('https://i.ibb.co/cSLL6Y4z/lacoste-pour-femme-edp-90ml-5-054bfccd936d4b9296f05891051c4777-master.jpg', 1026),
('https://i.ibb.co/WWhnkBT3/lacoste-pour-femme-edp-90ml-4-1fbac3e901c64d378c83b160f60814b2-master.jpg', 1026),
-- 1028 -> 1027
('https://i.ibb.co/nyx6ssh/nuoc-hoa-nam-dolce-gabbana-d-g-light-blue-pour-homme-edt-125ml-677e1795d69c8-08012025131341.webp', 1027),
('https://i.ibb.co/JRcRdhnm/nuoc-hoa-dg-light-blue-for-men-100ml-jpg-1622707615-03062021150655.webp', 1027),
('https://i.ibb.co/4RvTW85r/dolce-gabbana-light-blue-pour-homme-eau-de-toilette-125-ml-15352701-26840737-2048-jpg-1606468660-271.webp', 1027),
-- 1029 -> 1028
('https://i.ibb.co/JFR8BswM/nuoc-hoa-nam-dolce-gabbana-d-g-light-blue-eau-intense-pour-homme-eau-de-parfum-100ml-676e5fa47dcce-2.webp', 1028),
('https://i.ibb.co/V0Ssr80q/nuoc-hoa-nam-dolce-gabbana-d-g-light-blue-eau-intense-pour-homme-eau-de-parfum-100ml-676e5face2100-2.webp', 1028),
('https://i.ibb.co/5h83Yy4X/nuoc-hoa-nam-dolce-gabbana-d-g-light-blue-eau-intense-pour-homme-eau-de-parfum-100ml-676e5face1ec1-2.webp', 1028),
-- 1030 -> 1029
('https://i.ibb.co/q32d5xLN/nuoc-hoa-nu-dolce-gabbana-d-g-l-imperatrice-3-pour-femme-eau-de-toilette-100ml-673eef7f1d429-2111202.webp', 1029),
('https://i.ibb.co/RkTydfbZ/nuoc-hoa-nu-dolce-gabbana-d-g-l-imperatrice-3-pour-femme-eau-de-toilette-100ml-673eef7f1d888-2111202.webp', 1029);
GO

-- 12. Chèn dữ liệu vào bảng spct
-- Sửa id_san_pham: giảm đi 1 (1001 thành 1000, 1002 thành 1001, ..., 1030 thành 1029)
INSERT INTO spct (don_gia, so_luong_ton_kho, id_san_pham, dung_tich)
VALUES
-- 1001 -> 1000
(549000, 50, 1000, 10),
(949000, 50, 1000, 30),
-- 1002 -> 1001
(520000, 20, 1001, 10),
(990000, 20, 1001, 30),
-- 1003 -> 1002
(480000, 40, 1002, 10),
(4550000, 40, 1002, 100),
-- 1004 -> 1003
(400000, 30, 1003, 10),
(3150000, 30, 1003, 60),
(3800000, 30, 1003, 100),
(5100000, 30, 1003, 200),
-- 1005 -> 1004
(430000, 30, 1004, 10),
(3300000, 30, 1004, 50),
(4150000, 30, 1004, 100),
(5300000, 30, 1004, 150),
-- 1006 -> 1005
(530000, 30, 1005, 10),
(3800000, 30, 1005, 50),
(4700000, 30, 1005, 100),
(6700000, 30, 1005, 200),
-- 1007 -> 1006
(400000, 30, 1006, 10),
(2850000, 30, 1006, 50),
(3700000, 30, 1006, 100),
(4400000, 30, 1006, 150),
-- 1008 -> 1007
(390000, 30, 1007, 5),
-- 1009 -> 1008
(430000, 30, 1008, 10),
(2900000, 30, 1008, 50),
(3850000, 30, 1008, 100),
-- 1010 -> 1009
(450000, 30, 1009, 10),
(3300000, 30, 1009, 50),
(4250000, 30, 1009, 100),
(5540000, 30, 1009, 150),
-- 1011 -> 1010
(300000, 30, 1010, 10),
(1550000, 30, 1010, 50),
(2150000, 30, 1010, 100),
-- 1012 -> 1011
(280000, 30, 1011, 10),
(1400000, 30, 1011, 50),
(1800000, 30, 1011, 100),
(2400000, 30, 1011, 200),
-- 1013 -> 1012
(300000, 30, 1012, 10),
(2350000, 30, 1012, 100),
-- 1014 -> 1013
(1990000, 30, 1013, 100),
-- 1015 -> 1014
(280000, 30, 1014, 10),
(1250000, 30, 1014, 30),
(1450000, 30, 1014, 50),
(1900000, 30, 1014, 90),
-- 1016 -> 1015
(300000, 30, 1015, 10),
(2850000, 30, 1015, 90),
-- 1017 -> 1016
(300000, 30, 1016, 10),
(1550000, 30, 1016, 50),
(2150000, 30, 1016, 100),
-- 1018 -> 1017
(200000, 30, 1017, 10),
(1050000, 30, 1017, 105),
-- 1019 -> 1018
(1100000, 30, 1018, 100),
-- 1020 -> 1019
(1100000, 30, 1019, 100),
-- 1021 -> 1020
(185000, 30, 1020, 10),
(850000, 30, 1020, 105),
-- 1022 -> 1021
(690000, 30, 1021, 100),
-- 1023 -> 1022
(250000, 30, 1022, 10),
(1450000, 30, 1022, 105),
-- 1024 -> 1023
(1450000, 30, 1023, 100),
-- 1025 -> 1024
(1350000, 30, 1024, 125),
-- 1026 -> 1025
(230000, 30, 1025, 10),
(1690000, 30, 1025, 100),
(2150000, 30, 1025, 175),
-- 1027 -> 1026
(300000, 30, 1026, 10),
(2450000, 30, 1026, 90),
-- 1028 -> 1027
(1480000, 30, 1027, 125),
(2300000, 30, 1027, 200),
-- 1029 -> 1028
(1650000, 30, 1028, 100),
(2750000, 30, 1028, 200),
-- 1030 -> 1029
(1390000, 30, 1029, 100);
GO

-- 13. Chèn dữ liệu vào bảng tai_khoan
-- Chuẩn hóa định dạng tên, email, và vai trò
INSERT INTO tai_khoan (ho_ten, email, sdt, vai_tro, ten_dang_nhap, mat_khau)
VALUES 
(N'Lại Văn Quang', 'quangvan0982@gmail.com', '0855616615', N'ADMIN', 'lvqdzvl', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Thị Mai', 'mai.nguyen@email.com', '0912345678', N'STAFF', 'mai.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Trần Minh Tuấn', 'tuan.tran@email.com', '0987654321', N'STAFF', 'tuan.tran', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Lê Thanh Sơn', 'son.le@email.com', '0934567890', N'STAFF', 'son.le', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Quang Hiếu', 'hieu.nguyen@email.com', '0945678901', N'STAFF', 'hieu.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Phạm Minh Hiếu', 'hieu.pham@email.com', '0963456789', N'STAFF', 'hieu.pham', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Vũ Thị Lan', 'lan.vu@email.com', '0908765432', N'STAFF', 'lan.vu', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Bùi Thủy Anh', 'anh.bui@email.com', '0923456789', N'STAFF', 'anh.bui', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Hoàng Nam', 'nam.nguyen@email.com', '0978765432', N'STAFF', 'nam.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Đỗ Thị Mai', 'mai.do@email.com', '0911122233', N'STAFF', 'mai.do', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Phan Thanh Tú', 'tu.phan@email.com', '0909876543', N'STAFF', 'tu.phan', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Thị Lan', 'lan.nguyen@email.com', '0912345678', N'USER', 'lan.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Trần Minh Anh', 'anh.tran@email.com', '0987654321', N'USER', 'anh.tran', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Lê Thanh Phát', 'phat.le@email.com', '0934567890', N'USER', 'phat.le', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Quang Sơn', 'son.nguyen@email.com', '0945678901', N'USER', 'son.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Phạm Minh Hiền', 'hien.pham@email.com', '0963456789', N'USER', 'hien.pham', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Vũ Thị Mai', 'mai.vu@email.com', '0908765432', N'USER', 'mai.vu', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Bùi Thủy Thi', 'thi.bui@email.com', '0923456789', N'USER', 'thi.bui', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Nguyễn Hoàng Dương', 'duong.nguyen@email.com', '0978765432', N'USER', 'duong.nguyen', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Đỗ Thị Hoa', 'hoa.do@email.com', '0911122233', N'USER', 'hoa.do', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce'),
(N'Phan Thanh Thảo', 'thao.phan@email.com', '0909876543', N'USER', 'thao.phan', '$2a$12$Osg6aM0.0wZkERVJGGZyteO19owC27TSpPqcHE2N/xFMfyNVYkJce');
GO
INSERT INTO mui_huong (ten_mui_huong, mo_ta) VALUES
(N'Hương cam chanh tươi mát', N'Hương thanh mát, sảng khoái từ các loại cam, chanh – thuộc nhóm Citrus Aromatic'),
(N'Hương gỗ trầm ấm', N'Hương thơm trầm lắng, nam tính từ các loại gỗ quý – thuộc nhóm Oriental Woody'),
(N'Hương biển tươi mới', N'Hương mặn mà, trong lành, gợi nhớ đến làn gió đại dương – thuộc nhóm Aromatic Fougere'),
(N'Hương hoa cỏ ngọt ngào', N'Hương thơm nhẹ nhàng, nữ tính từ các loài hoa – thuộc nhóm Floral Fruity'),
(N'Hương thảo mộc xanh mát', N'Hương tự nhiên, thanh mát từ bạc hà, oải hương và thảo dược – thuộc nhóm Aromatic Fougere'),
(N'Hương vani ấm áp', N'Hương ngọt ngào, dịu nhẹ, tạo cảm giác ấm áp – thuộc nhóm Oriental Floral'),
(N'Hương xạ hương nồng nàn', N'Hương quyến rũ, bền lâu, tạo chiều sâu cho nước hoa – thuộc nhóm Floral Woody Musk'),
(N'Hương da thuộc cổ điển', N'Hương mạnh mẽ, sang trọng, mang phong cách cổ điển – thuộc nhóm Oriental Woody'),
(N'Hương síp hoa cỏ', N'Sự kết hợp hài hòa giữa hoa cỏ, rêu và hương cam – thuộc nhóm Chypre Floral'),
(N'Hương trái cây tươi ngọt', N'Hương ngọt ngào, mọng nước từ các loại trái cây – thuộc nhóm Floral Fruity'),
(N'Hương gỗ cay nồng', N'Sự kết hợp của gỗ và các loại gia vị như tiêu đen, gừng – thuộc nhóm Woody Spicy'),
(N'Hương xanh tươi', N'Mùi hương tươi mới từ lá cây, cỏ non – thuộc nhóm Green'),
(N'Hương hoa trắng dịu nhẹ', N'Hương trong trẻo, tinh tế từ các loài hoa trắng như nhài, huệ – thuộc nhóm Floral'),
(N'Hương caramel ngọt ngào', N'Hương ngọt như món tráng miệng, mang lại cảm giác dễ chịu – thuộc nhóm Gourmand'),
(N'Hương khói bí ẩn', N'Hương ấm và sâu lắng, mang lại cảm giác cuốn hút, trầm mặc – thuộc nhóm Oriental Woody'),
(N'Hương oải hương thư giãn', N'Mùi thảo mộc nhẹ nhàng, giúp xua tan căng thẳng – thuộc nhóm Aromatic Fougere'),
(N'Hương hoa hồng cổ điển', N'Mùi hương đặc trưng, sang trọng từ hoa hồng – thuộc nhóm Floral'),
(N'Hương aldehyde sang trọng', N'Mùi hương nhân tạo thanh thoát, thường dùng trong nước hoa cổ điển – thuộc nhóm Floral Aldehyde');
GO
INSERT INTO mui_huong_nhom_huong (id_mui_huong, id_nhom_huong) VALUES
-- 1000: Hương cam chanh tươi mát
(1000, 1000), -- Citrus
(1000, 1003), -- Citrus Aromatic

-- 1001: Hương gỗ trầm ấm
(1001, 1006), -- Oriental Woody
(1001, 1004), -- Woody Aromatic
(1001, 1013), -- Hương gỗ tươi mát

-- 1002: Hương biển tươi mới
(1002, 1002), -- Aromatic Fougere
(1002, 1017), -- Marine

-- 1003: Hương hoa cỏ ngọt ngào
(1003, 1010), -- Floral Fruity
(1003, 1016), -- Fruity
(1003, 1001), -- Floral Woody Musk

-- 1004: Hương thảo mộc xanh mát
(1004, 1002), -- Aromatic Fougere
(1004, 1015), -- Green

-- 1005: Hương vani ấm áp
(1005, 1011), -- Oriental Floral
(1005, 1019), -- Gourmand

-- 1006: Hương xạ hương nồng nàn
(1006, 1001), -- Floral Woody Musk
(1006, 1020), -- Musk

-- 1007: Hương da thuộc cổ điển
(1007, 1006), -- Oriental Woody
(1007, 1018), -- Leather

-- 1008: Hương síp hoa cỏ
(1008, 1012), -- Hương hoa cỏ síp
(1008, 1021), -- Chypre Fruity
(1008, 1005), -- Hương thơm hoa cỏ Chypre

-- 1009: Hương trái cây tươi ngọt
(1009, 1010), -- Floral Fruity
(1009, 1016), -- Fruity
(1009, 1021), -- Chypre Fruity

-- 1010: Hương gỗ cay nồng
(1010, 1013), -- Hương gỗ tươi mát
(1010, 1014), -- Woody Spicy

-- 1011: Hương xanh tươi
(1011, 1015), -- Green
(1011, 1002), -- Aromatic Fougere

-- 1012: Hương hoa trắng dịu nhẹ
(1012, 1001), -- Floral Woody Musk
(1012, 1000), -- Citrus

-- 1013: Hương caramel ngọt ngào
(1013, 1019), -- Gourmand
(1013, 1011), -- Oriental Floral

-- 1014: Hương khói bí ẩn
(1014, 1006), -- Oriental Woody
(1014, 1014), -- Woody Spicy

-- 1015: Hương oải hương thư giãn
(1015, 1002), -- Aromatic Fougere
(1015, 1004), -- Woody Aromatic

-- 1016: Hương hoa hồng cổ điển
(1016, 1001), -- Floral Woody Musk
(1016, 1011), -- Oriental Floral

-- 1017: Hương aldehyde sang trọng
(1017, 1014), -- Floral Aldehyde
(1017, 1001); -- Floral Woody Musk
GO
-- Hương cam chanh tươi mát – id_mui_huong = 1000
INSERT INTO not_huong (ten_not_huong, mo_ta, id_mui_huong) VALUES
(N'Cam Bergamot', N'Nốt đầu mang lại cảm giác sảng khoái, tươi mới', 1000),
(N'Chanh vàng', N'Nốt đầu giúp tăng độ thanh mát, năng động', 1000),
(N'Lá bạc hà', N'Nốt giữa mang lại cảm giác the mát, dễ chịu', 1000),

-- Hương gỗ trầm ấm – id_mui_huong = 1001
(N'Gỗ đàn hương', N'Nốt cuối tạo chiều sâu ấm áp, sang trọng', 1001),
(N'Gỗ tuyết tùng', N'Nốt giữa giúp giữ mùi lâu, mang lại sự vững chãi', 1001),
(N'Hổ phách', N'Nốt cuối có độ ngọt nhẹ, ấm nồng', 1001),

-- Hương biển tươi mới – id_mui_huong = 1002
(N'Phong lữ', N'Nốt giữa mang lại sự thanh mát như gió biển', 1002),
(N'Muối biển', N'Nốt đầu mang đến cảm giác mặn mà, tươi mới', 1002),
(N'Musk trắng', N'Nốt cuối tạo sự sạch sẽ và bền hương', 1002),

-- Hương hoa cỏ ngọt ngào – id_mui_huong = 1003
(N'Hoa nhài', N'Nốt giữa ngọt ngào, nữ tính', 1003),
(N'Hoa hồng', N'Nốt đầu quyến rũ và thanh lịch', 1003),
(N'Xạ hương', N'Nốt cuối giúp lưu hương lâu, tạo chiều sâu', 1003),

-- Hương thảo mộc xanh mát – id_mui_huong = 1004
(N'Oải hương', N'Nốt giữa làm dịu tâm trí và tạo cảm giác thư giãn', 1004),
(N'Bạc hà', N'Nốt đầu the mát, kích thích giác quan', 1004),
(N'Hương thảo', N'Nốt giữa đậm chất thảo mộc, tươi xanh', 1004),

-- Hương vani ấm áp – id_mui_huong = 1005
(N'Vani', N'Nốt cuối ngọt ngào, ấm áp và dễ chịu', 1005),
(N'Đậu tonka', N'Nốt giữa tạo cảm giác êm dịu và bền mùi', 1005),
(N'Hoa cam', N'Nốt đầu nhẹ nhàng, dễ chịu', 1005),
-- Hương xạ hương nồng nàn – id_mui_huong = 1006

(N'Xạ hương trắng', N'Nốt cuối bền lâu và quyến rũ', 1006),
(N'Gỗ đàn hương', N'Nốt giữa bổ sung chiều sâu và độ mịn màng', 1006),
(N'Hoa mẫu đơn', N'Nốt đầu nhẹ nhàng, tinh tế', 1006),

-- Hương da thuộc cổ điển – id_mui_huong = 1007
(N'Da thuộc', N'Nốt giữa mang phong cách cổ điển, mạnh mẽ', 1007),
(N'Gỗ guaiac', N'Nốt cuối khói nhẹ và bí ẩn', 1007),
(N'Cây bách', N'Nốt đầu gợi cảm giác sang trọng, khô ráo', 1007),

-- Hương síp hoa cỏ – id_mui_huong = 1008
(N'Rêu sồi', N'Nốt cuối đặc trưng của nhóm Chypre, tạo độ ấm và sâu', 1008),
(N'Hoa cam neroli', N'Nốt đầu tươi sáng, gợi cảm', 1008),
(N'Hoa huệ', N'Nốt giữa nồng nàn, nữ tính', 1008),

-- Hương trái cây tươi ngọt – id_mui_huong = 1009
(N'Dâu tây', N'Nốt đầu ngọt ngào, mọng nước', 1009),
(N'Đào', N'Nốt giữa mềm mại, hấp dẫn', 1009),
(N'Xạ hương', N'Nốt cuối giữ mùi lâu và tạo độ cuốn hút', 1009);
--fake hết nhá
GO
INSERT INTO huong_dau_not_huong (id_huong_dau, id_not_huong) VALUES
(1000, 1000),
(1001, 1003),
(1002, 1006),
(1003, 1009),
(1004, 1012),
(1005, 1015),
(1006, 1018),
(1007, 1021),
(1008, 1024),
(1009, 1027);
GO

INSERT INTO huong_giua_not_huong (id_huong_giua, id_not_huong) VALUES
(1000, 1001),
(1001, 1004),
(1002, 1007),
(1003, 1010),
(1004, 1013),
(1005, 1016),
(1006, 1019),
(1007, 1022),
(1008, 1025),
(1009, 1028);
GO

INSERT INTO huong_cuoi_not_huong (id_huong_cuoi, id_not_huong) VALUES
(1000, 1002),
(1001, 1005),
(1002, 1008),
(1003, 1011),
(1004, 1014),
(1005, 1017),
(1006, 1020),
(1007, 1023),
(1008, 1026),
(1009, 1029);
GO

INSERT INTO phong_cach (ten_phong_cach, mo_ta) VALUES
(N'Năng động', N'Phong cách trẻ trung, cá tính, luôn tràn đầy năng lượng và sẵn sàng cho mọi hoạt động.'),
(N'Thanh lịch', N'Phong cách trưởng thành, nhã nhặn, thể hiện sự tinh tế và điềm đạm.'),
(N'Quyến rũ', N'Phong cách nổi bật và thu hút, tôn lên vẻ đẹp gợi cảm một cách tinh tế.'),
(N'Thoải mái', N'Phong cách đơn giản, dễ chịu, ưu tiên sự tiện lợi và linh hoạt trong trang phục.'),
(N'Tươi mát', N'Phong cách nhẹ nhàng, trẻ trung, mang lại cảm giác trong trẻo và dễ chịu.'),
(N'Ấm áp', N'Phong cách dịu dàng, gần gũi, tạo cảm giác thân thiện và an yên.'),
(N'Gợi cảm', N'Phong cách mạnh mẽ, nổi bật với sự quyến rũ và cá tính rõ rệt.'),
(N'Nữ tính', N'Phong cách dịu dàng, mềm mại, tôn vinh vẻ đẹp đặc trưng của phái nữ.');

--fake hết nhá
GO
INSERT INTO san_pham_phong_cach (id_san_pham, id_phong_cach) VALUES
(1000, 1000), (1000, 1006),
(1001, 1001), (1001, 1002),
(1002, 1004), (1002, 1007),
(1003, 1003), (1003, 1005),
(1004, 1002), (1004, 1006),
(1005, 1004), (1005, 1007),
(1006, 1000), (1006, 1003),
(1007, 1001), (1007, 1005),
(1008, 1002), (1008, 1006),
(1009, 1000), (1009, 1001),
(1010, 1003), (1010, 1004),
(1011, 1002), (1011, 1007),
(1012, 1000), (1012, 1004),
(1013, 1001), (1013, 1007),
(1014, 1005), (1014, 1003),
(1015, 1006), (1015, 1002),
(1016, 1004), (1016, 1007),
(1017, 1000), (1017, 1003),
(1018, 1001), (1018, 1002),
(1019, 1006), (1019, 1007),
(1020, 1004), (1020, 1005),
(1021, 1003), (1021, 1000),
(1022, 1002), (1022, 1006),
(1023, 1001), (1023, 1005),
(1024, 1007), (1024, 1004),
(1025, 1000), (1025, 1006),
(1026, 1003), (1026, 1005),
(1027, 1002), (1027, 1007),
(1028, 1001), (1028, 1004),
(1029, 1007), (1029, 1001),(1029, 1002);
GO
--fake hết nhá
INSERT INTO san_pham_mui_huong (id_san_pham, id_mui_huong, prominence) VALUES
-- SP0001: Nước Hoa Calvin Klein CK One (Unisex)
(1000, 1000, 0.9),  -- Hương cam chanh tươi mát (rất nổi bật)
(1000, 1004, 0.7),  -- Hương thảo mộc xanh mát
(1000, 1006, 0.5),  -- Hương xạ hương nồng nàn
(1000, 1003, 0.3),  -- Hương hoa cỏ ngọt ngào

-- SP0002: Nước Hoa Calvin Klein CK Be (Nam)
(1001, 1001, 0.8),  -- Hương gỗ trầm ấm (rất nổi bật)
(1001, 1004, 0.6),  -- Hương thảo mộc xanh mát
(1001, 1006, 0.4),  -- Hương xạ hương nồng nàn
(1001, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0003: Nước Hoa Nam Dior Sauvage Eau Forte Parfum (Nam)
(1002, 1001, 0.9),  -- Hương gỗ trầm ấm (rất nổi bật)
(1002, 1007, 0.7),  -- Hương da thuộc cổ điển
(1002, 1004, 0.5),  -- Hương thảo mộc xanh mát
(1002, 1000, 0.3),  -- Hương cam chanh tươi mát

-- SP0004: Nước Hoa Nam Dior Sauvage EDP (Nam)
(1003, 1001, 0.85), -- Hương gỗ trầm ấm
(1003, 1004, 0.65), -- Hương thảo mộc xanh mát
(1003, 1007, 0.45), -- Hương da thuộc cổ điển
(1003, 1000, 0.25), -- Hương cam chanh tươi mát

-- SP0005: Nước Hoa Nam Chanel Bleu De Chanel EDP (Nam)
(1004, 1001, 0.9),  -- Hương gỗ trầm ấm
(1004, 1004, 0.6),  -- Hương thảo mộc xanh mát
(1004, 1006, 0.4),  -- Hương xạ hương nồng nàn
(1004, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0006: Nước Hoa Nữ Chanel Coco Mademoiselle EDP (Nữ)
(1005, 1003, 0.9),  -- Hương hoa cỏ ngọt ngào
(1005, 1000, 0.7),  -- Hương cam chanh tươi mát
(1005, 1005, 0.5),  -- Hương vani ấm áp
(1005, 1008, 0.3),  -- Hương síp hoa cỏ

-- SP0007: Nước Hoa Nam Chanel Allure Homme Sport EDT (Nam)
(1006, 1000, 0.8),  -- Hương cam chanh tươi mát
(1006, 1001, 0.6),  -- Hương gỗ trầm ấm
(1006, 1004, 0.4),  -- Hương thảo mộc xanh mát
(1006, 1006, 0.2),  -- Hương xạ hương nồng nàn

-- SP0008: Nước Hoa Nữ Gucci Guilty Elixir De Parfum (Nữ)
(1007, 1003, 0.9),  -- Hương hoa cỏ ngọt ngào
(1007, 1009, 0.7),  -- Hương trái cây tươi ngọt
(1007, 1005, 0.5),  -- Hương vani ấm áp
(1007, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0009: Nước Hoa Nữ Chanel Coco EDP (Nữ)
(1008, 1003, 0.85), -- Hương hoa cỏ ngọt ngào
(1008, 1005, 0.65), -- Hương vani ấm áp
(1008, 1008, 0.45), -- Hương síp hoa cỏ
(1008, 1006, 0.25), -- Hương xạ hương nồng nàn

-- SP0010: Nước Hoa Nữ Chanel Chance Eau Fraiche EDT (Nữ)
(1009, 1000, 0.9),  -- Hương cam chanh tươi mát
(1009, 1003, 0.7),  -- Hương hoa cỏ ngọt ngào
(1009, 1004, 0.5),  -- Hương thảo mộc xanh mát
(1009, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0011: Nước Hoa Nam Versace Eros EDT (Nam)
(1010, 1001, 0.8),  -- Hương gỗ trầm ấm
(1010, 1004, 0.6),  -- Hương thảo mộc xanh mát
(1010, 1006, 0.4),  -- Hương xạ hương nồng nàn
(1010, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0012: Nước Hoa Nam Versace Pour Homme EDT (Nam)
(1011, 1000, 0.9),  -- Hương cam chanh tươi mát
(1011, 1004, 0.7),  -- Hương thảo mộc xanh mát
(1011, 1001, 0.5),  -- Hương gỗ trầm ấm
(1011, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0013: Nước Hoa Nam Versace Pour Homme Oud Noir EDP (Nam)
(1012, 1001, 0.9),  -- Hương gỗ trầm ấm
(1012, 1007, 0.7),  -- Hương da thuộc cổ điển
(1012, 1006, 0.5),  -- Hương xạ hương nồng nàn
(1012, 1004, 0.3),  -- Hương thảo mộc xanh mát

-- SP0014: Nước Hoa Nam Versace Eros Parfum (Nam)
(1013, 1001, 0.85), -- Hương gỗ trầm ấm
(1013, 1004, 0.65), -- Hương thảo mộc xanh mát
(1013, 1006, 0.45), -- Hương xạ hương nồng nàn
(1013, 1000, 0.25), -- Hương cam chanh tươi mát

-- SP0015: Nước Hoa Nữ Versace Bright Crystal EDT (Nữ)
(1014, 1003, 0.9),  -- Hương hoa cỏ ngọt ngào
(1014, 1009, 0.7),  -- Hương trái cây tươi ngọt
(1014, 1000, 0.5),  -- Hương cam chanh tươi mát
(1014, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0016: Nước Hoa Nữ Versace Crystal Noir Parfum (Nữ)
(1015, 1003, 0.85), -- Hương hoa cỏ ngọt ngào
(1015, 1005, 0.65), -- Hương vani ấm áp
(1015, 1006, 0.45), -- Hương xạ hương nồng nàn
(1015, 1008, 0.25), -- Hương síp hoa cỏ

-- SP0017: Nước Hoa Nam Versace Eros Flame EDP (Nam)
(1016, 1001, 0.8),  -- Hương gỗ trầm ấm
(1016, 1004, 0.6),  -- Hương thảo mộc xanh mát
(1016, 1006, 0.4),  -- Hương xạ hương nồng nàn
(1016, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0018: Nước Hoa Nam Armaf Club De Nuit Intense Man EDT (Nam)
(1017, 1001, 0.9),  -- Hương gỗ trầm ấm
(1017, 1007, 0.7),  -- Hương da thuộc cổ điển
(1017, 1004, 0.5),  -- Hương thảo mộc xanh mát
(1017, 1000, 0.3),  -- Hương cam chanh tươi mát

-- SP0019: Nước Hoa Unisex Armaf Uniq Oud Forever EDP (Unisex)
(1018, 1001, 0.8),  -- Hương gỗ trầm ấm
(1018, 1006, 0.6),  -- Hương xạ hương nồng nàn
(1018, 1003, 0.4),  -- Hương hoa cỏ ngọt ngào
(1018, 1005, 0.2),  -- Hương vani ấm áp

-- SP0020: Nước Hoa Nữ Armaf Yum Yum EDP (Nữ)
(1019, 1009, 0.9),  -- Hương trái cây tươi ngọt
(1019, 1003, 0.7),  -- Hương hoa cỏ ngọt ngào
(1019, 1005, 0.5),  -- Hương vani ấm áp
(1019, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0021: Nước Hoa Nữ Armaf Club De Nuit Woman EDP (Nữ)
(1020, 1003, 0.85), -- Hương hoa cỏ ngọt ngào
(1020, 1008, 0.65), -- Hương síp hoa cỏ
(1020, 1005, 0.45), -- Hương vani ấm áp
(1020, 1006, 0.25), -- Hương xạ hương nồng nàn

-- SP0022: Nước Hoa Nam Armaf Club De Nuit El Cielo Pour Homme EDP (Nam)
(1021, 1001, 0.8),  -- Hương gỗ trầm ấm
(1021, 1004, 0.6),  -- Hương thảo mộc xanh mát
(1021, 1006, 0.4),  -- Hương xạ hương nồng nàn
(1021, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0023: Nước Hoa Unisex Armaf Club De Nuit Untold EDP (Unisex)
(1022, 1003, 0.8),  -- Hương hoa cỏ ngọt ngào
(1022, 1006, 0.6),  -- Hương xạ hương nồng nàn
(1022, 1005, 0.4),  -- Hương vani ấm áp
(1022, 1000, 0.2),  -- Hương cam chanh tươi mát

-- SP0024: Nước Hoa Nam Lacoste L.12.12 Blanc Eau Intense EDT (Nam)
(1023, 1000, 0.9),  -- Hương cam chanh tươi mát
(1023, 1004, 0.7),  -- Hương thảo mộc xanh mát
(1023, 1001, 0.5),  -- Hương gỗ trầm ấm
(1023, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0025: Nước Hoa Nam Lacoste Essential Pour Homme EDT (Nam)
(1024, 1000, 0.85), -- Hương cam chanh tươi mát
(1024, 1004, 0.65), -- Hương thảo mộc xanh mát
(1024, 1001, 0.45), -- Hương gỗ trầm ấm
(1024, 1006, 0.25), -- Hương xạ hương nồng nàn

-- SP0026: Nước Hoa Nam Lacoste L.12.12 White Blanc EDT (Nam)
(1025, 1000, 0.9),  -- Hương cam chanh tươi mát
(1025, 1004, 0.7),  -- Hương thảo mộc xanh mát
(1025, 1001, 0.5),  -- Hương gỗ trầm ấm
(1025, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0027: Nước Hoa Nữ Lacoste Pour Femme Elixir EDP (Nữ)
(1026, 1003, 0.9),  -- Hương hoa cỏ ngọt ngào
(1026, 1005, 0.7),  -- Hương vani ấm áp
(1026, 1006, 0.5),  -- Hương xạ hương nồng nàn
(1026, 1009, 0.3),  -- Hương trái cây tươi ngọt

-- SP0028: Nước Hoa Nam Dolce & Gabbana Light Blue Pour Homme EDT (Nam)
(1027, 1000, 0.9),  -- Hương cam chanh tươi mát
(1027, 1004, 0.7),  -- Hương thảo mộc xanh mát
(1027, 1001, 0.5),  -- Hương gỗ trầm ấm
(1027, 1006, 0.3),  -- Hương xạ hương nồng nàn

-- SP0029: Nước Hoa Nam Dolce & Gabbana Light Blue Eau Intense EDP (Nam)
(1028, 1000, 0.85), -- Hương cam chanh tươi mát
(1028, 1002, 0.65), -- Hương biển tươi mới
(1028, 1001, 0.45), -- Hương gỗ trầm ấm
(1028, 1006, 0.25), -- Hương xạ hương nồng nàn

-- SP0030: Nước Hoa Nữ Dolce & Gabbana L’Imperatrice 3 EDT (Nữ)
(1029, 1009, 0.9),  -- Hương trái cây tươi ngọt
(1029, 1003, 0.7),  -- Hương hoa cỏ ngọt ngào
(1029, 1006, 0.5),  -- Hương xạ hương nồng nàn
(1029, 1000, 0.3);  -- Hương cam chanh tươi mát
GO

UPDATE san_pham
SET create_date = GETDATE();

select*from don_hang
select*from yeu_cau_tra_hang
where id_tai_khoan=1011

SELECT * 
FROM don_hang dh
Where DATEPART(YEAR, dh.ngay_tao) = 2025;
select *from yeu_cau_tra_hang


ngay_duyet

UPDATE san_pham
SET id_nong_do = CASE 
    -- SP0001: Calvin Klein CK One (EDT)
    WHEN id = 1000 THEN 1002 -- Eau de Toilette
    -- SP0002: Calvin Klein CK Be (EDT)
    WHEN id = 1001 THEN 1002 -- Eau de Toilette
    -- SP0003: Dior Sauvage Eau Forte Parfum (Parfum)
    WHEN id = 1002 THEN 1000 -- Parfum classic
    -- SP0004: Dior Sauvage EDP
    WHEN id = 1003 THEN 1001 -- Eau de Parfum
    -- SP0005: Chanel Bleu De Chanel EDP
    WHEN id = 1004 THEN 1001 -- Eau de Parfum
    -- SP0006: Chanel Coco Mademoiselle EDP
    WHEN id = 1005 THEN 1001 -- Eau de Parfum
    -- SP0007: Chanel Allure Homme Sport (EDT)
    WHEN id = 1006 THEN 1002 -- Eau de Toilette
    -- SP0008: Gucci Guilty Elixir De Parfum (Parfum)
    WHEN id = 1007 THEN 1000 -- Parfum classic
    -- SP0009: Chanel Coco EDP
    WHEN id = 1008 THEN 1001 -- Eau de Parfum
    -- SP0010: Chanel Chance Eau Fraîche (EDT)
    WHEN id = 1009 THEN 1002 -- Eau de Toilette
    -- SP0011: Versace Eros (EDT)
    WHEN id = 1010 THEN 1002 -- Eau de Toilette
    -- SP0012: Versace Pour Homme (EDT)
    WHEN id = 1011 THEN 1002 -- Eau de Toilette
    -- SP0013: Versace Pour Homme Oud Noir (EDP)
    WHEN id = 1012 THEN 1001 -- Eau de Parfum
    -- SP0014: Versace Eros Parfum
    WHEN id = 1013 THEN 1000 -- Parfum classic
    -- SP0015: Versace Bright Crystal (EDT)
    WHEN id = 1014 THEN 1002 -- Eau de Toilette
    -- SP0016: Versace Crystal Noir (Parfum)
    WHEN id = 1015 THEN 1000 -- Parfum classic
    -- SP0017: Versace Eros Flame (EDP)
    WHEN id = 1016 THEN 1001 -- Eau de Parfum
    -- SP0018: Armaf Club De Nuit Intense Man (EDT)
    WHEN id = 1017 THEN 1002 -- Eau de Toilette
    -- SP0019: Armaf Uniq Oud Forever (EDP)
    WHEN id = 1018 THEN 1001 -- Eau de Parfum
    -- SP0020: Armaf Yum Yum (EDP)
    WHEN id = 1019 THEN 1001 -- Eau de Parfum
    -- SP0021: Armaf Club De Nuit Woman (EDP)
    WHEN id = 1020 THEN 1001 -- Eau de Parfum
    -- SP0022: Armaf Club De Nuit El Cielo (EDP)
    WHEN id = 1021 THEN 1001 -- Eau de Parfum
    -- SP0023: Armaf Club De Nuit Untold (EDP)
    WHEN id = 1022 THEN 1001 -- Eau de Parfum
    -- SP0024: Lacoste L.12.12 Blanc Eau Intense (EDT)
    WHEN id = 1023 THEN 1002 -- Eau de Toilette
    -- SP0025: Lacoste Essential Pour Homme (EDT)
    WHEN id = 1024 THEN 1002 -- Eau de Toilette
    -- SP0026: Lacoste L.12.12 White Blanc (EDT)
    WHEN id = 1025 THEN 1002 -- Eau de Toilette
    -- SP0027: Lacoste Pour Femme Elixir (EDP)
    WHEN id = 1026 THEN 1001 -- Eau de Parfum
    -- SP0028: Dolce & Gabbana Light Blue Pour Homme (EDT)
    WHEN id = 1027 THEN 1002 -- Eau de Toilette
    -- SP0029: Dolce & Gabbana Light Blue Eau Intense (EDP)
    WHEN id = 1028 THEN 1001 -- Eau de Parfum
    -- SP0030: Dolce & Gabbana L’Imperatrice 3 (EDT)
    WHEN id = 1029 THEN 1002 -- Eau de Toilette
END;