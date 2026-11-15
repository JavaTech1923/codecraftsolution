package dev.aether.api.leads;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
public class ContactLeadService {
    private final ContactLeadRepository repository; private final ContactLeadMapper mapper;
    public ContactLeadService(ContactLeadRepository repository, ContactLeadMapper mapper) { this.repository=repository;this.mapper=mapper; }
    @Transactional public ContactLeadResponse create(ContactRequest request) { return mapper.toResponse(repository.save(mapper.toEntity(request))); }
    @Transactional(readOnly=true) public List<ContactLeadResponse> findAll() { return repository.findAllByOrderByCreatedAtDesc().stream().map(mapper::toResponse).toList(); }
    @Transactional public ContactLeadResponse updateStatus(Long id, String status) { if (!List.of("NEW","IN_PROGRESS","QUALIFIED","CLOSED").contains(status)) throw new IllegalArgumentException("Unsupported lead status"); ContactLead lead=repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Lead not found")); lead.setStatus(status); return mapper.toResponse(lead); }
}
