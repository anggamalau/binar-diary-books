class ResponseHelper {
  static expectSuccessResponse(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toBeDefined();
  }

  static expectErrorResponse(response, statusCode, message = null) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('error');
    
    if (message) {
      expect(response.body.error).toContain(message);
    }
  }

  static expectValidationError(response, field = null) {
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    
    if (field) {
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: field })
        ])
      );
    }
  }

  static expectAuthenticationError(response) {
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
  }

  static expectAuthorizationError(response) {
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error');
  }
}

module.exports = ResponseHelper;