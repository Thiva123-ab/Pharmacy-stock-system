                                Local Pharmacy Stock and Delivery System
A full-stack web application built with Spring Boot, Java 21, Spring Security, and MySQL. This project provides a complete solution 
for managing a local pharmacy's inventory, customer orders, prescriptions, and deliveries.
This application was developed as a final project for the Spring Boot Project Assignment. It fulfills all core functional, technical, 
and non-functional requirements, including implementing features "Beyond CRUD" such as real-time updates with WebSockets and file uploads for prescriptions.




    Features
The application is built with role-based access control  for four main user types: Customer, Pharmacist, Delivery Personnel, and Admin.

    General Features

User Authentication: Secure user registration, login (Sign up, Sign in, Sign out), and logout.
Security: Secured using Spring Security and JSON Web Tokens (JWT) for stateless API authentication.
Role-Based Access: Endpoints and frontend views are protected based on user roles (e.g., customer, pharmacist, admin).

    Customer Features
Browse and search for medicines.
Upload prescription images for verification (File Uploads).
Place and manage orders (Full CRUD).
Track order and delivery status in real-time.
View order history.
Real-time chat support (via WebSockets).
Pharmacist Features
Manage the medicine inventory (Full CRUD).
View and verify customer-uploaded prescriptions.
Process and update the status of customer orders.
Assign processed orders to delivery personnel.
Manage customer information.

    Delivery Personnel Features
View a list of assigned deliveries.
Update delivery status (e.g., "Out for Delivery", "Delivered").
View delivery routes and customer details.

    Admin Features
Full user management (create, read, update, delete users and assign roles).
View system-wide analytics and generate reports.
View system audit logs.
Configure system settings.

   Meeting "Beyond CRUD" Requirements
This project implements several features beyond standard CRUD operations as specified in the assignment:
Real-time Updates (WebSocket/SSE): Implemented using Spring WebSocket to provide real-time order status updates, notifications, and a live chat feature.
File Uploads: A system for customers to upload medical prescription images. The backend handles multipart file validation and storage.
Audit Trail: An audit log service tracks significant events and data changes (e.g., order processed, inventory updated) for administrative review.

Technologies Used
Backend
Java: 21
Spring Boot: 3.5.6

    Spring Framework:
Spring Data JPA 
Spring Security 
Spring Web 
Spring WebSocket 
Spring Boot Validation 
Database: MySQL
Authentication: JWT 
Utilities: Lombok
Build Tool: Maven

    Frontend
HTML
CSS
JavaScript 

   Setup and Installation


1. Prerequisites
   Java JDK 21 or later.
   Apache Maven
   MySQL Server

2. Clone the Repository
   Bash
git clone https://github.com/Thiva123-ab/Pharmacy-stock-system.git
cd Local_Pharmacy_Stock_and_Delivery_System
3. Database Setup
   Ensure your MySQL server is running.
   Create a new database. The application is configured to use pharmacydelevarydb.

   SQL
CREATE DATABASE pharmacydelevarydb;
The application uses spring.jpa.hibernate.ddl-auto=update, so all tables will be automatically created or updated on startup.

4. Configure Application
   Open the src/main/resources/application.properties file.

Update the MySQL username and password to match your local setup.

   Properties

# Database Configuration (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/pharmacydelevarydb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
Default Username: root


5. Build and Run
   Build the project using Maven:



6. Access the Application
   The application will start on port 8080. Open  web browser and navigate to: http://localhost:8080

   Project Structure

Here is the full source code structure of My project

