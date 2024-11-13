# Mô tả
- Nhiệm vụ: Upload dữ liệu nhận được từ Webhook (Ảnh, Video, Audio, ...) của FB đẩy lên Cloud storage
- Các công nghệ sử dụng:
  + NestJS
  + MongoDB
  + RabbitMQ
  + Gitlab CICD

# Các config cần lưu ý trước khi chạy dự án
- Nếu lần đầu làm việc cần đảm bảo có đầy đủ các công nghệ dưới đây:
  + Docker đã chạy các container sau:
    + Redis
    + RabbitMQ
  + Node: Version 18 trở lên
  + NestCLI: Version mới nhất
- Nếu khởi chạy dự án lần đầu cần thực hiện các bước dưới đây:
  + Bước 1: Cài đặt `node_modules` cần thiết bằng câu lệnh sau : 
    ```
    yarn
    ```
  + Bước 2: Tạo file `.env` từ file `.env.example` để tạo biến môi trường cho dự án khởi chạy ở local bằng câu lệnh sau:
    ```
    cp .env.example .env
    ```
- Nếu thêm biến môi trường cho dự án thì cần thêm vào cả 2 file `.env` và `.env.example` để người vào sau có đẩy đủ biến môi trường sử dụng

# Cách khởi chạy dự án
- Bước 1: Chạy dự án bằng câu lệnh: 
  ```
  yarn start:dev
  ```