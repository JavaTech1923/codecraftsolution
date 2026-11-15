package dev.aether.api.leads;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record ContactRequest(@NotBlank @Size(max=120) String name, @Size(max=160) String company, @NotBlank @Email @Size(max=254) String email, @Size(max=40) String phone, @NotBlank @Size(max=120) String requiredService, @Size(max=60) String budget, @Size(max=60) String timeline, @NotBlank @Size(max=5000) String description) { }
