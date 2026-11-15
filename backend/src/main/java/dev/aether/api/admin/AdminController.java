package dev.aether.api.admin;

import com.fasterxml.jackson.databind.JsonNode;
import dev.aether.api.content.ContentCatalogService;
import dev.aether.api.leads.ContactLeadResponse;
import dev.aether.api.leads.ContactLeadService;
import dev.aether.api.security.AccountUser;
import dev.aether.api.security.AccountUserRepository;
import dev.aether.api.security.ContentPermissionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final ContentCatalogService content;
    private final ContactLeadService leads;
    private final AccountUserRepository users;
    private final ContentPermissionService contentPermissions;

    public AdminController(
            ContentCatalogService content,
            ContactLeadService leads,
            AccountUserRepository users,
            ContentPermissionService contentPermissions) {
        this.content = content;
        this.leads = leads;
        this.users = users;
        this.contentPermissions = contentPermissions;
    }

    @GetMapping("/content/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','EDITOR')")
    public JsonNode content(@PathVariable String key, Authentication authentication) {
        AccountUser user = currentUser(authentication);
        contentPermissions.requireCanEdit(user, key);
        return content.get(key);
    }

    @PutMapping("/content/{key}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','EDITOR')")
    public JsonNode updateContent(
            @PathVariable String key,
            @RequestBody JsonNode payload,
            Authentication authentication) {
        AccountUser user = currentUser(authentication);
        contentPermissions.requireCanEdit(user, key);
        return content.save(key, payload, user.getId());
    }

    @GetMapping("/leads")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public List<ContactLeadResponse> leads() {
        return leads.findAll();
    }

    @PatchMapping("/leads/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ContactLeadResponse updateLead(
            @PathVariable Long id,
            @Valid @RequestBody UpdateLeadRequest request) {
        return leads.updateStatus(id, request.status());
    }

    private AccountUser currentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
    }

    public record UpdateLeadRequest(@NotBlank String status) { }
}
