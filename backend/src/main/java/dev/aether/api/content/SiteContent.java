package dev.aether.api.content;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "site_content")
public class SiteContent {
    @Id @Column(name = "content_key", length = 60) private String contentKey;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name = "payload", columnDefinition = "jsonb", nullable = false) private JsonNode payload;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "updated_by") private Long updatedBy;
    protected SiteContent() { }
    public SiteContent(String contentKey, JsonNode payload, Long updatedBy) { this.contentKey = contentKey; this.payload = payload; this.updatedBy = updatedBy; this.updatedAt = Instant.now(); }
    public String getContentKey() { return contentKey; }
    public JsonNode getPayload() { return payload; }
    public void setPayload(JsonNode payload) { this.payload = payload; this.updatedAt = Instant.now(); }
    public Instant getUpdatedAt() { return updatedAt; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
}
