package dev.aether.api.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ContentPermissionServiceTest {
    private final ContentPermissionService permissions = new ContentPermissionService();

    @Test
    void editorCanAccessOnlyAssignedSections() {
        AccountUser editor = userWithRoleAndPermissions("EDITOR", Set.of("team"));

        assertDoesNotThrow(() -> permissions.requireCanEdit(editor, "team"));
        assertThrows(AccessDeniedException.class, () -> permissions.requireCanEdit(editor, "services"));
    }

    @Test
    void adminsRetainAccessToAllContent() {
        AccountUser admin = userWithRoleAndPermissions("ADMIN", Set.of());

        assertDoesNotThrow(() -> permissions.requireCanEdit(admin, "site-settings"));
    }

    private AccountUser userWithRoleAndPermissions(String roleName, Set<String> contentPermissions) {
        AccountRole role = mock(AccountRole.class);
        when(role.getName()).thenReturn(roleName);

        AccountUser user = mock(AccountUser.class);
        when(user.getRoles()).thenReturn(Set.of(role));
        when(user.getContentPermissions()).thenReturn(contentPermissions);
        return user;
    }
}
