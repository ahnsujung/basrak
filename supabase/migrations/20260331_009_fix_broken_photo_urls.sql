-- VITE_R2_PUBLIC_URL 누락 빌드에서 업로드된 사진 URL 복구
-- "undefined/userId/timestamp.ext" → "https://pub-08a381c0b76a4644a805f200110cbc90.r2.dev/userId/timestamp.ext"
UPDATE observations
SET photo_url = REPLACE(photo_url, 'undefined/', 'https://pub-08a381c0b76a4644a805f200110cbc90.r2.dev/')
WHERE photo_url LIKE 'undefined/%';
