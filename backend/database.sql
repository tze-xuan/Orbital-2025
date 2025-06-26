USE freedb_CafeChronicles;

CREATE TABLE cafes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cafeName VARCHAR(255) UNIQUE NOT NULL,
    cafeLocation VARCHAR(255) NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    cafe_id INT,
    rating TINYINT,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cafe_id) REFERENCES cafes(id)
)