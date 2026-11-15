package dev.aether.api.content;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ContentController {
    private final ContentCatalogService content;
    public ContentController(ContentCatalogService content) { this.content = content; }
    @GetMapping("/hero") public JsonNode hero() { return content.get("hero"); }
    @GetMapping("/services") public JsonNode services() { return content.get("services"); }
    @GetMapping("/technologies") public JsonNode technologies() { return content.get("technologies"); }
    @GetMapping("/capabilities") public JsonNode capabilities() { return content.get("capabilities"); }
    @GetMapping("/process") public JsonNode process() { return content.get("process"); }
    @GetMapping("/case-studies") public JsonNode caseStudies() { return content.get("case-studies"); }
    @GetMapping("/industries") public JsonNode industries() { return content.get("industries"); }
    @GetMapping("/testimonials") public JsonNode testimonials() { return content.get("testimonials"); }
    @GetMapping("/team") public JsonNode team() { return content.get("team"); }
    @GetMapping("/site-settings") public JsonNode siteSettings() { return content.get("site-settings"); }
}
