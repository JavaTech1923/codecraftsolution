package dev.aether.api.leads;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ContactLeadRepository extends JpaRepository<ContactLead, Long> { List<ContactLead> findAllByOrderByCreatedAtDesc(); }
