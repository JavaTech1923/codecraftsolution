package dev.aether.api.security;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwt;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwt) {
        this.authenticationManager = authenticationManager;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        AccountUser user = (AccountUser) authentication.getPrincipal();
        AdminUser responseUser = new AdminUser(
                user.getId(),
                user.getEmail(),
                user.getRoles().stream().map(AccountRole::getName).sorted().toList(),
                user.getContentPermissions().stream().sorted().toList());
        return new LoginResponse(jwt.issue(user), "Bearer", jwt.expirationMs(), responseUser);
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) { }

    public record AdminUser(Long id, String email, List<String> roles, List<String> contentPermissions) { }

    public record LoginResponse(String accessToken, String tokenType, long expiresIn, AdminUser user) { }
}
