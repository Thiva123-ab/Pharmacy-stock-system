package ac.nsbm.local_pharmacy_stock_and_delivery_system.config;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;


@Service
public class MockJwtService {


    private final Map<String, String> tokenEmailMap = new HashMap<>();

    public String generateToken(String email) {
        String mockToken = "MOCKED_JWT_" + email.hashCode();
        tokenEmailMap.put(mockToken, email);
        return mockToken;
    }

    public String extractUsername(String token) {
        return tokenEmailMap.get(token);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Minimal mock check: token must be issued and match the user
        return (username != null && username.equals(userDetails.getUsername()));
    }
}