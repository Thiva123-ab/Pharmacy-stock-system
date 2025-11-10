// Local_Pharmacy_Stock_and_Delivery_System(FINAL)/src/main/java/ac/nsbm/local_pharmacy_stock_and_delivery_system/config/SecurityConfig.java
package ac.nsbm.local_pharmacy_stock_and_delivery_system.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;

import java.util.Map;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    public SecurityConfig() {
        // No-args constructor
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .csrf(csrf -> csrf
                        .disable()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> errorDetails = Map.of(
                                    "success", false,
                                    "message", "Unauthorized: " + authException.getMessage()
                            );
                            new ObjectMapper().writeValue(response.getWriter(), errorDetails);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> errorDetails = Map.of(
                                    "success", false,
                                    "message", "Forbidden: " + accessDeniedException.getMessage()
                            );
                            new ObjectMapper().writeValue(response.getWriter(), errorDetails);
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public API Endpoints
                        .requestMatchers("/api/auth/**", "/api/medicines/**").permitAll()

                        // Admin Endpoints
                        .requestMatchers("/api/admin/**", "/api/settings/**").hasRole("ADMIN")

                        // Allow all logged-in users to access their notifications
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Chat & WebSocket
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/api/ws/**").permitAll()

                        // --- START: NEW FEEDBACK RULE ---
                        .requestMatchers("/api/feedback/**").authenticated() // Allow all logged-in users
                        // --- END: NEW FEEDBACK RULE ---

                        // Public Frontend Static Resources
                        .requestMatchers("/frontend/**",
                                "/frontend/login.html",
                                "/frontend/register.html",
                                "/frontend/css/**",
                                "/frontend/js/**").permitAll()
                        .anyRequest().authenticated())
                .formLogin(login -> login.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.logoutUrl("/logout").permitAll());

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}