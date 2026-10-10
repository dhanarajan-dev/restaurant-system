# Food Ordering & Restaurant Management System

A full-stack Spring Boot application with a **MySQL database** backend and a basic **HTML, CSS, and JavaScript** frontend implementing strict **Role-Based Access Control (RBAC)** according to your exact flow and architectural requirements.

---

## 📌 Requirements Implemented

1. **Spring Boot Main Class**:
   - In [`RestaurantApplication.java`](src/main/java/com/restaurant/RestaurantApplication.java), the `main()` method contains **only** `SpringApplication.run(RestaurantApplication.class, args);`. No other method calls exist inside `main()`.
   - Data pre-population is cleanly handled in a separate Spring [`DataInitializer`](src/main/java/com/restaurant/config/DataInitializer.java) component.

2. **MySQL Database Storage**:
   - All data is persisted directly in **MySQL** (`restaurantdb`):
     - **User registration & login details** (`users` table)
     - **Restaurant details** (`restaurants` table)
     - **Food item details** (`food_items` table)
     - **Customer placed orders** (`restaurant_orders` table)

3. **Strict Role-Based Access Control (RBAC)**:
   - **USER**: Has access **ONLY** to the **Food Item List** (and the checkout Summary to place orders). Access to the Admin view is strictly forbidden.
   - **ADMIN**: Has access **ONLY** to the **Restaurant Details (Admin View)** (managing restaurant info, menu food items CRUD, and placed orders). Access to the customer ordering flow is strictly restricted.
   - RBAC is enforced both on the **Frontend** (dynamic navigation, permission guards, access blocking alerts) and on the **Backend REST API** (HTTP 403 Forbidden checks via `X-User-Role`).

---

## 🗄️ MySQL Database Configuration

Configure in [`src/main/resources/application.properties`](src/main/resources/application.properties):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/restaurantdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=Dhanaraj@1727

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### MySQL Tables Automatically Created:
- `users`: `id`, `username` (unique), `password`, `email`, `role` (`USER` or `ADMIN`), `restaurant_name`, `location`, `phone`
- `restaurants`: `id`, `name`, `location`, `phone`
- `food_items`: `id`, `name`, `price`, `restaurant_id`, `restaurant_name`
- `restaurant_orders`: `restaurant_id`, `order_data`

---

## 📁 Package & File Structure

```
d:/project/
├── pom.xml
├── mvnw.cmd / mvnw
└── src/main/
    ├── java/com/restaurant/
    │   ├── RestaurantApplication.java  <-- main() contains ONLY SpringApplication.run()
    │   │
    │   ├── config/
    │   │   └── DataInitializer.java
    │   │
    │   ├── controller/
    │   │   ├── RestaurantController.java
    │   │   ├── FoodItemController.java
    │   │   └── UserController.java
    │   │
    │   ├── model/
    │   │   ├── RestaurantModel.java
    │   │   ├── FoodItemModel.java
    │   │   └── UserModel.java
    │   │
    │   ├── repository/
    │   │   ├── RestaurantRepository.java
    │   │   ├── FoodItemRepository.java
    │   │   └── UserRepository.java
    │   │
    │   └── service/
    │       ├── RestaurantService.java
    │       ├── FoodItemService.java
    │       └── UserService.java
    │
    └── resources/
        ├── application.properties
        └── static/
            ├── index.html
            ├── css/style.css
            └── js/app.js
```

---

## 🛡️ Default Login Credentials (Stored in MySQL)

| Role | Username | Password | Allowed Access |
|---|---|---|---|
| **USER** | `user1` | `pass123` | **ONLY** Food Item List & Summary |
| **ADMIN** | `admin` | `admin123` | **ONLY** Restaurant Details (Admin View) |

---

## 🏃 How to Run

1. Make sure MySQL service is running on port 3306.
2. In PowerShell / Command Prompt:
   ```powershell
   cd d:\project
   .\mvnw.cmd spring-boot:run
   ```
   Or run the pre-built JAR:
   ```powershell
   java -jar target\restaurant-system-0.0.1-SNAPSHOT.jar
   ```
3. Open your browser and navigate to:
   ```
   http://localhost:8080/
   ```
