package dev.aether.api.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfiguration {
    @Bean
    DataSource dataSource(Environment environment) {
        String configuredUrl = firstNonBlank(
                environment.getProperty("DATABASE_JDBC_URL"),
                environment.getProperty("DATABASE_URL_UNPOOLED"),
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("spring.datasource.url"),
                "jdbc:postgresql://localhost:5432/aether");
        ConnectionSettings connection = connectionSettings(configuredUrl);

        String username = firstNonBlank(
                environment.getProperty("DATABASE_USERNAME"),
                connection.username(),
                environment.getProperty("spring.datasource.username"),
                "aether");
        String password = firstNonBlank(
                environment.getProperty("DATABASE_PASSWORD"),
                connection.password(),
                environment.getProperty("spring.datasource.password"),
                "aether-local");
        int maxPoolSize = environment.getProperty(
                "DB_POOL_SIZE",
                Integer.class,
                environment.getProperty("spring.datasource.hikari.maximum-pool-size", Integer.class, 12));

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(connection.jdbcUrl());
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(maxPoolSize);
        return new HikariDataSource(config);
    }

    static ConnectionSettings connectionSettings(String configuredUrl) {
        String url = unwrap(configuredUrl);
        if (url.startsWith("jdbc:postgresql:")) {
            return new ConnectionSettings(url, null, null);
        }

        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException | IllegalArgumentException exception) {
            throw invalidDatabaseUrl();
        }

        String scheme = uri.getScheme();
        String userInfo = uri.getUserInfo();
        int separator = userInfo == null ? -1 : userInfo.indexOf(':');
        if (!("postgres".equals(scheme) || "postgresql".equals(scheme))
                || uri.getHost() == null
                || uri.getRawPath() == null
                || uri.getRawPath().length() < 2
                || separator < 1) {
            throw invalidDatabaseUrl();
        }

        String host = uri.getHost();
        if (host.indexOf(':') >= 0) {
            host = "[" + host + "]";
        }
        String port = uri.getPort() < 0 ? "" : ":" + uri.getPort();
        String jdbcUrl = "jdbc:postgresql://" + host + port + uri.getRawPath() + "?sslmode=require";
        return new ConnectionSettings(
                jdbcUrl,
                userInfo.substring(0, separator),
                userInfo.substring(separator + 1));
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return unwrap(value);
            }
        }
        return "";
    }

    private static String unwrap(String value) {
        String trimmed = value == null ? "" : value.trim();
        if (trimmed.length() >= 2
                && ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
            return trimmed.substring(1, trimmed.length() - 1);
        }
        return trimmed;
    }

    private static IllegalStateException invalidDatabaseUrl() {
        return new IllegalStateException(
                "Database URL must be a PostgreSQL URI with credentials or a PostgreSQL JDBC URL.");
    }

    record ConnectionSettings(String jdbcUrl, String username, String password) {
    }
}
