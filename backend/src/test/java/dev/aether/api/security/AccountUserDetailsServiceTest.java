package dev.aether.api.security;

import org.junit.jupiter.api.Test;

import java.util.AbstractSet;
import java.util.Iterator;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountUserDetailsServiceTest {
    @Test
    void initializesContentPermissionsBeforeReturningUserDetails() {
        AccountUserRepository users = mock(AccountUserRepository.class);
        AccountUser user = mock(AccountUser.class);
        TrackingPermissions permissions = new TrackingPermissions();
        when(users.findByEmailIgnoreCase("editor@example.com")).thenReturn(Optional.of(user));
        when(user.getContentPermissions()).thenReturn(permissions);

        AccountUserDetailsService service = new AccountUserDetailsService(users);

        assertSame(user, service.loadUserByUsername("editor@example.com"));
        assertTrue(permissions.initialized);
        verify(user).getContentPermissions();
    }

    private static class TrackingPermissions extends AbstractSet<String> {
        private boolean initialized;

        @Override
        public Iterator<String> iterator() {
            return Set.of("team").iterator();
        }

        @Override
        public int size() {
            initialized = true;
            return 1;
        }
    }
}
