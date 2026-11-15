package dev.aether.api.leads;
import java.time.Instant;
public record ContactLeadResponse(Long id, String name, String company, String email, String phone, String requiredService, String budget, String timeline, String description, String status, Instant createdAt) { }
