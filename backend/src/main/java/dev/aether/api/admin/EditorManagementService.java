package dev.aether.api.admin;

import dev.aether.api.content.ContentCatalogService;
import dev.aether.api.security.AccountRole;
import dev.aether.api.security.AccountRoleRepository;
import dev.aether.api.security.AccountUser;
import dev.aether.api.security.AccountUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class EditorManagementService {
    private final AccountUserRepository users;
    private final AccountRoleRepository roles;
    private final PasswordEncoder passwordEncoder;

    public EditorManagementService(
            AccountUserRepository users,
            AccountRoleRepository roles,
            PasswordEncoder passwordEncoder) {
        this.users = users;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<EditorSummary> findEditors() {
        return users.findAll().stream()
                .filter(this::isEditor)
                .map(this::summary)
                .toList();
    }

    @Transactional
    public EditorSummary createEditor(String email, String password, Set<String> requestedPermissions) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Set<String> permissions = validatePermissions(requestedPermissions);
        if (users.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with that email already exists.");
        }

        AccountRole editorRole = roles.findByName("EDITOR")
                .orElseThrow(() -> new IllegalStateException("EDITOR role has not been initialized."));
        AccountUser editor = new AccountUser(
                normalizedEmail,
                passwordEncoder.encode(password),
                Set.of(editorRole));
        editor.setContentPermissions(permissions);
        return summary(users.save(editor));
    }

    @Transactional
    public EditorSummary updatePermissions(Long userId, Set<String> requestedPermissions) {
        AccountUser editor = users.findById(userId)
                .filter(this::isEditor)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Editor account not found."));
        editor.setContentPermissions(validatePermissions(requestedPermissions));
        return summary(editor);
    }

    private Set<String> validatePermissions(Set<String> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one content section.");
        }
        if (permissions.stream().anyMatch(permission -> !ContentCatalogService.isKnownKey(permission))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more content sections are not available.");
        }
        return Set.copyOf(permissions);
    }

    private boolean isEditor(AccountUser user) {
        return user.getRoles().stream().map(AccountRole::getName).anyMatch("EDITOR"::equals);
    }

    private EditorSummary summary(AccountUser user) {
        return new EditorSummary(
                user.getId(),
                user.getEmail(),
                user.getContentPermissions().stream().sorted().toList());
    }

    public record EditorSummary(Long id, String email, List<String> contentPermissions) { }
}
