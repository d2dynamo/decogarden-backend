# Decogarden Backend API Documentation

This Bruno collection contains comprehensive documentation for the Decogarden Backend API.

## Getting Started

1. **Install Bruno**: Download from [https://www.usebruno.com/](https://www.usebruno.com/)
2. **Open Collection**: Open the `docs/bruno` folder in Bruno
3. **Set Environment**: Choose either "Local" or "Production" environment
4. **Configure Variables**: Update the environment variables as needed

## Environment Variables

### Local Environment

- `baseUrl`: https://localhost:4443
- `accessToken`: Your JWT access token
- `userId`: ObjectId of a user for testing
- `itemId`: ObjectId of an item for testing

### Production Environment

- `baseUrl`: https://api.decogarden.lt
- `accessToken`: Your JWT access token
- `userId`: ObjectId of a user for testing
- `itemId`: ObjectId of an item for testing

## Authentication Flow

1. **Login** (`POST /auth/local`) - Get access and refresh tokens
2. **Use Access Token** - Include in Bearer authorization header for protected endpoints
3. **Refresh Tokens** (`GET /auth/refreshTokens`) - Get new tokens when needed

## API Endpoints

### Authentication (`/auth`)

- `POST /auth/local` - Login with email/password
- `GET /auth/refreshTokens` - Refresh access tokens
- `POST /auth/verify` - Verify user email or 2FA

### Users (`/user`)

- `POST /user/create` - Create new user
- `GET /user/:id` - Get user details
- `GET /user/:id/basic` - Get basic user info
- `GET /user/list` - List users with pagination/filtering
- `POST /user/update` - Update user information
- `POST /user/gen2fa` - Generate 2FA secret
- `POST /user/enable2fa` - Enable 2FA
- `POST /user/archive` - Archive user (admin only)

### Items (`/item`)

- `POST /item/create` - Create new item
- `GET /item/:id` - Get item details
- `GET /item/:id/basic` - Get basic item info
- `POST /item/list` - List items with pagination/filtering
- `POST /item/update` - Update item information

### Permissions (`/permission`)

- `GET /permission/` - List all available permissions

### User Permissions (`/userPermission`)

- `GET /userPermission/:userId` - Get user's permissions
- `PUT /userPermission/set` - Set user permissions (admin only)

### Utility (`/hello`)

- `GET /hello/` - Health check endpoint

## Permission System

The API uses a role-based permission system:

- **admin**: Full system access (automatically granted to users with admin permission)
- **self**: Users can access their own data
- **sales**: Sales-related permissions
- **inventory**: Inventory management permissions

### Permission Inheritance

- Admin permission automatically grants access to all endpoints
- "self" permission allows users to access their own data
- Other permissions are role-specific

## Response Format

All API responses follow this format:

```json
{
  "error": false,
  "message": "success",
  "payload": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "error": true,
  "message": "Error description",
  "payload": {
    "errors": {
      // Field-specific validation errors
    }
  }
}
```

## Pagination

List endpoints support pagination:

- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 500)

## Filtering and Sorting

Many endpoints support filtering and sorting:

- Filter parameters are typically optional
- Sort objects use MongoDB-style syntax: `{ "field": 1 }` (ascending) or `{ "field": -1 }` (descending)

## Security Notes

- All protected endpoints require Bearer token authentication
- Refresh tokens are stored in secure httpOnly cookies
- Users can only access their own data unless they have admin permissions
- Input validation is performed on all endpoints
- Sensitive fields (passwords, auth secrets) are never returned in API responses

## Development

When developing with this API:

1. Use the Local environment for development
2. Start with the Login endpoint to get an access token
3. Copy the access token to the `accessToken` environment variable
4. Test other endpoints as needed

## Support

For API support or questions, please refer to the main project documentation or contact the development team.
