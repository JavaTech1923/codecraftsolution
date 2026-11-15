package dev.aether.api.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ContentPermissionService {
    public void requireCanEdit(AccountUser user, String contentKey) {
        Set<String> roles = user.getRoles().stream().map(AccountRole::getName).collect(java.util.stream.Collectors.toSet());
        if (roles.contains("ADMIN") || roles.contains("SUPER_ADMIN")) return;
        if (roles.contains("EDITOR") && user.getContentPermissions().contains(contentKey)) return;
        throw new AccessDeniedException("You do not have permission to edit this content section.");
    }
}
