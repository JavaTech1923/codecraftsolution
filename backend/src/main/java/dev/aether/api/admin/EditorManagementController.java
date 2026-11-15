package dev.aether.api.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin/editors")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class EditorManagementController {
    private final EditorManagementService editors;

    public EditorManagementController(EditorManagementService editors) {
        this.editors = editors;
    }

    @GetMapping
    public List<EditorManagementService.EditorSummary> listEditors() {
        return editors.findEditors();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EditorManagementService.EditorSummary createEditor(
            @Valid @RequestBody CreateEditorRequest request) {
        return editors.createEditor(request.email(), request.password(), request.contentPermissions());
    }

    @PutMapping("/{id}/permissions")
    public EditorManagementService.EditorSummary updatePermissions(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePermissionsRequest request) {
        return editors.updatePermissions(id, request.contentPermissions());
    }

    public record CreateEditorRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(min = 14, max = 72) String password,
            @NotEmpty Set<@NotBlank String> contentPermissions) { }

    public record UpdatePermissionsRequest(@NotEmpty Set<@NotBlank String> contentPermissions) { }
}
