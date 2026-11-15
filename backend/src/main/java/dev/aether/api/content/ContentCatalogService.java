package dev.aether.api.content;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.Set;

@Service
public class ContentCatalogService {
    private static final Set<String> PUBLIC_KEYS = Set.of("hero", "services", "technologies", "capabilities", "process", "case-studies", "industries", "testimonials", "team", "site-settings");
    private final SiteContentRepository repository;
    public ContentCatalogService(SiteContentRepository repository) { this.repository = repository; }
    public static boolean isKnownKey(String key) { return PUBLIC_KEYS.contains(key); }
    public JsonNode get(String key) {
        if (!PUBLIC_KEYS.contains(key)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content section not found");
        return repository.findById(key).map(SiteContent::getPayload).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Content section not found"));
    }
    public JsonNode save(String key, JsonNode payload, Long userId) {
        if (!PUBLIC_KEYS.contains(key)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content section not found");
        if (payload == null || payload.isNull()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content payload is required");
        if ("team".equals(key)) validateTeamPayload(payload);
        SiteContent content = repository.findById(key).orElseGet(() -> new SiteContent(key, payload, userId));
        content.setPayload(payload); content.setUpdatedBy(userId);
        return repository.save(content).getPayload();
    }

    static void validateTeamPayload(JsonNode payload) {
        if (!payload.isArray() || payload.size() < 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team content must include at least 15 profiles.");
        }
        for (JsonNode member : payload) {
            JsonNode techStack = member.path("techStack");
            if (!member.isObject()
                    || !hasText(member.path("name").asText(null))
                    || !hasText(member.path("photoUrl").asText(null))
                    || !hasText(member.path("currentCompany").asText(null))
                    || !member.path("experienceYears").isIntegralNumber()
                    || !member.path("experienceYears").canConvertToInt()
                    || member.path("experienceYears").asInt() <= 5
                    || !techStack.isArray()
                    || techStack.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Each team profile needs a name, photo, tech stack, current company, and more than 5 years of experience.");
            }
            for (JsonNode technology : techStack) {
                if (!technology.isTextual() || !hasText(technology.asText(null))) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team tech stack values must not be empty.");
                }
            }
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
