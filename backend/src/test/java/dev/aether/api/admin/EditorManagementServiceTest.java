package dev.aether.api.admin;

import dev.aether.api.security.AccountRole;
import dev.aether.api.security.AccountRoleRepository;
import dev.aether.api.security.AccountUser;
import dev.aether.api.security.AccountUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class EditorManagementServiceTest {
    private final AccountUserRepository users = mock(AccountUserRepository.class);
    private final AccountRoleRepository roles = mock(AccountRoleRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final EditorManagementService service = new EditorManagementService(users, roles, passwordEncoder);

    @Test
    void createsOnlyScopedEditorAccountsAndHashesPasswords() {
        String password = "A-long-temporary-password";
        AccountRole editorRole = mock(AccountRole.class);
        when(editorRole.getName()).thenReturn("EDITOR");
        when(users.findByEmailIgnoreCase("person@example.com")).thenReturn(Optional.empty());
        when(roles.findByName("EDITOR")).thenReturn(Optional.of(editorRole));
        when(passwordEncoder.encode(password)).thenReturn("bcrypt-hash");
        when(users.save(any(AccountUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EditorManagementService.EditorSummary created = service.createEditor(
                " Person@Example.com ",
                password,
                Set.of("team", "services"));

        var savedCaptor = org.mockito.ArgumentCaptor.forClass(AccountUser.class);
        verify(users, times(1)).save(savedCaptor.capture());
        AccountUser saved = savedCaptor.getValue();
        assertEquals("person@example.com", created.email());
        assertEquals(Set.of("team", "services"), saved.getContentPermissions());
        assertEquals(Set.of("EDITOR"), saved.getRoles().stream().map(AccountRole::getName).collect(java.util.stream.Collectors.toSet()));
        assertEquals("bcrypt-hash", saved.getPassword());
    }

    @Test
    void rejectsUnknownContentPermissions() {
        assertThrows(
                ResponseStatusException.class,
                () -> service.createEditor("person@example.com", "A-long-temporary-password", Set.of("unknown")));

        verifyNoInteractions(users, roles, passwordEncoder);
    }
}
