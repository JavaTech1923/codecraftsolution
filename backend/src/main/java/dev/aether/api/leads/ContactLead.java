package dev.aether.api.leads;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "contact_leads")
public class ContactLead {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 120) private String name;
    @Column(length = 160) private String company;
    @Column(nullable = false, length = 254) private String email;
    @Column(length = 40) private String phone;
    @Column(name = "required_service", nullable = false, length = 120) private String requiredService;
    @Column(length = 60) private String budget;
    @Column(length = 60) private String timeline;
    @Column(nullable = false, length = 5000) private String description;
    @Column(nullable = false, length = 30) private String status = "NEW";
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();
    protected ContactLead() { }
    public ContactLead(String name, String company, String email, String phone, String requiredService, String budget, String timeline, String description) { this.name=name;this.company=company;this.email=email;this.phone=phone;this.requiredService=requiredService;this.budget=budget;this.timeline=timeline;this.description=description; }
    @PreUpdate void beforeUpdate() { updatedAt = Instant.now(); }
    public Long getId(){return id;} public String getName(){return name;} public String getCompany(){return company;} public String getEmail(){return email;} public String getPhone(){return phone;} public String getRequiredService(){return requiredService;} public String getBudget(){return budget;} public String getTimeline(){return timeline;} public String getDescription(){return description;} public String getStatus(){return status;} public void setStatus(String status){this.status=status;} public Instant getCreatedAt(){return createdAt;}
}
