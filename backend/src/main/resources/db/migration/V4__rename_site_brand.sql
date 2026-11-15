UPDATE site_content
SET payload = jsonb_set(
    jsonb_set(payload, '{brandName}', '"CODECRAFTSOLUTION"'::jsonb, true),
    '{brandSuffix}', '""'::jsonb, true
)
WHERE content_key = 'site-settings';

UPDATE site_content
SET payload = jsonb_set(
    payload,
    '{0,quote}',
    to_jsonb(replace(payload->0->>'quote', 'Aether', 'CODECRAFTSOLUTION')),
    false
)
WHERE content_key = 'testimonials'
  AND payload->0->>'quote' LIKE '%Aether%';
