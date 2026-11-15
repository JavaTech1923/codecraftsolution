package dev.aether.api.content;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ContentCatalogServiceTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void rejectsTeamContentWithFewerThanFifteenProfiles() {
        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> ContentCatalogService.validateTeamPayload(objectMapper.createArrayNode()));

        assertEquals(400, error.getStatusCode().value());
    }

    @Test
    void rejectsProfilesWithFiveOrFewerYearsOfExperience() {
        ArrayNode profiles = validProfiles();
        ((ObjectNode) profiles.get(0)).put("experienceYears", 5);

        assertThrows(ResponseStatusException.class, () -> ContentCatalogService.validateTeamPayload(profiles));
    }

    @Test
    void acceptsFifteenProfilesWithRequiredFieldsAndMoreThanFiveYears() {
        assertDoesNotThrow(() -> ContentCatalogService.validateTeamPayload(validProfiles()));
    }

    private ArrayNode validProfiles() {
        ArrayNode profiles = objectMapper.createArrayNode();
        for (int i = 0; i < 15; i++) {
            ObjectNode member = profiles.addObject();
            member.put("name", "Demo Member " + i);
            member.put("photoUrl", "https://example.test/member-" + i + ".jpg");
            member.put("experienceYears", 6);
            member.put("currentCompany", "Demo Company");
            member.putArray("techStack").add("Java");
        }
        return profiles;
    }
}