```
Local_Pharmacy_Stock_and_Delivery_System/
├── .gitattributes
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── ac
    │   │       └── nsbm
    │   │           └── local_pharmacy_stock_and_delivery_system
    │   │               ├── LocalPharmacyStockAndDeliverySystemApplication.java
    │   │               │
    │   │               ├── config
    │   │               │   ├── JwtAuthenticationFilter.java
    │   │               │   ├── JwtService.java
    │   │               │   ├── SecurityConfig.java
    │   │               │   ├── UserDetailsServiceImpl.java
    │   │               │   ├── WebConfig.java
    │   │               │   └── WebSocketConfig.java
    │   │               │
    │   │               ├── controller
    │   │               │   ├── AdminDashboardController.java
    │   │               │   ├── AuthController.java
    │   │               │   ├── AuditLogController.java
    │   │               │   ├── ChatController.java
    │   │               │   ├── CustomerController.java
    │   │               │   ├── CustomerDashboardController.java
    │   │               │   ├── DeliveryController.java
    │   │               │   ├── FeedbackController.java
    │   │               │   ├── InventoryController.java
    │   │               │   ├── MedicineController.java
    │   │               │   ├── NotificationController.java
    │   │               │   ├── OrderController.java
    │   │               │   ├── PrescriptionController.java
    │   │               │   ├── ReportController.java
    │   │               │   ├── SystemSettingsController.java
    │   │               │   └── UserController.java
    │   │               │
    │   │               ├── dto
    │   │               │   ├── CartItemDTO.java
    │   │               │   ├── ChatMessageDTO.java
    │   │               │   ├── ChatMessageResponseDTO.java
    │   │               │   ├── CustomerCreateDTO.java
    │   │               │   ├── CustomerDetailsDTO.java
    │   │               │   ├── DeliveryCreateDTO.java
    │   │               │   ├── FeedbackDTO.java
    │   │               │   ├── FeedbackResponseDTO.java
    │   │               │   ├── LoginDTO.java
    │   │               │   ├── OrderRequestDTO.java
    │   │               │   ├── PasswordChangeDTO.java
    │   │               │   ├── ProfileUpdateDTO.java
    │   │               │   ├── RegisterDTO.java
    │   │               │   ├── ReportFilterDTO.java
    │   │               │   └── SystemSettingsDTO.java
    │   │               │
    │   │               ├── entity
    │   │               │   ├── AppUser.java
    │   │               │   ├── AuditLog.java
    │   │               │   ├── ChatMessage.java
    │   │               │   ├── Delivery.java
    │   │               │   ├── Feedback.java
    │   │               │   ├── InventoryLog.java
    │   │               │   ├── Medicine.java
    │   │               │   ├── Notification.java
    │   │               │   ├── Order.java
    │   │               │   ├── OrderItem.java
    │   │               │   ├── PharmacySettings.java
    │   │               │   ├── Prescription.java
    │   │               │   └── Role.java
    │   │               │
    │   │               ├── exception
    │   │               │   └── GlobalExceptionHandler.java
    │   │               │
    │   │               ├── repository
    │   │               │   ├── AppUserRepository.java
    │   │               │   ├── AuditLogRepository.java
    │   │               │   ├── ChatMessageRepository.java
    │   │               │   ├── CustomerRepository.java
    │   │               │   ├── DeliveryRepository.java
    │   │               │   ├── FeedbackRepository.java
    │   │               │   ├── InventoryLogRepository.java
    │   │               │   ├── MedicineRepository.java
    │   │               │   ├── NotificationRepository.java
    │   │               │   ├── OrderItemRepository.java
    │   │               │   ├── OrderRepository.java
    │   │               │   ├── PharmacySettingsRepository.java
    │   │               │   └── PrescriptionRepository.java
    │   │               │
    │   │               └── service
    │   │                   ├── AdminDashboardService.java
    │   │                   ├── AuditLogService.java
    │   │                   ├── ChatService.java
    │   │                   ├── CustomerDashboardService.java
    │   │                   ├── CustomerService.java
    │   │                   ├── DeliveryService.java
    │   │                   ├── FeedbackService.java
    │   │                   ├── InventoryService.java
    │   │                   ├── MedicineService.java
    │   │                   ├── NotificationService.java
    │   │                   ├── OrderService.java
    │   │                   ├── PrescriptionService.java
    │   │                   ├── ReportService.java
    │   │                   ├── SystemSettingsService.java
    │   │                   └── UserService.java
    │   │
    │   └── resources
    │       ├── application.properties
    │       └── static
    │           └── frontend
    │               ├── index.html
    │               ├── login.html
    │               ├── register.html
    │               │
    │               ├── admin
    │               │   ├── analytics.html
    │               │   ├── audit-logs.html
    │               │   ├── dashboard.html
    │               │   ├── profile.html
    │               │   ├── reports.html
    │               │   ├── settings.html
    │               │   ├── system-settings.html
    │               │   ├── user-management.html
    │               │   └── js
    │               │       ├── analytics.js
    │               │       ├── audit-logs.js
    │               │       ├── dashboard.js
    │               │       ├── profile.js
    │               │       ├── reports.js
    │               │       ├── settings.js
    │               │       ├── system-settings.js
    │               │       └── user-management.js
    │               │
    │               ├── css
    │               │   ├── dashboard.css
    │               │   ├── index.css
    │               │   └── styles.css
    │               │
    │               ├── customer
    │               │   ├── browse-medicines.html
    │               │   ├── dashboard.html
    │               │   ├── feedback.html
    │               │   ├── my-orders.html
    │               │   ├── notifications.html
    │               │   ├── prescriptions.html
    │               │   ├── profile.html
    │               │   ├── settings.html
    │               │   ├── track-order.html
    │               │   └── js
    │               │       ├── browse-medicines.js
    │               │       ├── dashboard.js
    │               │       ├── feedback.js
    │               │       ├── my-orders.js
    │               │       ├── notifications.js
    │               │       ├── prescriptions.js
    │               │       ├── profile.js
    │               │       ├── settings.js
    │               │       └── track-order.js
    │               │
    │               ├── delivery
    │               │   ├── completed.html
    │               │   ├── dashboard.html
    │               │   ├── my-deliveries.html
    │               │   ├── profile.html
    │               │   ├── routes.html
    │               │   ├── settings.html
    │               │   └── js
    │               │       ├── completed.js
    │               │       ├── dashboard.js
    │               │       ├── my-deliveries.js
    │               │       ├── profile.js
    │               │       ├── routes.js
    │               │       └── settings.js
    │               │
    │               ├── js
    │               │   ├── avatar.js
    │               │   ├── config.js
    │               │   ├── index.js
    │               │   ├── login.js
    │               │   └── register.js
    │               │
    │               └── pharmacist
    │                   ├── customers.html
    │                   ├── dashboard.html
    │                   ├── deliveries.html
    │                   ├── inventory.html
    │                   ├── medicines.html
    │                   ├── orders.html
    │                   ├── prescriptions.html
    │                   ├── reports.html
    │                   ├── settings.html
    │                   └── js
    │                       ├── customers.js
    │                       ├── dashboard.js
    │                       ├── deliveries.js
    │                       ├── inventory.js
    │                       ├── medicines.js
    │                       ├── orders.js
    │                       ├── prescriptions.js
    │                       ├── reports.js
    │                       └── settings.js
    │
 
```


Team Members
[G T T Priyantha - 35274]
[G T T Priyantha - 35277]
[P.H.D Dhananjana - 34982  ]
[ M D P Fernando - 35119 ]

