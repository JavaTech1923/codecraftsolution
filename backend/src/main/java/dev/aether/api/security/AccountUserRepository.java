package dev.aether.api.security;
import org.springframework.data.jpa.repository.EntityGraph;import org.springframework.data.jpa.repository.JpaRepository;import java.util.Optional;
public interface AccountUserRepository extends JpaRepository<AccountUser,Long> { @EntityGraph(attributePaths="roles") Optional<AccountUser> findByEmailIgnoreCase(String email); }
