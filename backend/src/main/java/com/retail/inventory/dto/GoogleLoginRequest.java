package com.retail.inventory.dto;

public class GoogleLoginRequest {
    private String idToken;
    private String requestedRole; // Safe default requested role (never ADMIN)

    public GoogleLoginRequest() {}

    public GoogleLoginRequest(String idToken, String requestedRole) {
        this.idToken = idToken;
        this.requestedRole = requestedRole;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getRequestedRole() {
        return requestedRole;
    }

    public void setRequestedRole(String requestedRole) {
        this.requestedRole = requestedRole;
    }
}
