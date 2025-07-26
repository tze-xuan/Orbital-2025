-- USE freedb_CafeChronicles;

USE freedb_CafeChronicle;

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

CREATE TABLE sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires INT(11) NOT NULL,
  data TEXT
);

CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    cafe_id INT,
    rating TINYINT UNSIGNED NOT NULL
    CHECK (rating BETWEEN 1 AND 5),
    avgPricePerPax DECIMAL(10,2) DEFAULT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

CREATE TABLE stamps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    cafe_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    cafe_id INT NOT NULL,
    bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- prevent duplicate bookmarks
    UNIQUE (user_id, cafe_id),
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,    
    FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
);

ALTER TABLE cafes
ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN avg_price_per_pax DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN review_count INT DEFAULT 0;

UPDATE cafes c
LEFT JOIN (
    SELECT 
        cafe_id,
        AVG(rating) AS avg_rating,
        AVG(avgPricePerPax) AS avg_price,
        COUNT(*) AS review_count
    FROM reviews
    GROUP BY cafe_id
) r ON c.id = r.cafe_id
SET
    c.avg_rating = ROUND(COALESCE(r.avg_rating, 0), 2),
    c.avg_price_per_pax = ROUND(COALESCE(r.avg_price, 0), 2),
    c.review_count = COALESCE(r.review_count, 0)
;