package dev.aether.api.leads;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {
    private final ContactLeadService service;
    public ContactController(ContactLeadService service) { this.service=service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public ContactLeadResponse submit(@Valid @RequestBody ContactRequest request) { return service.create(request); }
}
