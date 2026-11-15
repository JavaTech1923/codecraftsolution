package dev.aether.api.leads;
import org.springframework.stereotype.Component;
@Component
public class ContactLeadMapper {
    public ContactLead toEntity(ContactRequest request) { return new ContactLead(request.name().trim(), blankToNull(request.company()), request.email().trim().toLowerCase(), blankToNull(request.phone()), request.requiredService().trim(), blankToNull(request.budget()), blankToNull(request.timeline()), request.description().trim()); }
    public ContactLeadResponse toResponse(ContactLead lead) { return new ContactLeadResponse(lead.getId(),lead.getName(),lead.getCompany(),lead.getEmail(),lead.getPhone(),lead.getRequiredService(),lead.getBudget(),lead.getTimeline(),lead.getDescription(),lead.getStatus(),lead.getCreatedAt()); }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
