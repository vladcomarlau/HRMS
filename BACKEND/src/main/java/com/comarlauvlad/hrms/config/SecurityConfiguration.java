package com.comarlauvlad.hrms.config;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

import com.comarlauvlad.hrms.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserService userService;

    @Value("${app.enableSecurity}")
    private boolean isAuthenticationEnabled;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        if(isAuthenticationEnabled) {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(request ->
                            request.requestMatchers(
                                            "/signin",
                                            "/signup")
                                    .permitAll().anyRequest().authenticated())
                    .sessionManagement(manager -> manager.sessionCreationPolicy(STATELESS))
                    .authenticationProvider(authenticationProvider()).addFilterBefore(
                            jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            http.cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
                configuration.setAllowedMethods(Arrays.asList("GET", "PUT", "POST", "DELETE",
                        "PATCH", "OPTIONS", "HEAD"));
                configuration.setAllowedHeaders(Arrays.asList("*"));
                return configuration;
            }));
        } else {
            http.authorizeHttpRequests(auth -> auth
                    .requestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**")).permitAll()
            ).headers(headers -> headers.frameOptions(
                    frameOptions -> frameOptions.disable()))
            .csrf(csrf -> csrf
                    .ignoringRequestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**")));
        }
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService.userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
