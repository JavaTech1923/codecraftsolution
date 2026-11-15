package dev.aether.api.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DatabaseConfigurationTest {
    @Test
    void convertsNeonUriToJdbcUrlAndDecodesCredentials() {
        DatabaseConfiguration.ConnectionSettings settings = DatabaseConfiguration.connectionSettings(
                "\"postgresql://app_user:p%40ss%3Aword@db.example:5432/neondb?sslmode=require&channel_binding=require\"");

        assertEquals("jdbc:postgresql://db.example:5432/neondb?sslmode=require", settings.jdbcUrl());
        assertEquals("app_user", settings.username());
        assertEquals("p@ss:word", settings.password());
    }

    @Test
    void preservesJdbcUrls() {
        String jdbcUrl = "jdbc:postgresql://localhost:5432/aether";

        DatabaseConfiguration.ConnectionSettings settings =
                DatabaseConfiguration.connectionSettings(jdbcUrl);

        assertEquals(jdbcUrl, settings.jdbcUrl());
        assertNull(settings.username());
        assertNull(settings.password());
    }

    @Test
    void rejectsUnsupportedDatabaseUrls() {
        assertThrows(
                IllegalStateException.class,
                () -> DatabaseConfiguration.connectionSettings("https://db.example/neondb"));
    }
}
