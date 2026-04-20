# Owner Module

The Owner module provides administrative tools for managing store properties and staff members. Access to these endpoints is generally restricted to users with the 'owner' role.

## Modules

### Store Management
Allows owners to update their establishment's details.
- **Workflow**:
  - `POST /owner/update/store`: Updates store name, address, category, currency, capacity (tables), coordinates, and operating hours.

### Employee Management
Allows owners to onboard and manage staff members.
- **Workflow**:
  - `POST /owner/create/employee`: Registers a new employee and links them to the owner's store. Role is defaulted to 'staff'.
  - `POST /owner/update/employee`: Updates an employee's profile information.

## Sample Responses

### Store Updated
```json
{
  "status": 200,
  "message": "Store updated successfully.",
  "data": {
    "storeId": "store-uuid"
  }
}
```

### Employee Registered
```json
{
  "status": 200,
  "message": "Employee registration successful",
  "data": {
    "storeId": "store-uuid"
  }
}
```

### Error: Resource Not Found
```json
{
  "status": 404,
  "message": "Store not found.",
  "data": {}
}
```
