INSERT INTO roles(name) VALUES ('EDITOR') ON CONFLICT DO NOTHING;

CREATE TABLE user_content_permissions (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_key VARCHAR(60) NOT NULL,
    PRIMARY KEY (user_id, content_key)
);
